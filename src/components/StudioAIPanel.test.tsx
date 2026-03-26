import '@testing-library/jest-dom/vitest';
import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StudioAIPanel } from './StudioAIPanel';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? _key,
  }),
}));

vi.mock('./command-bar/useAIViewState', () => ({
  useAIViewState: () => ({
    prompt: 'Add Redis between API and DB',
    setPrompt: vi.fn(),
    selectedImage: null,
    setSelectedImage: vi.fn(),
    fileInputRef: createRef<HTMLInputElement>(),
    scrollRef: createRef<HTMLDivElement>(),
    handleGenerate: vi.fn(),
    handleKeyDown: vi.fn(),
    handleImageSelect: vi.fn(),
  }),
}));

describe('StudioAIPanel', () => {
  it('keeps submission disabled when AI is not configured without rendering readiness chrome', () => {
    render(
      <StudioAIPanel
        onAIGenerate={vi.fn().mockResolvedValue(false)}
        isGenerating={false}
        streamingText={null}
        retryCount={0}
        onCancelGeneration={vi.fn()}
        pendingDiff={null}
        onConfirmDiff={vi.fn()}
        onDiscardDiff={vi.fn()}
        aiReadiness={{
          canGenerate: false,
          blockingIssue: {
            tone: 'error',
            title: 'OpenAI is not ready yet',
            detail: 'Add your OpenAI API key in Settings before generating.',
          },
          advisory: null,
        }}
        lastError={null}
        onClearError={vi.fn()}
        chatMessages={[]}
        onClearChat={vi.fn()}
        nodeCount={3}
        selectedNodeCount={0}
      />
    );

    expect(screen.queryByText('OpenAI is not ready yet')).not.toBeInTheDocument();
    expect(screen.queryByText('Add your OpenAI API key in Settings before generating.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate with Flowpilot' })).toBeDisabled();
  });

  it('removes the inline create/edit explainer copy', () => {
    const onClearError = vi.fn();

    render(
      <StudioAIPanel
        onAIGenerate={vi.fn().mockResolvedValue(false)}
        isGenerating={false}
        streamingText={null}
        retryCount={0}
        onCancelGeneration={vi.fn()}
        pendingDiff={null}
        onConfirmDiff={vi.fn()}
        onDiscardDiff={vi.fn()}
        aiReadiness={{
          canGenerate: true,
          blockingIssue: null,
          advisory: null,
        }}
        lastError="The provider rejected this request."
        onClearError={onClearError}
        chatMessages={[]}
        onClearChat={vi.fn()}
        nodeCount={1}
        selectedNodeCount={0}
      />
    );

    expect(screen.queryByText(/Create mode replaces the canvas/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Describe one concrete change at a time/i)).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Update auth service' } });
    expect(onClearError).toHaveBeenCalledTimes(1);
  });
});

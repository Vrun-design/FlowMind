import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAIViewState } from './useAIViewState';

function createHook(onAIGenerate: (prompt: string, imageBase64?: string) => Promise<boolean>) {
  return renderHook(() =>
    useAIViewState({
      searchQuery: '',
      isGenerating: false,
      onAIGenerate,
      onClose: vi.fn(),
      chatMessageCount: 0,
    })
  );
}

describe('useAIViewState', () => {
  it('clears prompt after a successful generation', async () => {
    const onAIGenerate = vi.fn().mockResolvedValue(true);
    const hook = createHook(onAIGenerate);

    act(() => {
      hook.result.current.setPrompt('Add Redis');
    });

    await act(async () => {
      await hook.result.current.handleGenerate();
    });

    expect(onAIGenerate).toHaveBeenCalledWith('Add Redis', undefined);
    expect(hook.result.current.prompt).toBe('');
  });

  it('keeps the prompt when generation is rejected by preflight or request failure', async () => {
    const onAIGenerate = vi.fn().mockResolvedValue(false);
    const hook = createHook(onAIGenerate);

    act(() => {
      hook.result.current.setPrompt('Add Redis');
    });

    await act(async () => {
      await hook.result.current.handleGenerate();
    });

    expect(onAIGenerate).toHaveBeenCalledWith('Add Redis', undefined);
    expect(hook.result.current.prompt).toBe('Add Redis');
  });
});

import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InfraSyncPanel } from './InfraSyncPanel';

vi.mock('@/hooks/useInfraSync', () => ({
  useInfraSync: () => ({
    result: null,
    dsl: null,
    isParsing: false,
    error: null,
    parse: vi.fn(async () => undefined),
    refresh: vi.fn(async () => undefined),
    reset: vi.fn(),
  }),
}));

describe('InfraSyncPanel', () => {
  it('marks the active format tab as pressed and updates selection', () => {
    render(
      <InfraSyncPanel
        onApplyDsl={vi.fn()}
        onTerraformAnalysis={vi.fn(async () => undefined)}
      />
    );

    const tfStateButton = screen.getByRole('button', { name: 'TF State' });
    const hclButton = screen.getByRole('button', { name: 'HCL' });

    expect(tfStateButton).toHaveAttribute('aria-pressed', 'true');
    expect(hclButton).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(hclButton);

    expect(screen.getByRole('button', { name: 'HCL' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'TF State' })).toHaveAttribute('aria-pressed', 'false');
  });
});

import { render, screen } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFlowStore } from '@/store';
import ArchitectureNode from './ArchitectureNode';

vi.mock('@/config/rolloutFlags', () => ({
  ROLLOUT_FLAGS: {
    visualQualityV2: true,
  },
}));

vi.mock('@/lib/reactflowCompat', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/reactflowCompat')>();

  return {
    ...actual,
    Handle: ({
      className,
      style,
      id,
    }: {
      className?: string;
      style?: CSSProperties;
      id?: string;
    }) => (
      <div
        data-testid={`handle-${id ?? 'unknown'}`}
        data-class={className ?? ''}
        data-pointer={String(style?.pointerEvents ?? '')}
      />
    ),
    Position: {
      Top: 'top',
      Right: 'right',
      Bottom: 'bottom',
      Left: 'left',
    },
  };
});

describe('ArchitectureNode handle interaction policy', () => {
  beforeEach(() => {
    useFlowStore.setState({
      nodes: [],
      edges: [],
    });
  });

  it('keeps selected handles interactive in visualQualityV2', () => {
    render(
      <ArchitectureNode
        id="arch-1"
        type="architecture"
        selected={true}
        dragging={false}
        zIndex={1}
        data={{ label: 'API', archProvider: 'aws', archResourceType: 'service' }}
        isConnectable={true}
        xPos={0}
        yPos={0}
      />
    );

    for (const handleId of ['top', 'left', 'right', 'bottom']) {
      const handle = screen.getByTestId(`handle-${handleId}`);
      expect(handle.getAttribute('data-pointer')).toBe('all');
    }
  });

  it('keeps hit-area class and pointer events enabled while not selected', () => {
    render(
      <ArchitectureNode
        id="arch-2"
        type="architecture"
        selected={false}
        dragging={false}
        zIndex={1}
        data={{ label: 'DB', archProvider: 'custom', archResourceType: 'service' }}
        isConnectable={true}
        xPos={0}
        yPos={0}
      />
    );

    for (const handleId of ['top', 'left', 'right', 'bottom']) {
      const handle = screen.getByTestId(`handle-${handleId}`);
      expect(handle.getAttribute('data-class')).toContain('flow-handle-hitarea');
      expect(handle.getAttribute('data-pointer')).toBe('all');
    }
  });

  it('exposes transform diagnostics min-height guard', () => {
    const { container } = render(
      <ArchitectureNode
        id="arch-3"
        type="architecture"
        selected={false}
        dragging={false}
        zIndex={1}
        data={{ label: 'Gateway', archEnvironment: 'prod' }}
        isConnectable={true}
        xPos={0}
        yPos={0}
      />
    );

    const diagnosticsNode = container.querySelector('[data-transform-family="architecture"]');
    expect(diagnosticsNode).not.toBeNull();
    expect(Number(diagnosticsNode?.getAttribute('data-transform-min-height') ?? '0')).toBeGreaterThanOrEqual(96);
  });
});

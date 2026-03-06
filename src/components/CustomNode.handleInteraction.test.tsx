import { render, screen } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Position } from '@/lib/reactflowCompat';
import { DEFAULT_DESIGN_SYSTEM, useFlowStore } from '@/store';
import CustomNode from './CustomNode';

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
    NodeResizer: () => null,
    NodeResizeControl: () => null,
    Position: {
      Top: 'top',
      Right: 'right',
      Bottom: 'bottom',
      Left: 'left',
    },
  };
});

describe('CustomNode handle interaction policy', () => {
  beforeEach(() => {
    useFlowStore.setState({
      designSystems: [DEFAULT_DESIGN_SYSTEM],
      activeDesignSystemId: 'default',
    });
  });

  it('keeps selected handles interactive in visualQualityV2', () => {
    render(
      <CustomNode
        id="n1"
        type="process"
        selected={true}
        dragging={false}
        zIndex={1}
        data={{ label: 'Node A' }}
        isConnectable={true}
        xPos={0}
        yPos={0}
        sourcePosition={Position.Right}
        targetPosition={Position.Left}
      />
    );

    for (const handleId of ['top', 'bottom', 'left', 'right']) {
      const handle = screen.getByTestId(`handle-${handleId}`);
      expect(handle.getAttribute('data-pointer')).toBe('all');
    }
  });

  it('keeps hit-area class and pointer events enabled while not selected', () => {
    render(
      <CustomNode
        id="n2"
        type="process"
        selected={false}
        dragging={false}
        zIndex={1}
        data={{ label: 'Node B' }}
        isConnectable={true}
        xPos={0}
        yPos={0}
        sourcePosition={Position.Right}
        targetPosition={Position.Left}
      />
    );

    for (const handleId of ['top', 'bottom', 'left', 'right']) {
      const handle = screen.getByTestId(`handle-${handleId}`);
      expect(handle.getAttribute('data-class')).toContain('flow-handle-hitarea');
      expect(handle.getAttribute('data-pointer')).toBe('all');
    }
  });

  it('exposes transform diagnostics attributes in test mode', () => {
    const { container } = render(
      <CustomNode
        id="n3"
        type="process"
        selected={false}
        dragging={false}
        zIndex={1}
        data={{ label: 'Diagnostics Node', subLabel: 'Sub', icon: 'Settings' }}
        isConnectable={true}
        xPos={0}
        yPos={0}
        sourcePosition={Position.Right}
        targetPosition={Position.Left}
      />
    );

    const diagnosticsNode = container.querySelector('[data-transform-diagnostics="1"]');
    expect(diagnosticsNode).not.toBeNull();
    expect(diagnosticsNode?.getAttribute('data-transform-family')).toBe('custom');
  });
});

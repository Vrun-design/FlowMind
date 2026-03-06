import { render, screen } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { describe, expect, it, vi } from 'vitest';
import TextNode from './TextNode';
import MindmapNode from './custom-nodes/MindmapNode';
import { Position } from '@/lib/reactflowCompat';

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
      position,
      type,
    }: {
      className?: string;
      style?: CSSProperties;
      id?: string;
      position?: string;
      type?: string;
    }) => (
      <div
        data-testid={`handle-${id ?? `${type}-${position}`}`}
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

describe('lightweight node handle interaction policy', () => {
  it('keeps selected TextNode handles connectable in visualQualityV2', () => {
    render(
      <TextNode
        id="text-1"
        type="text"
        selected={true}
        dragging={false}
        zIndex={1}
        data={{ label: 'Hello' }}
        isConnectable={true}
        xPos={0}
        yPos={0}
        sourcePosition={Position.Right}
        targetPosition={Position.Left}
      />
    );

    for (const handleId of ['target-top', 'target-left', 'source-right', 'source-bottom']) {
      const handle = screen.getByTestId(`handle-${handleId}`);
      expect(handle.getAttribute('data-pointer')).toBe('all');
    }
  });

  it('keeps unselected TextNode handles discoverable', () => {
    render(
      <TextNode
        id="text-2"
        type="text"
        selected={false}
        dragging={false}
        zIndex={1}
        data={{ label: 'Hello' }}
        isConnectable={true}
        xPos={0}
        yPos={0}
        sourcePosition={Position.Right}
        targetPosition={Position.Left}
      />
    );

    for (const handleId of ['target-top', 'target-left', 'source-right', 'source-bottom']) {
      const handle = screen.getByTestId(`handle-${handleId}`);
      expect(handle.getAttribute('data-class')).toContain('flow-handle-hitarea');
      expect(handle.getAttribute('data-pointer')).toBe('all');
    }
  });

  it('keeps selected MindmapNode handles connectable in visualQualityV2', () => {
    render(
      <MindmapNode
        id="mindmap-1"
        type="mindmap"
        selected={true}
        dragging={false}
        zIndex={1}
        data={{ label: 'Root', mindmapDepth: 0 }}
        isConnectable={true}
        xPos={0}
        yPos={0}
      />
    );

    for (const handleId of ['left-target', 'right-source']) {
      const handle = screen.getByTestId(`handle-${handleId}`);
      expect(handle.getAttribute('data-pointer')).toBe('all');
    }
  });

  it('keeps unselected MindmapNode handles discoverable', () => {
    render(
      <MindmapNode
        id="mindmap-2"
        type="mindmap"
        selected={false}
        dragging={false}
        zIndex={1}
        data={{ label: 'Child', mindmapDepth: 1 }}
        isConnectable={true}
        xPos={0}
        yPos={0}
      />
    );

    for (const handleId of ['left-target', 'right-source']) {
      const handle = screen.getByTestId(`handle-${handleId}`);
      expect(handle.getAttribute('data-class')).toContain('flow-handle-hitarea');
      expect(handle.getAttribute('data-pointer')).toBe('all');
    }
  });
});

import { render, screen } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Position } from '@/lib/reactflowCompat';
import BrowserNode from './BrowserNode';
import MobileNode from './MobileNode';
import JourneyNode from './JourneyNode';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

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

function assertSelectedConnectableHandles(): void {
  for (const handleId of ['top', 'bottom', 'left', 'right']) {
    const handle = screen.getByTestId(`handle-${handleId}`);
    expect(handle.getAttribute('data-pointer')).toBe('all');
  }
}

function assertUnselectedDiscoverableHandles(): void {
  for (const handleId of ['top', 'bottom', 'left', 'right']) {
    const handle = screen.getByTestId(`handle-${handleId}`);
    expect(handle.getAttribute('data-class')).toContain('flow-handle-hitarea');
    expect(handle.getAttribute('data-pointer')).toBe('all');
  }
}

describe('visual-heavy node handle interaction policy', () => {
  it('keeps selected BrowserNode handles connectable in visualQualityV2', () => {
    render(
      <BrowserNode
        id="browser-1"
        type="browser"
        selected={true}
        dragging={false}
        zIndex={1}
        data={{ label: 'Browser', variant: 'dashboard', color: 'slate' }}
        isConnectable={true}
        xPos={0}
        yPos={0}
        sourcePosition={Position.Right}
        targetPosition={Position.Left}
      />
    );

    assertSelectedConnectableHandles();
  });

  it('keeps unselected BrowserNode handles discoverable', () => {
    render(
      <BrowserNode
        id="browser-2"
        type="browser"
        selected={false}
        dragging={false}
        zIndex={1}
        data={{ label: 'Browser', variant: 'dashboard', color: 'slate' }}
        isConnectable={true}
        xPos={0}
        yPos={0}
        sourcePosition={Position.Right}
        targetPosition={Position.Left}
      />
    );

    assertUnselectedDiscoverableHandles();
  });

  it('keeps selected MobileNode handles connectable in visualQualityV2', () => {
    render(
      <MobileNode
        id="mobile-1"
        type="mobile"
        selected={true}
        dragging={false}
        zIndex={1}
        data={{ label: 'Mobile', variant: 'chat', color: 'slate' }}
        isConnectable={true}
        xPos={0}
        yPos={0}
        sourcePosition={Position.Right}
        targetPosition={Position.Left}
      />
    );

    assertSelectedConnectableHandles();
  });

  it('keeps unselected MobileNode handles discoverable', () => {
    render(
      <MobileNode
        id="mobile-2"
        type="mobile"
        selected={false}
        dragging={false}
        zIndex={1}
        data={{ label: 'Mobile', variant: 'chat', color: 'slate' }}
        isConnectable={true}
        xPos={0}
        yPos={0}
        sourcePosition={Position.Right}
        targetPosition={Position.Left}
      />
    );

    assertUnselectedDiscoverableHandles();
  });

  it('keeps selected JourneyNode handles connectable in visualQualityV2', () => {
    render(
      <JourneyNode
        id="journey-1"
        type="journey"
        selected={true}
        dragging={false}
        zIndex={1}
        data={{ label: 'Step', subLabel: 'Actor', journeySection: 'A', journeyScore: 3 }}
        isConnectable={true}
        xPos={0}
        yPos={0}
      />
    );

    assertSelectedConnectableHandles();
  });

  it('keeps unselected JourneyNode handles discoverable', () => {
    render(
      <JourneyNode
        id="journey-2"
        type="journey"
        selected={false}
        dragging={false}
        zIndex={1}
        data={{ label: 'Step', subLabel: 'Actor', journeySection: 'A', journeyScore: 3 }}
        isConnectable={true}
        xPos={0}
        yPos={0}
      />
    );

    assertUnselectedDiscoverableHandles();
  });
});

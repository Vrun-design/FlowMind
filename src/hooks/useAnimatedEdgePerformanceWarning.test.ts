import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlowEdge } from '@/lib/types';
import { useAnimatedEdgePerformanceWarning } from './useAnimatedEdgePerformanceWarning';

const addToast = vi.fn();

vi.mock('@/components/ui/ToastContext', () => ({
  useToast: () => ({
    addToast,
  }),
}));

function createEdge(id: string, animated: boolean): FlowEdge {
  return {
    id,
    source: 'n1',
    target: 'n2',
    animated,
  };
}

describe('useAnimatedEdgePerformanceWarning', () => {
  beforeEach(() => {
    addToast.mockReset();
  });

  it('shows warning once when node count crosses threshold and animated edges exist', () => {
    const { rerender } = renderHook(
      ({ nodeCount, edges }) =>
        useAnimatedEdgePerformanceWarning({
          nodeCount,
          edges,
        }),
      {
        initialProps: {
          nodeCount: 99,
          edges: [createEdge('e1', true)],
        },
      }
    );

    expect(addToast).not.toHaveBeenCalled();

    rerender({
      nodeCount: 100,
      edges: [createEdge('e1', true)],
    });

    expect(addToast).toHaveBeenCalledTimes(1);

    rerender({
      nodeCount: 140,
      edges: [createEdge('e1', true)],
    });

    expect(addToast).toHaveBeenCalledTimes(1);
  });

  it('does not show warning when connectors are not animated', () => {
    renderHook(() =>
      useAnimatedEdgePerformanceWarning({
        nodeCount: 160,
        edges: [createEdge('e1', false)],
      })
    );

    expect(addToast).not.toHaveBeenCalled();
  });
});

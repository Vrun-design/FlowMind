import { useEffect, useRef } from 'react';
import type { FlowEdge } from '@/lib/types';
import { useToast } from '@/components/ui/ToastContext';

const NODE_WARNING_THRESHOLD = 100;
const NODE_WARNING_RESET_THRESHOLD = 80;

interface UseAnimatedEdgePerformanceWarningOptions {
  nodeCount: number;
  edges: FlowEdge[];
}

export function useAnimatedEdgePerformanceWarning({
  nodeCount,
  edges,
}: UseAnimatedEdgePerformanceWarningOptions): void {
  const { addToast } = useToast();
  const warnedRef = useRef(false);

  useEffect(() => {
    if (nodeCount < NODE_WARNING_RESET_THRESHOLD) {
      warnedRef.current = false;
    }

    if (nodeCount < NODE_WARNING_THRESHOLD || warnedRef.current) {
      return;
    }

    const hasAnimatedEdges = edges.some((edge) => edge.animated === true);
    if (!hasAnimatedEdges) {
      return;
    }

    warnedRef.current = true;
    addToast(
      'Performance tip: 100+ nodes detected. Animated connectors can cause jitter; turn them off for smoother dragging.',
      'warning',
      7000
    );
  }, [nodeCount, edges, addToast]);
}

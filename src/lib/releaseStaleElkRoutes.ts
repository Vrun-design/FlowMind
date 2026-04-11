import type { FlowEdge } from '@/lib/types';
import { clearStoredRouteData } from '@/lib/edgeRouteData';

export function releaseStaleElkRoutesForNodeIds(
  edges: FlowEdge[],
  movedNodeIds: Set<string>
): FlowEdge[] {
  let changed = false;

  const nextEdges = edges.map((edge) => {
    if (!movedNodeIds.has(edge.source) && !movedNodeIds.has(edge.target)) {
      return edge;
    }

    if (edge.data?.routingMode === 'manual') {
      return edge;
    }

    const hasStoredAutoRoute =
      (edge.data?.elkPoints?.length ?? 0) > 0
      || (edge.data?.importRoutePoints?.length ?? 0) > 0
      || typeof edge.data?.importRoutePath === 'string'
      || edge.data?.routingMode === 'elk'
      || edge.data?.routingMode === 'import-fixed';

    if (!hasStoredAutoRoute) {
      return edge;
    }

    changed = true;
    return {
      ...edge,
      data: clearStoredRouteData(edge),
    };
  });

  return changed ? nextEdges : edges;
}

import type { EdgeData, FlowEdge } from '@/lib/types';
import { downgradeMermaidImportedEdgeMetadata } from '@/services/mermaid/importProvenance';

export function clearStoredRouteData(edge: FlowEdge): EdgeData {
  return {
    ...downgradeMermaidImportedEdgeMetadata(edge),
    routingMode: 'auto' as const,
    elkPoints: undefined,
    importRoutePoints: undefined,
    importRoutePath: undefined,
    waypoint: undefined,
    waypoints: undefined,
  };
}

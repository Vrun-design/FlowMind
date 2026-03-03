import type { Edge } from 'reactflow';
import type { ViewSettings } from '@/store/types';

const LARGE_GRAPH_NODE_THRESHOLD = 100;
const LOW_DETAIL_ZOOM_THRESHOLD = 0.5;
const FAR_ZOOM_REDUCTION_THRESHOLD = 0.4;
export const INTERACTION_LOD_COOLDOWN_MS = 180;

export function isLargeGraphSafetyActive(
  nodeCount: number,
  _edgeCount: number,
  mode: ViewSettings['largeGraphSafetyMode']
): boolean {
  if (mode === 'on') return true;
  if (mode === 'off') return false;
  return nodeCount >= LARGE_GRAPH_NODE_THRESHOLD;
}

export function getSafetyAdjustedEdges(edges: Edge[], safetyActive: boolean): Edge[] {
  if (!safetyActive) return edges;

  let changed = false;
  const adjusted = edges.map((edge) => {
    if (!edge.animated) return edge;
    changed = true;
    return { ...edge, animated: false };
  });

  return changed ? adjusted : edges;
}

export function shouldEnableViewportCulling(safetyActive: boolean): boolean {
  return safetyActive;
}

export function isLowDetailModeActive(safetyActive: boolean, zoom: number): boolean {
  if (!safetyActive) return false;
  return zoom <= LOW_DETAIL_ZOOM_THRESHOLD;
}

export function isInteractionLowDetailModeActive(
  safetyActive: boolean,
  isInteracting: boolean
): boolean {
  if (!safetyActive) return false;
  return isInteracting;
}

export function isFarZoomReductionActive(safetyActive: boolean, zoom: number): boolean {
  if (!safetyActive) return false;
  return zoom <= FAR_ZOOM_REDUCTION_THRESHOLD;
}

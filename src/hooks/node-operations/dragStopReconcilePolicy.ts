const LARGE_GRAPH_RECONCILE_ELEMENT_THRESHOLD = 1200;
const LARGE_GRAPH_RECONCILE_DEBOUNCE_MS = 80;

export function getDragStopReconcileDelayMs(nodeCount: number, edgeCount: number): number {
  const totalElements = nodeCount + edgeCount;
  if (totalElements >= LARGE_GRAPH_RECONCILE_ELEMENT_THRESHOLD) {
    return LARGE_GRAPH_RECONCILE_DEBOUNCE_MS;
  }
  return 0;
}

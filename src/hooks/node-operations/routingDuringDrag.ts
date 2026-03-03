import type { Edge, Node } from 'reactflow';
import { assignSmartHandles } from '@/services/smartEdgeRouting';

export function rerouteConnectedEdgesDuringDrag(
  allNodes: Node[],
  allEdges: Edge[],
  draggedNodes: Node[]
): Edge[] {
  if (allEdges.length === 0 || draggedNodes.length === 0) {
    return allEdges;
  }

  const draggedIds = new Set(draggedNodes.map((node) => node.id));
  const draggedNodeMap = new Map(draggedNodes.map((node) => [node.id, node]));
  const mergedNodes = allNodes.map((node) => draggedNodeMap.get(node.id) || node);
  const affectedEdges = allEdges.filter(
    (edge) => draggedIds.has(edge.source) || draggedIds.has(edge.target)
  );

  if (affectedEdges.length === 0) {
    return allEdges;
  }

  const reroutedEdges = assignSmartHandles(mergedNodes, affectedEdges);
  const reroutedById = new Map(reroutedEdges.map((edge) => [edge.id, edge]));
  let hasChanges = false;

  const nextEdges = allEdges.map((edge) => {
    const rerouted = reroutedById.get(edge.id);
    if (!rerouted) {
      return edge;
    }
    if (rerouted !== edge) {
      hasChanges = true;
    }
    return rerouted;
  });

  return hasChanges ? nextEdges : allEdges;
}

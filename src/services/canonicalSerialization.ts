import type { Edge, Node } from 'reactflow';

type NodeWithParent = Node & { parentId?: string };
export type ExportSerializationMode = 'deterministic' | 'legacy';

function getParentRef(node: NodeWithParent): string {
  if (typeof node.parentNode === 'string' && node.parentNode.length > 0) return node.parentNode;
  if (typeof node.parentId === 'string' && node.parentId.length > 0) return node.parentId;
  return '';
}

export function sortNodesCanonical<T extends Node>(nodes: T[]): T[] {
  return [...nodes].sort((a, b) => {
    const parentA = getParentRef(a as NodeWithParent);
    const parentB = getParentRef(b as NodeWithParent);
    if (parentA !== parentB) return parentA.localeCompare(parentB);
    return a.id.localeCompare(b.id);
  });
}

export function sortEdgesCanonical<T extends Edge>(edges: T[]): T[] {
  return [...edges].sort((a, b) => {
    if (a.source !== b.source) return a.source.localeCompare(b.source);
    if (a.target !== b.target) return a.target.localeCompare(b.target);
    return a.id.localeCompare(b.id);
  });
}

export function orderGraphForSerialization<TNode extends Node, TEdge extends Edge>(
  nodes: TNode[],
  edges: TEdge[],
  mode: ExportSerializationMode
): { nodes: TNode[]; edges: TEdge[] } {
  if (mode === 'legacy') {
    return {
      nodes: [...nodes],
      edges: [...edges],
    };
  }

  return {
    nodes: sortNodesCanonical(nodes),
    edges: sortEdgesCanonical(edges),
  };
}

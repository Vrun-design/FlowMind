import type { Connection } from '@/lib/reactflowCompat';
import type { FlowEdge, FlowNode } from '@/lib/types';

export const DEFAULT_SEQUENCE_MESSAGE_LABEL = 'Message';

function isSequenceParticipantNode(node: FlowNode | undefined): node is FlowNode {
  return node?.type === 'sequence_participant';
}

function isSequenceMessageEdge(edge: FlowEdge): boolean {
  return edge.type === 'sequence_message';
}

function getSequenceParticipantKind(node: FlowNode | undefined): 'participant' | 'actor' {
  return node?.data.seqParticipantKind === 'actor' ? 'actor' : 'participant';
}

export function getNextSequenceMessageOrder(edges: FlowEdge[]): number {
  return edges.reduce((maxOrder, edge) => {
    if (!isSequenceMessageEdge(edge)) {
      return maxOrder;
    }

    const order = typeof edge.data?.seqMessageOrder === 'number' ? edge.data.seqMessageOrder : -1;
    return Math.max(maxOrder, order);
  }, -1) + 1;
}

export function isSequenceConnection(
  sourceNode: FlowNode | undefined,
  targetNode: FlowNode | undefined,
  connection: Connection
): boolean {
  return Boolean(
    isSequenceParticipantNode(sourceNode)
      && isSequenceParticipantNode(targetNode)
      && connection.source
      && connection.target
  );
}

export function buildSequenceMessageEdge(
  connection: Connection,
  sourceNode: FlowNode,
  targetNode: FlowNode,
  existingEdges: FlowEdge[],
  defaultLabel = DEFAULT_SEQUENCE_MESSAGE_LABEL
): FlowEdge {
  const nextOrder = getNextSequenceMessageOrder(existingEdges);

  return {
    id: `e-seq-${connection.source}-${connection.target}-${nextOrder}`,
    source: connection.source!,
    target: connection.target!,
    sourceHandle: 'top',
    targetHandle: 'top',
    type: 'sequence_message',
    label: defaultLabel,
    data: {
      seqMessageKind: 'sync',
      seqMessageOrder: nextOrder,
      sourceIsActor: getSequenceParticipantKind(sourceNode) === 'actor',
      targetIsActor: getSequenceParticipantKind(targetNode) === 'actor',
    },
  } as FlowEdge;
}

export function syncSequenceEdgeParticipantKinds(nodes: FlowNode[], edges: FlowEdge[]): FlowEdge[] {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  let changed = false;

  const nextEdges = edges.map((edge) => {
    if (!isSequenceMessageEdge(edge)) {
      return edge;
    }

    const sourceKind = getSequenceParticipantKind(nodeById.get(edge.source));
    const targetKind = getSequenceParticipantKind(nodeById.get(edge.target));
    const nextData = {
      ...edge.data,
      sourceIsActor: sourceKind === 'actor',
      targetIsActor: targetKind === 'actor',
    };

    if (
      edge.data?.sourceIsActor === nextData.sourceIsActor
      && edge.data?.targetIsActor === nextData.targetIsActor
    ) {
      return edge;
    }

    changed = true;
    return {
      ...edge,
      data: nextData,
    };
  });

  return changed ? nextEdges : edges;
}

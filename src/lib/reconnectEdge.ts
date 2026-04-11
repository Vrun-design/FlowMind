import type { Connection } from '@/lib/reactflowCompat';
import type { FlowEdge, FlowNode } from '@/lib/types';
import { clearStoredRouteData } from '@/lib/edgeRouteData';
import { normalizeNodeHandleId } from '@/lib/nodeHandles';

export function buildReconnectedEdge(
  oldEdge: FlowEdge,
  newConnection: Connection,
  nodes: FlowNode[]
): FlowEdge {
  const nextSourceId = newConnection.source || oldEdge.source;
  const nextTargetId = newConnection.target || oldEdge.target;
  const sourceNode = nodes.find((node) => node.id === nextSourceId);
  const targetNode = nodes.find((node) => node.id === nextTargetId);

  const nextSourceHandleInput =
    newConnection.sourceHandle
    ?? (nextSourceId === oldEdge.source ? oldEdge.sourceHandle ?? null : null);
  const nextTargetHandleInput =
    newConnection.targetHandle
    ?? (nextTargetId === oldEdge.target ? oldEdge.targetHandle ?? null : null);

  return {
    ...oldEdge,
    source: nextSourceId,
    target: nextTargetId,
    sourceHandle: normalizeNodeHandleId(sourceNode, nextSourceHandleInput),
    targetHandle: normalizeNodeHandleId(targetNode, nextTargetHandleInput),
    data: clearStoredRouteData(oldEdge),
  };
}

export function shouldRespectExplicitReconnectHandles(connection: Connection): boolean {
  return !!connection.sourceHandle && !!connection.targetHandle;
}

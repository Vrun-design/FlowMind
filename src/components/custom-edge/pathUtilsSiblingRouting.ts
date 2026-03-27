import type { MinimalEdge, MinimalNode } from './pathUtilsTypes';

const NODE_LOOKUP_CACHE = new WeakMap<MinimalNode[], Map<string, MinimalNode>>();
const PARALLEL_EDGE_GROUP_CACHE = new WeakMap<MinimalEdge[], Map<string, MinimalEdge[]>>();
const ENDPOINT_SIBLING_CACHE = new WeakMap<MinimalEdge[], WeakMap<MinimalNode[], Map<string, MinimalEdge[]>>>();

function getNodeLookup(allNodes: MinimalNode[]): Map<string, MinimalNode> {
  let lookup = NODE_LOOKUP_CACHE.get(allNodes);
  if (!lookup) {
    lookup = new Map(allNodes.map((node) => [node.id, node]));
    NODE_LOOKUP_CACHE.set(allNodes, lookup);
  }
  return lookup;
}

function getParallelEdgeGroups(allEdges: MinimalEdge[]): Map<string, MinimalEdge[]> {
  let groups = PARALLEL_EDGE_GROUP_CACHE.get(allEdges);
  if (!groups) {
    groups = new Map<string, MinimalEdge[]>();
    for (const edge of allEdges) {
      const key = edge.source < edge.target
        ? `${edge.source}|${edge.target}`
        : `${edge.target}|${edge.source}`;
      const bucket = groups.get(key);
      if (bucket) {
        bucket.push(edge);
      } else {
        groups.set(key, [edge]);
      }
    }
    PARALLEL_EDGE_GROUP_CACHE.set(allEdges, groups);
  }
  return groups;
}

function getRemoteNodeAxisValueFromLookup(
  nodeLookup: Map<string, MinimalNode>,
  edge: MinimalEdge,
  direction: 'source' | 'target',
  handleId: string | null,
): number {
  const remoteNodeId = direction === 'source' ? edge.target : edge.source;
  const remoteNode = nodeLookup.get(remoteNodeId);
  if (!remoteNode) {
    return Number.POSITIVE_INFINITY;
  }

  const position = remoteNode.positionAbsolute ?? remoteNode.position ?? { x: 0, y: 0 };
  const width = remoteNode.width ?? 0;
  const height = remoteNode.height ?? 0;
  const usesVerticalAxis = handleId === 'left' || handleId === 'right';

  return usesVerticalAxis ? position.y + height / 2 : position.x + width / 2;
}

function getEndpointSiblingBuckets(allEdges: MinimalEdge[], allNodes: MinimalNode[]): Map<string, MinimalEdge[]> {
  let nodesCache = ENDPOINT_SIBLING_CACHE.get(allEdges);
  if (!nodesCache) {
    nodesCache = new WeakMap<MinimalNode[], Map<string, MinimalEdge[]>>();
    ENDPOINT_SIBLING_CACHE.set(allEdges, nodesCache);
  }

  let buckets = nodesCache.get(allNodes);
  if (!buckets) {
    const nodeLookup = getNodeLookup(allNodes);
    buckets = new Map<string, MinimalEdge[]>();
    const ensureBucket = (key: string): MinimalEdge[] => {
      const existing = buckets?.get(key);
      if (existing) {
        return existing;
      }

      const next: MinimalEdge[] = [];
      buckets?.set(key, next);
      return next;
    };

    for (const edge of allEdges) {
      ensureBucket(`source|${edge.source}|${edge.sourceHandle ?? ''}`).push(edge);
      ensureBucket(`target|${edge.target}|${edge.targetHandle ?? ''}`).push(edge);
    }

    for (const [key, siblings] of buckets.entries()) {
      const [, , handleId] = key.split('|');
      const direction = key.startsWith('source|') ? 'source' : 'target';
      siblings.sort((a, b) => {
        const remoteA = getRemoteNodeAxisValueFromLookup(nodeLookup, a, direction, handleId || null);
        const remoteB = getRemoteNodeAxisValueFromLookup(nodeLookup, b, direction, handleId || null);
        if (remoteA !== remoteB) {
          return remoteA - remoteB;
        }

        return a.id.localeCompare(b.id);
      });
    }

    nodesCache.set(allNodes, buckets);
  }

  return buckets;
}

function getAdaptiveFanoutSpacing(siblingCount: number): number {
  if (siblingCount <= 1) {
    return 0;
  }

  return Math.min(18, 10 + Math.max(0, siblingCount - 2) * 1.5);
}

function getEndpointSiblings(
  allEdges: MinimalEdge[],
  allNodes: MinimalNode[],
  endpoint: { nodeId: string; handleId?: string | null; direction: 'source' | 'target' },
): MinimalEdge[] {
  return getEndpointSiblingBuckets(allEdges, allNodes).get(
    `${endpoint.direction}|${endpoint.nodeId}|${endpoint.handleId ?? ''}`,
  ) ?? [];
}

export function getNodeById(allNodes: MinimalNode[], nodeId: string): MinimalNode | undefined {
  return getNodeLookup(allNodes).get(nodeId);
}

export function getShapeAwareElkAnchorClearance(shape?: string): number {
  switch (shape) {
    case 'diamond':
      return 12;
    case 'circle':
    case 'ellipse':
    case 'capsule':
      return 8;
    case 'hexagon':
    case 'parallelogram':
    case 'cylinder':
      return 6;
    default:
      return 0;
  }
}

export function getParallelEdgeOffset(edgeId: string, source: string, target: string, allEdges: MinimalEdge[]): number {
  const key = source < target ? `${source}|${target}` : `${target}|${source}`;
  const siblings = getParallelEdgeGroups(allEdges).get(key) ?? [];
  if (siblings.length <= 1) {
    return 0;
  }

  const index = siblings.findIndex((edge) => edge.id === edgeId);
  const spacing = 25;
  return (index - (siblings.length - 1) / 2) * spacing;
}

export function getEndpointFanoutOffset(
  edgeId: string,
  allEdges: MinimalEdge[],
  allNodes: MinimalNode[],
  endpoint: { nodeId: string; handleId?: string | null; direction: 'source' | 'target' },
): number {
  const siblings = getEndpointSiblings(allEdges, allNodes, endpoint);
  if (siblings.length <= 1) {
    return 0;
  }

  const index = siblings.findIndex((edge) => edge.id === edgeId);
  if (index === -1) {
    return 0;
  }

  const spacing = getAdaptiveFanoutSpacing(siblings.length);
  return (index - (siblings.length - 1) / 2) * spacing;
}

export function getEndpointSiblingCount(
  allEdges: MinimalEdge[],
  allNodes: MinimalNode[],
  endpoint: { nodeId: string; handleId?: string | null; direction: 'source' | 'target' },
): number {
  return getEndpointSiblings(allEdges, allNodes, endpoint).length;
}

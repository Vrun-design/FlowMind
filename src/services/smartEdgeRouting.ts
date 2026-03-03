import { Node, Edge } from 'reactflow';
import { NODE_WIDTH, NODE_HEIGHT } from '../constants';

/**
 * Assign intelligent `sourceHandle` and `targetHandle` to each edge
 * based on the relative positions of connected nodes.
 *
 * This produces natural edge routing:
 * - If target is below source → bottom→top
 * - If target is right of source → right→left
 * - Bidirectional edges use different handle pairs
 * - Multiple edges between same pair distribute across handles
 */
// Helper to get absolute position
function getAbsolutePosition(node: Node, nodeMap: Map<string, Node>): { x: number, y: number } {
    // We intentionally ignore node.positionAbsolute here because during drag operations
    // in React Flow, the positionAbsolute might be stale or not yet updated in the store
    // while node.position (relative) is updated.
    // To ensure smooth "magnetic" routing, we always calculate absolute position
    // from the hierarchy.

    let x = node.position.x;
    let y = node.position.y;
    let currentParentId = node.parentNode;

    while (currentParentId) {
        const parent = nodeMap.get(currentParentId);
        if (parent) {
            x += parent.position.x;
            y += parent.position.y;
            currentParentId = parent.parentNode;
        } else {
            break;
        }
    }
    return { x, y };
}

// Helper to get node dimensions robustly
function getNodeDimensions(node: Node): { width: number, height: number } {
    const measured = (node as any).measured;
    if (measured && measured.width && measured.height) {
        return { width: measured.width, height: measured.height };
    }

    const styleWidth = node.style?.width;
    const styleHeight = node.style?.height;

    const w = typeof styleWidth === 'string' && styleWidth.endsWith('px')
        ? parseFloat(styleWidth)
        : (typeof styleWidth === 'number' ? styleWidth : null);

    const h = typeof styleHeight === 'string' && styleHeight.endsWith('px')
        ? parseFloat(styleHeight)
        : (typeof styleHeight === 'number' ? styleHeight : null);

    return {
        width: w ?? node.width ?? NODE_WIDTH,
        height: h ?? node.height ?? NODE_HEIGHT
    };
}

type PairMeta = {
    hasReverseDirection: boolean;
    siblingIndexByEdge: Map<Edge, number>;
    directionCount: Map<string, number>;
};

type RoutingContext = {
    nodeMap: Map<string, Node>;
    nodeCenterMap: Map<string, { x: number; y: number }>;
    pairMetaByKey: Map<string, PairMeta>;
};

const routingContextCache = new WeakMap<Node[], WeakMap<Edge[], RoutingContext>>();

function preserveEdgeLabelPlacement(originalEdge: Edge, nextEdge: Edge): Edge {
    const originalData = originalEdge.data as {
        labelPosition?: number;
        labelOffsetX?: number;
        labelOffsetY?: number;
    } | undefined;

    if (!originalData) return nextEdge;

    const hasLabelPlacement =
        typeof originalData.labelPosition === 'number'
        || typeof originalData.labelOffsetX === 'number'
        || typeof originalData.labelOffsetY === 'number';
    if (!hasLabelPlacement) return nextEdge;

    return {
        ...nextEdge,
        data: {
            ...(nextEdge.data || {}),
            labelPosition: originalData.labelPosition,
            labelOffsetX: originalData.labelOffsetX,
            labelOffsetY: originalData.labelOffsetY,
        },
    };
}

function buildRoutingContext(nodes: Node[], edges: Edge[]): RoutingContext {
    const nodeMap = new Map<string, Node>();
    for (const node of nodes) {
        nodeMap.set(node.id, node);
    }

    const nodeCenterMap = new Map<string, { x: number; y: number }>();
    for (const node of nodes) {
        const { width, height } = getNodeDimensions(node);
        const absolutePosition = getAbsolutePosition(node, nodeMap);
        nodeCenterMap.set(node.id, {
            x: absolutePosition.x + width / 2,
            y: absolutePosition.y + height / 2,
        });
    }

    const pairMetaByKey = new Map<string, PairMeta>();
    for (const edge of edges) {
        const key = [edge.source, edge.target].sort().join('::');
        let pairMeta = pairMetaByKey.get(key);
        if (!pairMeta) {
            pairMeta = {
                hasReverseDirection: false,
                siblingIndexByEdge: new Map<Edge, number>(),
                directionCount: new Map<string, number>(),
            };
            pairMetaByKey.set(key, pairMeta);
        }

        const directionKey = `${edge.source}->${edge.target}`;
        const siblingIndex = pairMeta.directionCount.get(directionKey) || 0;
        pairMeta.siblingIndexByEdge.set(edge, siblingIndex);
        pairMeta.directionCount.set(directionKey, siblingIndex + 1);

        if (!pairMeta.hasReverseDirection) {
            const reverseKey = `${edge.target}->${edge.source}`;
            if (pairMeta.directionCount.has(reverseKey)) {
                pairMeta.hasReverseDirection = true;
            }
        }
    }

    return { nodeMap, nodeCenterMap, pairMetaByKey };
}

function getRoutingContext(nodes: Node[], edges: Edge[]): RoutingContext {
    let edgeCache = routingContextCache.get(nodes);
    if (!edgeCache) {
        edgeCache = new WeakMap<Edge[], RoutingContext>();
        routingContextCache.set(nodes, edgeCache);
    }

    const cached = edgeCache.get(edges);
    if (cached) {
        return cached;
    }

    const fresh = buildRoutingContext(nodes, edges);
    edgeCache.set(edges, fresh);
    return fresh;
}

export function assignSmartHandles(nodes: Node[], edges: Edge[]): Edge[] {
    const { nodeMap, nodeCenterMap, pairMetaByKey } = getRoutingContext(nodes, edges);

    return edges.map((edge) => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);

        if (!sourceNode || !targetNode) return edge;

        // Self-loop: handled by CustomEdge already
        if (edge.source === edge.target) return edge;

        const sourceCenter = nodeCenterMap.get(sourceNode.id);
        const targetCenter = nodeCenterMap.get(targetNode.id);
        if (!sourceCenter || !targetCenter) return edge;

        const sx = sourceCenter.x;
        const sy = sourceCenter.y;
        const tx = targetCenter.x;
        const ty = targetCenter.y;

        const dx = tx - sx;
        const dy = ty - sy;

        let sourceHandle: string;
        let targetHandle: string;

        const pairKey = [edge.source, edge.target].sort().join('::');
        const pairMeta = pairMetaByKey.get(pairKey);
        const isReverse = pairMeta?.hasReverseDirection ?? false;
        const siblingIndex = pairMeta?.siblingIndexByEdge.get(edge) ?? 0;

        if (Math.abs(dy) >= Math.abs(dx)) {
            // Vertical dominance
            if (dy >= 0) {
                // Target is below - primary: bottom→top
                if (isReverse && edge.source > edge.target) {
                    // Reverse direction of bidirectional pair
                    sourceHandle = 'left';
                    targetHandle = 'left';
                } else if (siblingIndex > 0) {
                    // Multiple same-direction edges: alternate sides
                    sourceHandle = siblingIndex % 2 === 1 ? 'right' : 'bottom';
                    targetHandle = siblingIndex % 2 === 1 ? 'right' : 'top';
                } else {
                    sourceHandle = 'bottom';
                    targetHandle = 'top';
                }
            } else {
                // Target is above
                if (isReverse && edge.source > edge.target) {
                    sourceHandle = 'right';
                    targetHandle = 'right';
                } else if (siblingIndex > 0) {
                    sourceHandle = siblingIndex % 2 === 1 ? 'left' : 'top';
                    targetHandle = siblingIndex % 2 === 1 ? 'left' : 'bottom';
                } else {
                    sourceHandle = 'top';
                    targetHandle = 'bottom';
                }
            }
        } else {
            // Horizontal dominance
            if (dx >= 0) {
                // Target is to the right
                if (isReverse && edge.source > edge.target) {
                    sourceHandle = 'bottom';
                    targetHandle = 'bottom';
                } else if (siblingIndex > 0) {
                    sourceHandle = siblingIndex % 2 === 1 ? 'bottom' : 'right';
                    targetHandle = siblingIndex % 2 === 1 ? 'bottom' : 'left';
                } else {
                    sourceHandle = 'right';
                    targetHandle = 'left';
                }
            } else {
                // Target is to the left
                if (isReverse && edge.source > edge.target) {
                    sourceHandle = 'top';
                    targetHandle = 'top';
                } else if (siblingIndex > 0) {
                    sourceHandle = siblingIndex % 2 === 1 ? 'top' : 'left';
                    targetHandle = siblingIndex % 2 === 1 ? 'top' : 'right';
                } else {
                    sourceHandle = 'left';
                    targetHandle = 'right';
                }
            }
        }

        // Optimization: Only create new object if handles changed
        if (edge.sourceHandle === sourceHandle && edge.targetHandle === targetHandle) {
            return edge;
        }

        const nextEdge = {
            ...edge,
            sourceHandle,
            targetHandle,
        };
        return preserveEdgeLabelPlacement(edge, nextEdge);
    });
}

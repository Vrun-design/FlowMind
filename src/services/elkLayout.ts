import type { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from 'reactflow';
import { NODE_WIDTH, NODE_HEIGHT } from '../constants';

interface ElkLayoutEngine {
    layout: (graph: ElkNode) => Promise<ElkNode>;
}

let elkInstancePromise: Promise<ElkLayoutEngine> | null = null;

async function getElkInstance(): Promise<ElkLayoutEngine> {
    if (!elkInstancePromise) {
        elkInstancePromise = import('elkjs/lib/elk.bundled.js').then((module) => {
            return new module.default() as unknown as ElkLayoutEngine;
        });
    }
    return elkInstancePromise;
}

export type LayoutAlgorithm = 'layered' | 'force' | 'mrtree' | 'stress' | 'radial';
export type LayoutDirection = 'DOWN' | 'RIGHT' | 'LEFT' | 'UP';

// Map user-friendly direction codes to ELK direction values
const DIRECTION_MAP: Record<string, LayoutDirection> = {
    TB: 'DOWN',
    LR: 'RIGHT',
    RL: 'LEFT',
    BT: 'UP',
};

export interface LayoutOptions {
    direction?: 'TB' | 'LR' | 'RL' | 'BT';
    algorithm?: LayoutAlgorithm;
    spacing?: 'compact' | 'normal' | 'loose';
    preset?: 'hierarchical' | 'orthogonal-compact' | 'orthogonal-spacious';
}

type ResolvedLayoutConfiguration = {
    algorithm: LayoutAlgorithm;
    direction: 'TB' | 'LR' | 'RL' | 'BT';
    spacing: 'compact' | 'normal' | 'loose';
    elkDirection: LayoutDirection;
    isHorizontal: boolean;
    dims: {
        nodeNode: string;
        nodeLayer: string;
        component: string;
    };
    layoutOptions: Record<string, string>;
};

type NormalizedLayoutInputs = {
    topLevelNodes: Node[];
    childrenByParent: Map<string, Node[]>;
    sortedEdges: Edge[];
};

function buildComponentOrderIndex(nodes: Node[], edges: Edge[]): Map<string, number> {
    const nodeIds = nodes.map((node) => node.id).sort((a, b) => a.localeCompare(b));
    const nodeIdSet = new Set(nodeIds);
    const adjacency = new Map<string, string[]>();

    for (const nodeId of nodeIds) {
        adjacency.set(nodeId, []);
    }

    for (const edge of edges) {
        if (!nodeIdSet.has(edge.source) || !nodeIdSet.has(edge.target)) continue;
        adjacency.get(edge.source)?.push(edge.target);
        adjacency.get(edge.target)?.push(edge.source);
    }

    for (const [nodeId, neighbors] of adjacency.entries()) {
        neighbors.sort((a, b) => a.localeCompare(b));
        adjacency.set(nodeId, neighbors);
    }

    const visited = new Set<string>();
    const componentOrder = new Map<string, number>();
    let componentIndex = 0;

    for (const startNodeId of nodeIds) {
        if (visited.has(startNodeId)) continue;

        const queue = [startNodeId];
        visited.add(startNodeId);

        while (queue.length > 0) {
            const current = queue.shift();
            if (!current) continue;
            componentOrder.set(current, componentIndex);

            const neighbors = adjacency.get(current) || [];
            for (const neighbor of neighbors) {
                if (visited.has(neighbor)) continue;
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }

        componentIndex += 1;
    }

    return componentOrder;
}

export function normalizeLayoutInputsForDeterminism(nodes: Node[], edges: Edge[]): NormalizedLayoutInputs {
    const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
    const componentOrderIndex = buildComponentOrderIndex(sortedNodes, edges);
    const childrenByParent = new Map<string, Node[]>();
    const topLevelNodes: Node[] = [];

    for (const node of sortedNodes) {
        if (!node.parentNode) {
            topLevelNodes.push(node);
            continue;
        }
        const children = childrenByParent.get(node.parentNode) || [];
        children.push(node);
        childrenByParent.set(node.parentNode, children);
    }

    const sortNodesByComponentAndId = (a: Node, b: Node) => {
        const aComponent = componentOrderIndex.get(a.id) ?? Number.POSITIVE_INFINITY;
        const bComponent = componentOrderIndex.get(b.id) ?? Number.POSITIVE_INFINITY;
        if (aComponent !== bComponent) return aComponent - bComponent;
        return a.id.localeCompare(b.id);
    };

    topLevelNodes.sort(sortNodesByComponentAndId);
    for (const [parentId, children] of childrenByParent.entries()) {
        children.sort(sortNodesByComponentAndId);
        childrenByParent.set(parentId, children);
    }

    const sortedEdges = [...edges].sort((a, b) => {
        const aSourceComponent = componentOrderIndex.get(a.source) ?? Number.POSITIVE_INFINITY;
        const bSourceComponent = componentOrderIndex.get(b.source) ?? Number.POSITIVE_INFINITY;
        if (aSourceComponent !== bSourceComponent) return aSourceComponent - bSourceComponent;

        const aTargetComponent = componentOrderIndex.get(a.target) ?? Number.POSITIVE_INFINITY;
        const bTargetComponent = componentOrderIndex.get(b.target) ?? Number.POSITIVE_INFINITY;
        if (aTargetComponent !== bTargetComponent) return aTargetComponent - bTargetComponent;

        if (a.source !== b.source) return a.source.localeCompare(b.source);
        if (a.target !== b.target) return a.target.localeCompare(b.target);
        return a.id.localeCompare(b.id);
    });

    return { topLevelNodes, childrenByParent, sortedEdges };
}

/**
 * Calculate spacing dimensions based on preset and direction.
 */
function getSpacingDimensions(spacing: LayoutOptions['spacing'] = 'normal', isHorizontal: boolean) {
    let nodeNode = 80;
    let nodeLayer = 150;

    switch (spacing) {
        case 'compact':
            nodeNode = 40;
            nodeLayer = 80;
            break;
        case 'loose':
            nodeNode = 150;
            nodeLayer = 250;
            break;
        case 'normal':
        default:
            nodeNode = 80;
            nodeLayer = 150;
    }

    if (isHorizontal) {
        nodeLayer *= 1.2;
    }

    return {
        nodeNode: String(nodeNode),
        nodeLayer: String(nodeLayer),
        component: String(nodeLayer)
    };
}

/**
 * Get algorithm-specific ELK options.
 */
function getAlgorithmOptions(algorithm: LayoutAlgorithm, layerSpacing: number) {
    const options: Record<string, string> = {};

    // Algorithm ID mapping
    switch (algorithm) {
        case 'mrtree': options['elk.algorithm'] = 'org.eclipse.elk.mrtree'; break;
        case 'force': options['elk.algorithm'] = 'org.eclipse.elk.force'; break;
        case 'stress': options['elk.algorithm'] = 'org.eclipse.elk.stress'; break;
        case 'radial': options['elk.algorithm'] = 'org.eclipse.elk.radial'; break;
        default: options['elk.algorithm'] = `org.eclipse.elk.${algorithm}`;
    }

    // Algorithm-specific tuning
    if (algorithm === 'layered') {
        Object.assign(options, {
            'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
            'elk.layered.crossingMinimization.thoroughness': '30',
            'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
            'elk.edgeRouting': 'ORTHOGONAL',
            'elk.layered.spacing.edgeNodeBetweenLayers': '50',
            'elk.layered.spacing.edgeEdgeBetweenLayers': '40',
            'elk.separateConnectedComponents': 'true',
            'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
        });
    } else if (algorithm === 'mrtree') {
        Object.assign(options, {
            'elk.separateConnectedComponents': 'true',
        });
    } else if (algorithm === 'force') {
        Object.assign(options, {
            'elk.force.iterations': '500',
            'elk.force.repulsivePower': String(layerSpacing / 20),
        });
    } else if (algorithm === 'stress') {
        options['elk.stress.desiredEdgeLength'] = String(layerSpacing);
    } else if (algorithm === 'radial') {
        options['elk.radial.radius'] = String(layerSpacing);
    }

    return options;
}

export function getDeterministicSeedOptions(algorithm: LayoutAlgorithm): Record<string, string> {
    // ELK seed support is most relevant for force/stress/radial families.
    // For other algorithms we rely on deterministic input ordering/model-order options.
    if (algorithm === 'force' || algorithm === 'stress' || algorithm === 'radial') {
        return { 'elk.randomSeed': '1337' };
    }
    return {};
}

export function resolveLayoutPresetOptions(options: LayoutOptions): Pick<LayoutOptions, 'algorithm' | 'direction' | 'spacing'> {
    if (!options.preset) {
        return {
            algorithm: options.algorithm ?? 'layered',
            direction: options.direction ?? 'TB',
            spacing: options.spacing ?? 'normal',
        };
    }

    if (options.preset === 'hierarchical') {
        return { algorithm: 'layered', direction: 'TB', spacing: 'normal' };
    }

    if (options.preset === 'orthogonal-compact') {
        return { algorithm: 'layered', direction: 'LR', spacing: 'compact' };
    }

    return { algorithm: 'layered', direction: 'LR', spacing: 'loose' };
}

export function buildResolvedLayoutConfiguration(options: LayoutOptions): ResolvedLayoutConfiguration {
    const {
        direction = 'TB',
        algorithm = 'layered',
        spacing = 'normal',
    } = resolveLayoutPresetOptions(options);
    const elkDirection = DIRECTION_MAP[direction] || 'DOWN';
    const isHorizontal = direction === 'LR' || direction === 'RL';

    const dims = getSpacingDimensions(spacing, isHorizontal);
    const algoOptions = getAlgorithmOptions(algorithm, parseFloat(dims.nodeLayer));
    const deterministicSeedOptions = getDeterministicSeedOptions(algorithm);
    const layoutOptions = {
        'elk.direction': elkDirection,
        'elk.spacing.nodeNode': dims.nodeNode,
        'elk.layered.spacing.nodeNodeBetweenLayers': dims.nodeLayer,
        'elk.spacing.componentComponent': dims.component,
        'elk.padding': '[top=50,left=50,bottom=50,right=50]',
        ...algoOptions,
        ...deterministicSeedOptions,
    };

    return {
        algorithm,
        direction,
        spacing,
        elkDirection,
        isHorizontal,
        dims,
        layoutOptions,
    };
}

/**
 * Perform auto-layout using ELK.
 * Returns a new array of nodes with updated positions.
 */
/**
 * Perform auto-layout using ELK.
 * Supports hierarchical nodes (groups).
 */
export async function getElkLayout(
    nodes: Node[],
    edges: Edge[],
    options: LayoutOptions = {}
): Promise<Node[]> {
    const { layoutOptions } = buildResolvedLayoutConfiguration(options);
    const { topLevelNodes, childrenByParent, sortedEdges } = normalizeLayoutInputsForDeterminism(nodes, edges);

    // 2. Build Hierarchy
    const buildElkNode = (node: Node): ElkNode => {
        const children = childrenByParent.get(node.id) || [];

        // Better estimation for unmeasured nodes (e.g. fresh from AI)
        let w = (node as any).measured?.width ?? node.width ?? (node.data as any)?.width;
        let h = (node as any).measured?.height ?? node.height ?? (node.data as any)?.height;

        if (!w || !h) {
            // Estimate based on label length
            const label = node.data?.label || '';
            const estimatedWidth = Math.max(NODE_WIDTH, label.length * 8 + 40); // Base width + char approx
            const estimatedHeight = Math.max(NODE_HEIGHT, Math.ceil(label.length / 40) * 20 + 60); // Wrap approx

            w = w ?? estimatedWidth;
            h = h ?? estimatedHeight;
        }

        return {
            id: node.id,
            width: children.length === 0 ? w : undefined, // Let ELK calculate size if group
            height: children.length === 0 ? h : undefined,
            children: children.map(buildElkNode),
            layoutOptions: {
                'elk.portConstraints': 'FREE',
                'elk.padding': '[top=40,left=20,bottom=20,right=20]', // Padding for groups
            },
        };
    };

    const elkGraph: ElkNode = {
        id: 'root',
        layoutOptions,
        children: topLevelNodes.map(buildElkNode),
        edges: sortedEdges.map((edge) => ({
            id: edge.id,
            sources: [edge.source],
            targets: [edge.target],
            // Hierarchy support: edges might cross boundaries
            // ELK handles this if IDs match
        })) as ElkExtendedEdge[],
    };

    // 3. Execute Layout
    try {
        const elk = await getElkInstance();
        const layoutResult = await elk.layout(elkGraph);

        // 4. Flatten and Map Results
        const positionMap = new Map<string, { x: number; y: number, width?: number, height?: number }>();

        const traverse = (node: ElkNode) => {
            if (node.id !== 'root') {
                positionMap.set(node.id, {
                    x: node.x ?? 0,
                    y: node.y ?? 0,
                    width: node.width,
                    height: node.height
                });
            }
            node.children?.forEach(traverse);
        };
        traverse(layoutResult);

        return nodes.map((node) => {
            const pos = positionMap.get(node.id);
            if (!pos) return node;

            // For groups, we might want to update style/dimensions if ELK resized them?
            // ReactFlow handles group sizing dynamically usually, unless we set explicit style.width/height
            // But if we want to respect ELK's decision:
            const style = { ...node.style };
            if (node.type === 'group' || node.type === 'section' || node.type === 'container') {
                if (pos.width) style.width = pos.width;
                if (pos.height) style.height = pos.height;
            }

            return {
                ...node,
                position: { x: pos.x, y: pos.y },
                style
            };
        });

    } catch (err) {
        console.error('ELK Layout Error:', err);
        return nodes; // Fallback
    }
}

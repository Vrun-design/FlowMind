import ELK, { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from 'reactflow';
import { NODE_WIDTH, NODE_HEIGHT } from '../constants';

const elk = new ELK();

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
}

/**
 * Perform auto-layout using ELK.
 * Returns a new array of nodes with updated positions.
 */
export async function getElkLayout(
    nodes: Node[],
    edges: Edge[],
    options: LayoutOptions = {}
): Promise<Node[]> {
    const {
        direction = 'TB',
        algorithm = 'layered',
        spacing = 'normal',
    } = options;

    const elkDirection = DIRECTION_MAP[direction] || 'DOWN';

    // Spacing presets
    let nodeSpacing = 60;
    let layerSpacing = 100;

    switch (spacing) {
        case 'compact':
            nodeSpacing = 30;
            layerSpacing = 60;
            break;
        case 'loose':
            nodeSpacing = 100;
            layerSpacing = 150;
            break;
        case 'normal':
        default:
            nodeSpacing = 60;
            layerSpacing = 100;
    }

    // Adjust for horizontal layout
    if (direction === 'LR' || direction === 'RL') {
        // Swap or adjust if needed, but usually standard spacing works fine
        // Maybe increase layer spacing for text readability
        layerSpacing *= 1.2;
    }

    // Algorithm specific mapping
    let elkAlgorithm = `org.eclipse.elk.${algorithm}`;
    if (algorithm === 'mrtree') elkAlgorithm = 'org.eclipse.elk.mrtree';
    if (algorithm === 'force') elkAlgorithm = 'org.eclipse.elk.force';
    if (algorithm === 'stress') elkAlgorithm = 'org.eclipse.elk.stress';
    // Radial is org.eclipse.elk.radial

    // Build the ELK graph
    const elkGraph: ElkNode = {
        id: 'root',
        layoutOptions: {
            'elk.algorithm': elkAlgorithm,
            'elk.direction': elkDirection,

            // Spacing
            'elk.spacing.nodeNode': String(nodeSpacing),
            'elk.layered.spacing.nodeNodeBetweenLayers': String(layerSpacing),
            'elk.spacing.componentComponent': String(layerSpacing),

            // Algorithm Specifics
            ...(algorithm === 'layered' ? {
                'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
                'elk.layered.crossingMinimization.thoroughness': '10',
                'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
                'elk.edgeRouting': 'ORTHOGONAL',
                'elk.layered.spacing.edgeNodeBetweenLayers': '40',
                'elk.layered.spacing.edgeEdgeBetweenLayers': '30',
                'elk.separateConnectedComponents': 'true',
                'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
            } : {}),

            ...(algorithm === 'force' ? {
                'elk.force.iterations': '300',
                'elk.force.repulsivePower': String(layerSpacing / 20),
            } : {}),

            ...(algorithm === 'stress' ? {
                'elk.stress.desiredEdgeLength': String(layerSpacing),
            } : {}),

            ...(algorithm === 'radial' ? {
                'elk.radial.radius': String(layerSpacing),
            } : {}),

            // Padding
            'elk.padding': '[top=40,left=40,bottom=40,right=40]',
        },
        children: nodes.map((node) => {
            const w = node.width || (node.data as any)?.width || NODE_WIDTH;
            const h = node.height || (node.data as any)?.height || NODE_HEIGHT;
            return {
                id: node.id,
                width: w,
                height: h,
                layoutOptions: {
                    'elk.portConstraints': 'FREE',
                },
            };
        }),
        edges: edges
            .filter((e) => e.source !== e.target) // Skip self-loops
            .map((edge) => ({
                id: edge.id,
                sources: [edge.source],
                targets: [edge.target],
            })) as ElkExtendedEdge[],
    };

    // Run ELK layout
    const layoutResult = await elk.layout(elkGraph);

    // Map ELK positions back to React Flow nodes
    const positionMap = new Map<string, { x: number; y: number }>();
    layoutResult.children?.forEach((elkNode) => {
        positionMap.set(elkNode.id, {
            x: elkNode.x ?? 0,
            y: elkNode.y ?? 0,
        });
    });

    return nodes.map((node) => {
        const pos = positionMap.get(node.id);
        if (!pos) return node;
        return {
            ...node,
            position: { x: pos.x, y: pos.y },
        };
    });
}

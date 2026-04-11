import type { FlowEdge, FlowNode } from '@/lib/types';

export type LayoutAlgorithm = 'layered' | 'force' | 'mrtree' | 'stress' | 'radial';
export type LayoutDirection = 'DOWN' | 'RIGHT' | 'LEFT' | 'UP';

export interface LayoutOptions {
    direction?: 'TB' | 'LR' | 'RL' | 'BT';
    algorithm?: LayoutAlgorithm;
    spacing?: 'compact' | 'normal' | 'loose';
    contentDensity?: 'compact' | 'balanced' | 'verbose';
    preset?: 'hierarchical' | 'orthogonal-compact' | 'orthogonal-spacious';
    diagramType?: string;
    /** 'import' triggers compact node size estimates and tighter spacing defaults */
    source?: 'import' | 'canvas';
}

export type ResolvedLayoutConfiguration = {
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

export type NormalizedLayoutInputs = {
    topLevelNodes: FlowNode[];
    childrenByParent: Map<string, FlowNode[]>;
    sortedEdges: FlowEdge[];
};

export type FlowNodeWithMeasuredDimensions = FlowNode & {
    measured?: {
        width?: number;
        height?: number;
    };
    data?: FlowNode['data'] & {
        width?: number;
        height?: number;
    };
};

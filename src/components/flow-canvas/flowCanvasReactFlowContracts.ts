import {
    BackgroundVariant,
    ConnectionMode,
    MarkerType,
    PanOnScrollMode,
    SelectionMode,
    type KeyCode,
} from '@/lib/reactflowCompat';

export const FLOW_CANVAS_BASE_BEHAVIOR: {
    connectionMode: ConnectionMode;
    selectNodesOnDrag: boolean;
    selectionKeyCode: KeyCode | null;
    panActivationKeyCode: KeyCode | null;
    zoomActivationKeyCode: KeyCode | null;
    multiSelectionKeyCode: string;
    zoomOnScroll: boolean;
    zoomOnPinch: boolean;
    panOnScroll: boolean;
    panOnScrollMode: PanOnScrollMode;
    preventScrolling: boolean;
    zoomOnDoubleClick: boolean;
} = {
    connectionMode: ConnectionMode.Loose,
    selectNodesOnDrag: false,
    selectionKeyCode: 'Shift',
    panActivationKeyCode: 'Space',
    zoomActivationKeyCode: ['Meta', 'Control'],
    multiSelectionKeyCode: 'Shift',
    zoomOnScroll: false,
    zoomOnPinch: true,
    panOnScroll: true,
    panOnScrollMode: PanOnScrollMode.Free,
    preventScrolling: true,
    zoomOnDoubleClick: false,
};

export const FLOW_CANVAS_STYLE_PRESETS = {
    enhanced: {
        defaultEdgeOptions: {
            style: { stroke: '#64748b', strokeWidth: 1.5 },
            animated: false,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b', width: 20, height: 20 },
        },
        background: {
            variant: BackgroundVariant.Dots,
            gap: 24,
            size: 1.5,
            color: 'rgba(148,163,184,0.4)',
        },
    },
    standard: {
        defaultEdgeOptions: {
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            animated: false,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8', width: 20, height: 20 },
        },
        background: {
            variant: BackgroundVariant.Dots,
            gap: 24,
            size: 1.5,
            color: 'rgba(148,163,184,0.5)',
        },
    },
} as const;

export function getFlowCanvasClassName(isEffectiveSelectMode: boolean): string {
    return `bg-[var(--brand-background)] ${isEffectiveSelectMode ? 'flow-canvas-select-mode' : 'flow-canvas-pan-mode'}`;
}

export function getFlowCanvasInteractionMode(isEffectiveSelectMode: boolean): {
    selectionOnDrag: boolean;
    panOnDrag: boolean | number[];
    selectionMode: SelectionMode | undefined;
} {
    if (isEffectiveSelectMode) {
        return {
            selectionOnDrag: true,
            panOnDrag: [1, 2],
            selectionMode: SelectionMode.Partial,
        };
    }

    return {
        selectionOnDrag: false,
        panOnDrag: [0, 1, 2],
        selectionMode: undefined,
    };
}

import { useCallback, useMemo } from 'react';
import {
    BackgroundVariant,
    ConnectionMode,
    MarkerType,
    PanOnScrollMode,
    SelectionMode,
    type Connection,
    type KeyCode,
} from '@/lib/reactflowCompat';
import type { FlowEdge } from '@/lib/types';
import { isDuplicateConnection } from './flowCanvasTypes';
import {
    FLOW_CANVAS_BASE_BEHAVIOR,
    FLOW_CANVAS_STYLE_PRESETS,
    getFlowCanvasClassName,
    getFlowCanvasInteractionMode,
} from './flowCanvasReactFlowContracts';

interface ComputeFlowCanvasReactFlowConfigParams {
    visualQualityV2Enabled: boolean;
    isEffectiveSelectMode: boolean;
    viewportCullingEnabled: boolean;
}

interface UseFlowCanvasReactFlowConfigParams extends ComputeFlowCanvasReactFlowConfigParams {
    effectiveEdges: FlowEdge[];
}

interface FlowCanvasBackgroundConfig {
    variant: BackgroundVariant;
    gap: number;
    size: number;
    color: string;
}

export interface FlowCanvasReactFlowConfig {
    className: string;
    onlyRenderVisibleElements: boolean;
    connectionMode: ConnectionMode;
    selectionOnDrag: boolean;
    selectNodesOnDrag: boolean;
    selectionKeyCode: KeyCode | null;
    panOnDrag: boolean | number[];
    panActivationKeyCode: KeyCode | null;
    zoomActivationKeyCode: KeyCode | null;
    selectionMode: SelectionMode | undefined;
    multiSelectionKeyCode: string;
    zoomOnScroll: boolean;
    zoomOnPinch: boolean;
    panOnScroll: boolean;
    panOnScrollMode: PanOnScrollMode;
    preventScrolling: boolean;
    zoomOnDoubleClick: boolean;
    defaultEdgeOptions: {
        style: { stroke: string; strokeWidth: number };
        animated: boolean;
        markerEnd: { type: MarkerType; color: string; width?: number; height?: number };
    };
    background: FlowCanvasBackgroundConfig;
    isValidConnection: (connection: Connection) => boolean;
}

export function computeFlowCanvasReactFlowConfig({
    visualQualityV2Enabled,
    isEffectiveSelectMode,
    viewportCullingEnabled,
}: ComputeFlowCanvasReactFlowConfigParams): Omit<FlowCanvasReactFlowConfig, 'isValidConnection'> {
    const interactionMode = getFlowCanvasInteractionMode(isEffectiveSelectMode);
    const stylePreset = visualQualityV2Enabled
        ? FLOW_CANVAS_STYLE_PRESETS.enhanced
        : FLOW_CANVAS_STYLE_PRESETS.standard;

    return {
        className: getFlowCanvasClassName(isEffectiveSelectMode),
        onlyRenderVisibleElements: viewportCullingEnabled,
        ...FLOW_CANVAS_BASE_BEHAVIOR,
        ...interactionMode,
        defaultEdgeOptions: stylePreset.defaultEdgeOptions,
        background: stylePreset.background,
    };
}

export function useFlowCanvasReactFlowConfig({
    visualQualityV2Enabled,
    isEffectiveSelectMode,
    viewportCullingEnabled,
    effectiveEdges,
}: UseFlowCanvasReactFlowConfigParams): FlowCanvasReactFlowConfig {
    const config = useMemo(
        () => computeFlowCanvasReactFlowConfig({
            visualQualityV2Enabled,
            isEffectiveSelectMode,
            viewportCullingEnabled,
        }),
        [isEffectiveSelectMode, viewportCullingEnabled, visualQualityV2Enabled]
    );

    const isValidConnection = useCallback(
        (connection: Connection) =>
            connection.source !== connection.target &&
            !isDuplicateConnection(connection, effectiveEdges),
        [effectiveEdges]
    );

    return {
        ...config,
        isValidConnection,
    };
}

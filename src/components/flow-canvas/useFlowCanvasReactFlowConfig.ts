import { useCallback, useMemo } from 'react';
import {
    BackgroundVariant,
    ConnectionMode,
    MarkerType,
    SelectionMode,
    type Connection,
} from '@/lib/reactflowCompat';
import type { FlowEdge } from '@/lib/types';
import { isDuplicateConnection } from './flowCanvasTypes';

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
    panOnDrag: boolean;
    selectionMode: SelectionMode | undefined;
    multiSelectionKeyCode: string;
    defaultEdgeOptions: {
        style: { stroke: string; strokeWidth: number };
        animated: boolean;
        markerEnd: { type: MarkerType; color: string };
    };
    background: FlowCanvasBackgroundConfig;
    isValidConnection: (connection: Connection) => boolean;
}

export function computeFlowCanvasReactFlowConfig({
    visualQualityV2Enabled,
    isEffectiveSelectMode,
    viewportCullingEnabled,
}: ComputeFlowCanvasReactFlowConfigParams): Omit<FlowCanvasReactFlowConfig, 'isValidConnection'> {
    return {
        className: `bg-[var(--brand-background)] ${isEffectiveSelectMode ? 'flow-canvas-select-mode' : 'flow-canvas-pan-mode'}`,
        onlyRenderVisibleElements: viewportCullingEnabled,
        connectionMode: ConnectionMode.Loose,
        selectionOnDrag: isEffectiveSelectMode,
        panOnDrag: !isEffectiveSelectMode,
        selectionMode: isEffectiveSelectMode ? SelectionMode.Partial : undefined,
        multiSelectionKeyCode: 'Alt',
        defaultEdgeOptions: {
            style: visualQualityV2Enabled ? { stroke: '#64748b', strokeWidth: 1.5 } : { stroke: '#94a3b8', strokeWidth: 2 },
            animated: false,
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: visualQualityV2Enabled ? '#64748b' : '#94a3b8',
            },
        },
        background: {
            variant: BackgroundVariant.Dots,
            gap: visualQualityV2Enabled ? 24 : 20,
            size: visualQualityV2Enabled ? 1.5 : 1.25,
            color: visualQualityV2Enabled ? 'rgba(148,163,184,0.5)' : '#94a3b8',
        },
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
        (connection: Connection) => !isDuplicateConnection(connection, effectiveEdges),
        [effectiveEdges]
    );

    return {
        ...config,
        isValidConnection,
    };
}

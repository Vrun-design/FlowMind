import { useMemo } from 'react';
import type { FlowEdge, FlowNode } from '@/lib/types';
import type { Layer, ViewSettings } from '@/store/types';
import {
    getSafetyAdjustedEdges,
    isLargeGraphSafetyActive,
    shouldEnableViewportCulling,
} from './largeGraphSafetyMode';

interface FlowCanvasViewStateParams {
    nodes: FlowNode[];
    edges: FlowEdge[];
    layers: Layer[];
    showGrid: boolean;
    largeGraphSafetyMode: ViewSettings['largeGraphSafetyMode'];
    largeGraphSafetyProfile: ViewSettings['largeGraphSafetyProfile'];
}

interface FlowCanvasViewState {
    safetyModeActive: boolean;
    viewportCullingEnabled: boolean;
    effectiveShowGrid: boolean;
    layerAdjustedNodes: FlowNode[];
    effectiveEdges: FlowEdge[];
}

export function computeFlowCanvasViewState({
    nodes,
    edges,
    layers,
    showGrid,
    largeGraphSafetyMode,
    largeGraphSafetyProfile,
}: FlowCanvasViewStateParams): FlowCanvasViewState {
    const safetyModeActive = isLargeGraphSafetyActive(
        nodes.length,
        edges.length,
        largeGraphSafetyMode,
        largeGraphSafetyProfile
    );
    const viewportCullingEnabled = shouldEnableViewportCulling(safetyModeActive);
    const effectiveShowGrid = showGrid && !safetyModeActive;
    const layerById = new Map(layers.map((layer) => [layer.id, layer]));
    const layerAdjustedNodes = nodes.map((node) => {
        const layerId = node.data?.layerId ?? 'default';
        const layer = layerById.get(layerId);
        const isVisible = layer?.visible ?? true;
        const isLocked = layer?.locked ?? false;
        const nextHidden = !isVisible;
        const nextSelected = isVisible ? Boolean(node.selected) : false;
        const nextDraggable = !isLocked;

        if (
            node.hidden === nextHidden
            && node.selected === nextSelected
            && node.draggable === nextDraggable
        ) {
            return node;
        }

        return {
            ...node,
            hidden: nextHidden,
            selected: nextSelected,
            draggable: nextDraggable,
        };
    });
    const visibleNodeIds = new Set(layerAdjustedNodes.filter((node) => !node.hidden).map((node) => node.id));
    const visibleEdges = edges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
    const effectiveEdges = getSafetyAdjustedEdges(visibleEdges, safetyModeActive);

    return {
        safetyModeActive,
        viewportCullingEnabled,
        effectiveShowGrid,
        layerAdjustedNodes,
        effectiveEdges,
    };
}

export function useFlowCanvasViewState(params: FlowCanvasViewStateParams): FlowCanvasViewState {
    return useMemo(() => computeFlowCanvasViewState(params), [
        params.edges,
        params.largeGraphSafetyMode,
        params.largeGraphSafetyProfile,
        params.layers,
        params.nodes,
        params.showGrid,
    ]);
}

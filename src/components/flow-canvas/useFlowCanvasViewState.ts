import { useMemo } from 'react';
import type { FlowEdge, FlowNode } from '@/lib/types';
import type { Layer, ViewSettings } from '@/store/types';
import {
    getSafetyAdjustedEdges,
    isLargeGraphSafetyActive,
} from './largeGraphSafetyMode';
import { getNodeParentId } from '@/lib/nodeParent';

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

function buildLayerLookup(layers: Layer[]): Map<string, Layer> {
    return new Map(layers.map((layer) => [layer.id, layer]));
}

function applyLayerStateToNode(node: FlowNode, layerById: Map<string, Layer>): FlowNode {
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
}

function buildSectionStateCache(
    nodes: FlowNode[],
    nodeById: Map<string, FlowNode>
): Map<string, { hidden: boolean; locked: boolean }> {
    const cache = new Map<string, { hidden: boolean; locked: boolean }>();

    function resolve(node: FlowNode): { hidden: boolean; locked: boolean } {
        const cached = cache.get(node.id);
        if (cached) return cached;

        const own = {
            hidden: node.data?.sectionHidden === true,
            locked: node.data?.sectionLocked === true,
        };

        const parentId = getNodeParentId(node);
        if (parentId) {
            const parent = nodeById.get(parentId);
            if (parent) {
                const parentState = resolve(parent);
                own.hidden = own.hidden || parentState.hidden;
                own.locked = own.locked || parentState.locked;
            }
        }

        cache.set(node.id, own);
        return own;
    }

    for (const node of nodes) {
        resolve(node);
    }

    return cache;
}

function getLayerAdjustedNodes(nodes: FlowNode[], layers: Layer[]): FlowNode[] {
    const layerById = buildLayerLookup(layers);
    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const sectionStateCache = buildSectionStateCache(nodes, nodeById);

    return nodes.map((node) => {
        const layerAdjustedNode = applyLayerStateToNode(node, layerById);
        const inheritedState = sectionStateCache.get(node.id) ?? { hidden: false, locked: false };
        const nextHidden = layerAdjustedNode.hidden || inheritedState.hidden;
        const nextDraggable = Boolean(layerAdjustedNode.draggable) && !inheritedState.locked;

        if (
            layerAdjustedNode.hidden === nextHidden
            && layerAdjustedNode.draggable === nextDraggable
            && layerAdjustedNode.selectable === !inheritedState.hidden
        ) {
            return layerAdjustedNode;
        }

        return {
            ...layerAdjustedNode,
            hidden: nextHidden,
            selected: nextHidden ? false : layerAdjustedNode.selected,
            selectable: !inheritedState.hidden,
            draggable: nextDraggable,
        };
    });
}

function getVisibleEdges(nodes: FlowNode[], edges: FlowEdge[]): FlowEdge[] {
    const visibleNodeIds = new Set(
        nodes
            .filter((node) => !node.hidden)
            .map((node) => node.id)
    );

    return edges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
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
    const viewportCullingEnabled = true;
    const effectiveShowGrid = showGrid && !safetyModeActive;
    const layerAdjustedNodes = getLayerAdjustedNodes(nodes, layers);
    const visibleEdges = getVisibleEdges(layerAdjustedNodes, edges);
    const effectiveEdges = getSafetyAdjustedEdges(visibleEdges, safetyModeActive);

    return {
        safetyModeActive,
        viewportCullingEnabled,
        effectiveShowGrid,
        layerAdjustedNodes,
        effectiveEdges,
    };
}

export function useFlowCanvasViewState({
    nodes,
    edges,
    layers,
    showGrid,
    largeGraphSafetyMode,
    largeGraphSafetyProfile,
}: FlowCanvasViewStateParams): FlowCanvasViewState {
    return useMemo(
        () => computeFlowCanvasViewState({ nodes, edges, layers, showGrid, largeGraphSafetyMode, largeGraphSafetyProfile }),
        [nodes, edges, layers, showGrid, largeGraphSafetyMode, largeGraphSafetyProfile]
    );
}

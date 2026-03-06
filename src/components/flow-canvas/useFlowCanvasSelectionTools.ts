import type { FlowEdge, FlowNode, NodeData } from '@/lib/types';
import { useFlowCanvasAlignmentGuides } from './useFlowCanvasAlignmentGuides';
import { useFlowCanvasNodeDragHandlers } from './useFlowCanvasNodeDragHandlers';
import { useFlowCanvasQuickActions } from './useFlowCanvasQuickActions';

type SetFlowNodes = (payload: FlowNode[] | ((nodes: FlowNode[]) => FlowNode[])) => void;
type SetFlowEdges = (payload: FlowEdge[] | ((edges: FlowEdge[]) => FlowEdge[])) => void;

interface UseFlowCanvasSelectionToolsParams {
    layerAdjustedNodes: FlowNode[];
    zoom: number;
    viewportX: number;
    viewportY: number;
    recordHistory: () => void;
    setNodes: SetFlowNodes;
    setEdges: SetFlowEdges;
    setSelectedNodeId: (id: string | null) => void;
    duplicateNode: (nodeId: string) => void;
    handleAddAndConnect: (
        type: string,
        position: { x: number; y: number },
        sourceId?: string,
        sourceHandle?: string,
        shape?: NodeData['shape']
    ) => void;
    updateNodeData: (id: string, updates: Partial<NodeData>) => void;
    alignmentGuidesEnabled: boolean;
    toTypedFlowNode: (node: unknown) => FlowNode;
    onNodeDragStart: (event: unknown, node: FlowNode) => void;
    onNodeDrag: (event: unknown, node: FlowNode, draggedNodes: FlowNode[]) => void;
    onNodeDragStop: (event: unknown, node: FlowNode) => void;
    startInteractionLowDetail: () => void;
    endInteractionLowDetail: () => void;
}

export function useFlowCanvasSelectionTools({
    layerAdjustedNodes,
    zoom,
    viewportX,
    viewportY,
    recordHistory,
    setNodes,
    setEdges,
    setSelectedNodeId,
    duplicateNode,
    handleAddAndConnect,
    updateNodeData,
    alignmentGuidesEnabled,
    toTypedFlowNode,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    startInteractionLowDetail,
    endInteractionLowDetail,
}: UseFlowCanvasSelectionToolsParams) {
    const quickActions = useFlowCanvasQuickActions({
        layerAdjustedNodes,
        zoom,
        viewportX,
        viewportY,
        recordHistory,
        setNodes,
        setEdges,
        setSelectedNodeId,
        duplicateNode,
        handleAddAndConnect,
        updateNodeData,
    });

    const alignmentGuides = useFlowCanvasAlignmentGuides({
        enabled: alignmentGuidesEnabled,
        layerAdjustedNodes,
    });

    const dragHandlers = useFlowCanvasNodeDragHandlers({
        toTypedFlowNode,
        onNodeDragStart,
        onNodeDrag,
        onNodeDragStop,
        startInteractionLowDetail,
        endInteractionLowDetail,
        updateAlignmentGuidesForNode: alignmentGuides.updateAlignmentGuidesForNode,
        clearAlignmentGuides: alignmentGuides.clearAlignmentGuides,
    });

    return {
        ...quickActions,
        alignmentGuides: alignmentGuides.alignmentGuides,
        ...dragHandlers,
    };
}

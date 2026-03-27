import { useEffect, type RefObject } from 'react';
import type { TFunction } from 'i18next';
import type { ToastType } from '@/components/ui/ToastContext';
import type { FlowEdge, FlowNode } from '@/lib/types';
import type { ExportSerializationMode } from '@/services/canonicalSerialization';
import { useFlowEditorActions } from '@/hooks/useFlowEditorActions';
import { useFlowEditorCollaboration } from '@/hooks/useFlowEditorCollaboration';
import { useCollaborationNodePositions } from './useCollaborationNodePositions';

type SetFlowNodes = (payload: FlowNode[] | ((nodes: FlowNode[]) => FlowNode[])) => void;
type SetFlowEdges = (payload: FlowEdge[] | ((edges: FlowEdge[]) => FlowEdge[])) => void;

interface UseFlowEditorRuntimeParams {
    collaborationEnabled: boolean;
    activeTabId: string;
    activeTabName?: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
    editorSurfaceRef: RefObject<HTMLDivElement | null>;
    setNodes: SetFlowNodes;
    setEdges: SetFlowEdges;
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    recordHistory: () => void;
    fitView: (options?: { duration?: number; padding?: number }) => void;
    t: TFunction;
    exportSerializationMode: ExportSerializationMode;
    queueAutoSnapshot: (nodes: FlowNode[], edges: FlowEdge[]) => void;
}

export function useFlowEditorRuntime({
    collaborationEnabled,
    activeTabId,
    activeTabName,
    nodes,
    edges,
    editorSurfaceRef,
    setNodes,
    setEdges,
    addToast,
    recordHistory,
    fitView,
    t,
    exportSerializationMode,
    queueAutoSnapshot,
}: UseFlowEditorRuntimeParams) {
    useEffect(() => {
        queueAutoSnapshot(nodes, edges);
    }, [edges, nodes, queueAutoSnapshot]);

    const {
        collaborationTopNavState,
        remotePresence,
    } = useFlowEditorCollaboration({
        collaborationEnabled,
        activeTabId,
        nodes,
        edges,
        editorSurfaceRef,
        setNodes,
        setEdges,
        addToast,
    });

    const collaborationNodePositions = useCollaborationNodePositions(
        collaborationEnabled,
        nodes,
        remotePresence.length
    );

    const actions = useFlowEditorActions({
        nodes,
        edges,
        activeTabName,
        recordHistory,
        setNodes,
        setEdges,
        fitView,
        t,
        addToast,
        exportSerializationMode,
    });

    return {
        collaborationTopNavState,
        remotePresence,
        collaborationNodePositions,
        ...actions,
    };
}

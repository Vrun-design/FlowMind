import { useCallback } from 'react';
import { useFlowStore } from '../../store';
import { createId } from '../../lib/id';
import { createMindmapEdge } from '@/constants';
import { relayoutMindmapComponent, resolveMindmapBranchStyleForNode, syncMindmapEdges } from '@/lib/mindmapLayout';
import { applyMindmapVisibility } from '@/lib/mindmapTree';
import { assignSmartHandlesWithOptions, getSmartRoutingOptionsFromViewSettings } from '../../services/smartEdgeRouting';
import { createMindmapTopicNode } from './utils';
import { requestNodeLabelEdit } from '../nodeLabelEditRequest';
import { resolveMindmapChildSide } from '@/lib/connectCreationPolicy';
import type { MindmapTopicSide } from '../mindmapTopicActionRequest';

export const useMindmapNodeOperations = (recordHistory: () => void) => {
    const { setNodes, setEdges, setSelectedNodeId } = useFlowStore();

    const insertMindmapTopic = useCallback((
        sourceNodeId: string,
        relationship: 'child' | 'sibling',
        preferredSideOverride: MindmapTopicSide = null
    ): boolean => {
        const state = useFlowStore.getState();
        const sourceNode = state.nodes.find((node) => node.id === sourceNodeId);
        if (!sourceNode || sourceNode.type !== 'mindmap') {
            return false;
        }

        const parentId = relationship === 'child' ? sourceNode.id : sourceNode.data?.mindmapParentId;
        if (!parentId) {
            return false;
        }

        const parentNode = state.nodes.find((node) => node.id === parentId);
        if (!parentNode || parentNode.type !== 'mindmap') {
            return false;
        }

        const sourceDepth = typeof sourceNode.data?.mindmapDepth === 'number' ? sourceNode.data.mindmapDepth : 0;
        const parentDepth = typeof parentNode.data?.mindmapDepth === 'number' ? parentNode.data.mindmapDepth : 0;
        const id = createId('mm');
        const { activeLayerId, viewSettings } = state;
        const inheritedSide = sourceNode.data?.mindmapSide === 'left' || sourceNode.data?.mindmapSide === 'right'
            ? sourceNode.data.mindmapSide
            : parentNode.data?.mindmapSide;
        const preferredSide = preferredSideOverride ?? resolveMindmapChildSide(parentDepth, inheritedSide, null);
        const branchStyle = resolveMindmapBranchStyleForNode(parentNode.id, state.nodes);

        const newNode = createMindmapTopicNode({
            id,
            position: {
                x: sourceNode.position.x + 260,
                y: sourceNode.position.y,
            },
            depth: relationship === 'child' ? sourceDepth + 1 : parentDepth + 1,
            parentId: parentNode.id,
            side: preferredSide,
            branchStyle,
            layerId: activeLayerId,
        });
        newNode.data.color = sourceNode.data?.color || parentNode.data?.color || 'slate';
        const insertedEdge = createMindmapEdge(parentNode, newNode, undefined, undefined, branchStyle);
        const nextNodes = relayoutMindmapComponent(
            [
                ...state.nodes.map((node) => ({ ...node, selected: false })),
                newNode,
            ],
            state.edges.concat(insertedEdge),
            sourceNode.id
        );
        const visibilityState = applyMindmapVisibility(nextNodes, state.edges.concat(insertedEdge));

        recordHistory();
        setNodes(() => visibilityState.nodes);
        setEdges((existingEdges) => {
                const insertedEdges = syncMindmapEdges(visibilityState.nodes, existingEdges.concat(insertedEdge));
                const visibleState = applyMindmapVisibility(visibilityState.nodes, insertedEdges);
                if (!viewSettings.smartRoutingEnabled) {
                    return visibleState.edges;
                }
            return assignSmartHandlesWithOptions(
                visibleState.nodes,
                visibleState.edges,
                getSmartRoutingOptionsFromViewSettings(viewSettings)
            );
        });
        setSelectedNodeId(id);
        requestNodeLabelEdit(id, { replaceExisting: true });
        return true;
    }, [recordHistory, setEdges, setNodes, setSelectedNodeId]);

    const handleAddMindmapChild = useCallback((parentId: string, preferredSide: MindmapTopicSide = null): boolean => {
        return insertMindmapTopic(parentId, 'child', preferredSide);
    }, [insertMindmapTopic]);

    const handleAddMindmapSibling = useCallback((nodeId: string): boolean => {
        return insertMindmapTopic(nodeId, 'sibling');
    }, [insertMindmapTopic]);

    return {
        insertMindmapTopic,
        handleAddMindmapChild,
        handleAddMindmapSibling,
    };
};

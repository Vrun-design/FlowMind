import { useCallback, useEffect, useRef } from 'react';
import { useReactFlow } from '@/lib/reactflowCompat';
import type { FlowNode, NodeData } from '@/lib/types';
import { clearNodeParent, getNodeParentId, setNodeParent } from '@/lib/nodeParent';
import { useFlowStore } from '../store';
import { assignSmartHandlesWithOptions, getSmartRoutingOptionsFromViewSettings } from '../services/smartEdgeRouting';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../lib/analytics';
import { createId } from '../lib/id';
import { createDefaultEdge } from '@/constants';
import {
    applySectionParenting,
    createSectionNode,
    getDefaultNodePosition,
} from './node-operations/utils';
import { getDragStopReconcileDelayMs } from './node-operations/dragStopReconcilePolicy';
import { useNodeOperationAdders } from './node-operations/useNodeOperationAdders';
import { requestNodeLabelEdit } from './nodeLabelEditRequest';

export const useNodeOperations = (recordHistory: () => void) => {
    const { t } = useTranslation();
    const { nodes, setNodes, setEdges, setSelectedNodeId } = useFlowStore();
    const { screenToFlowPosition } = useReactFlow();
    const dragStopReconcileTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (dragStopReconcileTimerRef.current !== null) {
                clearTimeout(dragStopReconcileTimerRef.current);
            }
        };
    }, []);

    const getAbsolutePosition = useCallback((node: FlowNode, allNodes: FlowNode[]): { x: number; y: number } => {
        let absoluteX = node.position.x;
        let absoluteY = node.position.y;
        let currentParentId = getNodeParentId(node);

        while (currentParentId) {
            const parentNode = allNodes.find((candidate) => candidate.id === currentParentId);
            if (!parentNode) {
                break;
            }
            absoluteX += parentNode.position.x;
            absoluteY += parentNode.position.y;
            currentParentId = getNodeParentId(parentNode);
        }

        return { x: absoluteX, y: absoluteY };
    }, []);

    // --- Node Data Updates ---
    const updateNodeData = useCallback((id: string, data: Partial<NodeData>) => {
        setNodes((nds) => {
            const targetNode = nds.find((node) => node.id === id);
            if (!targetNode) {
                return nds;
            }

            const rawBoundaryId = data.archBoundaryId;
            const hasBoundaryUpdate = typeof rawBoundaryId === 'string';
            if (targetNode.type !== 'architecture' || !hasBoundaryUpdate) {
                return nds.map((node) => (
                    node.id === id
                        ? { ...node, data: { ...node.data, ...data } }
                        : node
                ));
            }

            const requestedBoundaryId = rawBoundaryId.trim();
            const absolutePosition = getAbsolutePosition(targetNode, nds);

            if (requestedBoundaryId.length === 0) {
                return nds.map((node) => {
                    if (node.id !== id) {
                        return node;
                    }
                    const nextNode = {
                        ...node,
                        position: absolutePosition,
                        data: {
                            ...node.data,
                            ...data,
                            archBoundaryId: '',
                        },
                    } as FlowNode;
                    return clearNodeParent(nextNode);
                });
            }

            const boundaryNode = nds.find(
                (node) => node.id === requestedBoundaryId && node.type === 'section'
            );
            if (!boundaryNode) {
                return nds.map((node) => (
                    node.id === id
                        ? {
                            ...node,
                            data: {
                                ...node.data,
                                ...data,
                            },
                        }
                        : node
                ));
            }

            return nds.map((node) => {
                if (node.id !== id) {
                    return node;
                }

                return setNodeParent({
                    ...node,
                    position: {
                        x: absolutePosition.x - boundaryNode.position.x,
                        y: absolutePosition.y - boundaryNode.position.y,
                    },
                    data: {
                        ...node.data,
                        ...data,
                        archBoundaryId: boundaryNode.id,
                    },
                }, boundaryNode.id);
            });
        });
    }, [getAbsolutePosition, setNodes]);

    const applyBulkNodeData = useCallback((updates: Partial<NodeData>, labelPrefix = '', labelSuffix = '') => {
        const hasFieldUpdates = Object.keys(updates).length > 0;
        const hasLabelUpdates = labelPrefix.length > 0 || labelSuffix.length > 0;
        if (!hasFieldUpdates && !hasLabelUpdates) {
            return 0;
        }

        const selectedNodes = useFlowStore.getState().nodes.filter((node) => node.selected);
        if (selectedNodes.length === 0) {
            return 0;
        }

        const selectedIds = new Set(selectedNodes.map((node) => node.id));
        recordHistory();
        setNodes((nds) => nds.map((node) => {
            if (!selectedIds.has(node.id)) {
                return node;
            }

            const nextData: NodeData = { ...node.data, ...updates };
            if (hasLabelUpdates) {
                const baseLabel = node.data?.label ?? '';
                nextData.label = `${labelPrefix}${baseLabel}${labelSuffix}`;
            }

            return { ...node, data: nextData };
        }));

        return selectedNodes.length;
    }, [recordHistory, setNodes]);

    const updateNodeType = useCallback((id: string, type: string) => {
        recordHistory();
        setNodes((nds) => nds.map((node) => node.id === id ? { ...node, type } : node));
    }, [setNodes, recordHistory]);

    const updateNodeZIndex = useCallback((id: string, action: 'front' | 'back') => {
        recordHistory();
        setNodes((nds) => {
            const node = nds.find((n) => n.id === id);
            if (!node) return nds;

            const zIndices = nds.map((n) => n.zIndex || 0);
            const maxZ = Math.max(...zIndices, 0);
            const minZ = Math.min(...zIndices, 0);

            const newZ = action === 'front' ? maxZ + 1 : minZ - 1;

            return nds.map((n) => (n.id === id ? { ...n, zIndex: newZ } : n));
        });
    }, [setNodes, recordHistory]);

    // --- Delete ---
    const deleteNode = useCallback((id: string) => {
        const deletedNode = nodes.find(n => n.id === id);
        recordHistory();
        setNodes((nds) => nds.filter((n) => n.id !== id));
        setSelectedNodeId(null);
        if (deletedNode) {
            trackEvent('delete_node', { node_type: deletedNode.type });
        }
    }, [nodes, setNodes, recordHistory, setSelectedNodeId]);

    // --- Duplicate ---
    const duplicateNode = useCallback((id: string) => {
        const nodeToDuplicate = nodes.find((n) => n.id === id);
        if (!nodeToDuplicate) return;
        recordHistory();
        const newNodeId = createId();
        const newNode: FlowNode = {
            ...nodeToDuplicate,
            id: newNodeId,
            position: { x: nodeToDuplicate.position.x + 50, y: nodeToDuplicate.position.y + 50 },
            selected: true,
        };
        setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), newNode]);
        setSelectedNodeId(newNodeId);
        trackEvent('duplicate_node', { node_type: nodeToDuplicate.type });
    }, [nodes, recordHistory, setNodes, setSelectedNodeId]);

    // --- Add Nodes ---
    const {
        handleAddNode,
        handleAddAnnotation,
        handleAddJourneyNode,
        handleAddSection,
        handleAddTextNode,
        handleAddImage,
    } = useNodeOperationAdders({
        recordHistory,
        nodesLength: nodes.length,
        setNodes,
        setSelectedNodeId,
    });

    const handleAddMindmapChild = useCallback((parentId: string): boolean => {
        const state = useFlowStore.getState();
        const parentNode = state.nodes.find((node) => node.id === parentId);
        if (!parentNode || parentNode.type !== 'mindmap') {
            return false;
        }

        const parentDepth = typeof parentNode.data?.mindmapDepth === 'number' ? parentNode.data.mindmapDepth : 0;
        const childDepth = parentDepth + 1;
        const siblingEdges = state.edges.filter((edge) => edge.source === parentId);
        const id = createId('mm');
        const yOffset = siblingEdges.length === 0 ? 0 : siblingEdges.length * 110;
        const { activeLayerId, viewSettings } = state;

        const newNode: FlowNode = {
            id,
            type: 'mindmap',
            position: {
                x: parentNode.position.x + 260,
                y: parentNode.position.y + yOffset,
            },
            data: {
                label: t('nodes.newNode'),
                color: 'slate',
                shape: 'rectangle',
                mindmapDepth: childDepth,
                layerId: activeLayerId,
            },
            selected: true,
        };

        recordHistory();
        setNodes((existingNodes) => [
            ...existingNodes.map((node) => ({ ...node, selected: false })),
            newNode,
        ]);
        setEdges((existingEdges) => {
            const insertedEdges = existingEdges.concat(createDefaultEdge(parentId, id));
            if (!viewSettings.smartRoutingEnabled) {
                return insertedEdges;
            }
            return assignSmartHandlesWithOptions(
                useFlowStore.getState().nodes.concat(newNode),
                insertedEdges,
                getSmartRoutingOptionsFromViewSettings(viewSettings)
            );
        });
        setSelectedNodeId(id);
        trackEvent('add_node', { node_type: 'mindmap_child' });
        return true;
    }, [recordHistory, setNodes, setEdges, setSelectedNodeId, t]);

    const handleAddArchitectureService = useCallback((sourceId: string): boolean => {
        const state = useFlowStore.getState();
        const sourceNode = state.nodes.find((node) => node.id === sourceId);
        if (!sourceNode || sourceNode.type !== 'architecture') {
            return false;
        }

        const id = createId('arch');
        const { activeLayerId, viewSettings } = state;
        const sameBoundaryNodes = state.nodes.filter(
            (node) => node.type === 'architecture' && node.data?.archBoundaryId === sourceNode.data?.archBoundaryId
        );
        const yOffset = sameBoundaryNodes.length * 90;

        const newNode: FlowNode = {
            id,
            type: 'architecture',
            position: {
                x: sourceNode.position.x + 260,
                y: sourceNode.position.y + yOffset,
            },
            data: {
                label: 'New Service',
                color: 'slate',
                shape: 'rectangle',
                icon: 'Server',
                archProvider: sourceNode.data?.archProvider || 'custom',
                archResourceType: 'service',
                archEnvironment: sourceNode.data?.archEnvironment || 'default',
                archBoundaryId: sourceNode.data?.archBoundaryId,
                archZone: sourceNode.data?.archZone,
                archTrustDomain: sourceNode.data?.archTrustDomain,
                layerId: activeLayerId,
            },
            selected: true,
        };

        recordHistory();
        setNodes((existingNodes) => [
            ...existingNodes.map((node) => ({ ...node, selected: false })),
            newNode,
        ]);
        setEdges((existingEdges) => {
            const insertedEdges = existingEdges.concat(createDefaultEdge(sourceId, id));
            if (!viewSettings.smartRoutingEnabled) {
                return insertedEdges;
            }
            return assignSmartHandlesWithOptions(
                useFlowStore.getState().nodes.concat(newNode),
                insertedEdges,
                getSmartRoutingOptionsFromViewSettings(viewSettings)
            );
        });
        setSelectedNodeId(id);
        trackEvent('add_node', { node_type: 'architecture_service' });
        return true;
    }, [recordHistory, setNodes, setEdges, setSelectedNodeId]);

    const handleCreateArchitectureBoundary = useCallback((sourceId: string): boolean => {
        const state = useFlowStore.getState();
        const sourceNode = state.nodes.find((node) => node.id === sourceId);
        if (!sourceNode || sourceNode.type !== 'architecture') {
            return false;
        }
        const sourceAbsolutePosition = getAbsolutePosition(sourceNode, state.nodes);

        const boundaryId = createId('section');
        const { activeLayerId } = state;
        const boundaryLabel = `${sourceNode.data?.label || 'System'} Boundary`;
        const boundaryNode = createSectionNode(
            boundaryId,
            { x: sourceAbsolutePosition.x - 80, y: sourceAbsolutePosition.y - 70 },
            boundaryLabel
        );
        boundaryNode.style = { width: 360, height: 260 };
        boundaryNode.data = {
            ...boundaryNode.data,
            layerId: activeLayerId,
            archBoundaryId: boundaryId,
        };

        recordHistory();
        setNodes((existingNodes) => {
            const nextNodes: FlowNode[] = existingNodes.map((node) => {
                if (node.id === sourceId) {
                    return setNodeParent({
                        ...node,
                        position: {
                            x: sourceAbsolutePosition.x - boundaryNode.position.x,
                            y: sourceAbsolutePosition.y - boundaryNode.position.y,
                        },
                        data: {
                            ...node.data,
                            archBoundaryId: boundaryId,
                        },
                        selected: true,
                    }, boundaryId);
                }
                return { ...node, selected: false };
            });
            nextNodes.push({ ...boundaryNode, selected: false });
            return nextNodes;
        });
        setSelectedNodeId(sourceId);
        trackEvent('add_node', { node_type: 'architecture_boundary' });
        return true;
    }, [getAbsolutePosition, recordHistory, setNodes, setSelectedNodeId]);

    // --- Drag Operations ---
    const onNodeDragStart = useCallback((event: React.MouseEvent, node: FlowNode) => {
        recordHistory();

        // Alt + Drag Duplication
        if (event.altKey) {
            const newNodeId = createId();
            const newNode: FlowNode = {
                ...node,
                id: newNodeId,
                selected: false, // The static clone should not be selected
                position: { ...node.position }, // Clone executes at START position
                // We might want to reset zIndex or ensure it's correct?
                zIndex: (node.zIndex || 0) - 1, // Put clone slightly behind?
            };

            // Add the CLONE (which stays behind)
            setNodes((nds) => nds.concat(newNode));

            // The user continues dragging the ORIGINAL 'node'.
        }
    }, [recordHistory, setNodes]);

    const onNodeDrag = useCallback((_event: React.MouseEvent, _node: FlowNode, _draggedNodes: FlowNode[]) => {
        // Intentionally no smart-routing work during active drag to protect frame budget.
        // Full reconciliation still runs on drag stop via `onNodeDragStop`.
    }, []);

    const onNodeDragStop = useCallback((_event: React.MouseEvent, draggedNode: FlowNode) => {
        const { nodes: currentNodes } = useFlowStore.getState();
        const parentedNodes = applySectionParenting(currentNodes, draggedNode);
        if (parentedNodes !== currentNodes) {
            setNodes(parentedNodes);
        }

        const runReconcile = () => {
            const { nodes: latestNodes, edges: latestEdges, setEdges: setLatestEdges, viewSettings } = useFlowStore.getState();
            if (!viewSettings.smartRoutingEnabled) return;
            const smartEdges = assignSmartHandlesWithOptions(
                latestNodes,
                latestEdges,
                getSmartRoutingOptionsFromViewSettings(viewSettings)
            );
            setLatestEdges(smartEdges);
        };

        const { edges } = useFlowStore.getState();
        const delayMs = getDragStopReconcileDelayMs(parentedNodes.length, edges.length);
        if (delayMs === 0) {
            if (dragStopReconcileTimerRef.current !== null) {
                clearTimeout(dragStopReconcileTimerRef.current);
                dragStopReconcileTimerRef.current = null;
            }
            runReconcile();
            return;
        }

        if (dragStopReconcileTimerRef.current !== null) {
            clearTimeout(dragStopReconcileTimerRef.current);
        }
        dragStopReconcileTimerRef.current = setTimeout(() => {
            dragStopReconcileTimerRef.current = null;
            runReconcile();
        }, delayMs);

    }, [setNodes]);

    const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: FlowNode) => {
        setSelectedNodeId(node.id);
        requestNodeLabelEdit(node.id);
    }, [setSelectedNodeId]);


    return {
        updateNodeData,
        applyBulkNodeData,
        updateNodeType,
        updateNodeZIndex,
        deleteNode,
        duplicateNode,
        handleAddNode,
        handleAddAnnotation,
        handleAddJourneyNode,
        handleAddSection,
        handleAddTextNode,
        handleAddImage,
        handleAddMindmapChild,
        handleAddArchitectureService,
        handleCreateArchitectureBoundary,
        onNodeDragStart,
        onNodeDrag,
        onNodeDragStop,
        onNodeDoubleClick
    };
};

import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactFlow, {
    Background,
    Controls,
    useReactFlow,
    useViewport,
    toFlowNode,
} from '@/lib/reactflowCompat';
import { useFlowStore } from '../store';
import type { FlowNode, NodeData } from '../lib/types';
import { useFlowOperations } from '../hooks/useFlowOperations';
import { useModifierKeys } from '../hooks/useModifierKeys';
import { useEdgeInteractions } from '../hooks/useEdgeInteractions';
import CustomConnectionLine from './CustomConnectionLine';
import { NavigationControls } from './NavigationControls';
import { FlowCanvasOverlays } from './flow-canvas/FlowCanvasOverlays';
import { flowCanvasEdgeTypes, flowCanvasNodeTypes } from './flow-canvas/flowCanvasTypes';
import { useFlowCanvasMenusAndActions } from './flow-canvas/useFlowCanvasMenusAndActions';
import { useFlowCanvasDragDrop } from './flow-canvas/useFlowCanvasDragDrop';
import { useFlowCanvasConnectionState } from './flow-canvas/useFlowCanvasConnectionState';
import { useFlowCanvasPaste } from './flow-canvas/useFlowCanvasPaste';
import { useFlowCanvasInteractionLod } from './flow-canvas/useFlowCanvasInteractionLod';
import { useFlowCanvasViewState } from './flow-canvas/useFlowCanvasViewState';
import { useFlowCanvasReactFlowConfig } from './flow-canvas/useFlowCanvasReactFlowConfig';
import { useFlowCanvasSelectionTools } from './flow-canvas/useFlowCanvasSelectionTools';
import {
    isFarZoomReductionActiveForProfile,
    isLowDetailModeActiveForProfile,
} from './flow-canvas/largeGraphSafetyMode';
import { useToast } from './ui/ToastContext';
import { ROLLOUT_FLAGS } from '@/config/rolloutFlags';
import { isPaneTarget } from '@/hooks/edgeConnectInteractions';

interface FlowCanvasProps {
    recordHistory: () => void;
    isSelectMode: boolean;
    onCanvasEntityIntent?: () => void;
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({
    recordHistory,
    isSelectMode,
    onCanvasEntityIntent,
}) => {
    const { t } = useTranslation();
    const visualQualityV2Enabled = ROLLOUT_FLAGS.visualQualityV2;
    const canvasInteractionsV1Enabled = ROLLOUT_FLAGS.canvasInteractionsV1;
    const {
        nodes, edges,
        onNodesChange, onEdgesChange,
        layers,
        activeTabId,
        updateTab,
        setNodes,
        setEdges,
        setSelectedNodeId,
        setSelectedEdgeId,
        setMermaidDiagnostics,
        clearMermaidDiagnostics,
        viewSettings: { showGrid, snapToGrid, largeGraphSafetyMode, largeGraphSafetyProfile, architectureStrictMode },
    } = useFlowStore();
    const { addToast } = useToast();
    const {
        safetyModeActive,
        viewportCullingEnabled,
        effectiveShowGrid,
        layerAdjustedNodes,
        effectiveEdges,
    } = useFlowCanvasViewState({
        nodes,
        edges,
        layers,
        showGrid,
        largeGraphSafetyMode,
        largeGraphSafetyProfile,
    });
    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    const { screenToFlowPosition, fitView } = useReactFlow();
    const { zoom, x: viewportX, y: viewportY } = useViewport();
    const clearPaneSelection = useCallback((): void => {
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
    }, [setSelectedEdgeId, setSelectedNodeId]);

    // --- Operations ---
    const {
        onConnect, onSelectionChange, onNodeDoubleClick,
        onNodeDragStart, onNodeDragStop,
        onConnectStart, onConnectEnd,
        handleAddAndConnect,
        handleAddNode,
        updateNodeData,
        deleteNode, deleteEdge, duplicateNode,
        updateNodeZIndex,
        pasteSelection, copySelection,
        handleAlignNodes, handleDistributeNodes, handleGroupNodes,
        onReconnect,
        onNodeDrag,
        handleAddImage
    } = useFlowOperations(
        recordHistory,
        (position, sourceId, sourceHandle) => setConnectMenu({ position, sourceId, sourceHandle })
    );
    const {
        connectMenu,
        setConnectMenu,
        contextMenu,
        onNodeContextMenu,
        onPaneContextMenu,
        onEdgeContextMenu,
        onPaneClick,
        onCloseContextMenu,
        contextActions,
    } = useFlowCanvasMenusAndActions({
        onPaneSelectionClear: clearPaneSelection,
        screenToFlowPosition,
        copySelection,
        pasteSelection,
        duplicateNode,
        deleteNode,
        deleteEdge,
        updateNodeZIndex,
        handleAlignNodes,
        handleDistributeNodes,
        handleGroupNodes,
        nodes,
    });

    const { onDragOver, onDrop } = useFlowCanvasDragDrop({
        screenToFlowPosition,
        handleAddImage,
    });

    // --- Keyboard Shortcuts ---
    const { isSelectionModifierPressed } = useModifierKeys();
    useEdgeInteractions();

    const isEffectiveSelectMode = isSelectMode || isSelectionModifierPressed;
    const lowDetailModeActive = isLowDetailModeActiveForProfile(safetyModeActive, zoom, largeGraphSafetyProfile);
    const {
        interactionLowDetailModeActive,
        startInteractionLowDetail,
        endInteractionLowDetail,
    } = useFlowCanvasInteractionLod({
        safetyModeActive,
        largeGraphSafetyProfile,
    });
    const farZoomReductionActive = isFarZoomReductionActiveForProfile(safetyModeActive, zoom, largeGraphSafetyProfile);
    const reactFlowConfig = useFlowCanvasReactFlowConfig({
        visualQualityV2Enabled,
        isEffectiveSelectMode,
        viewportCullingEnabled,
        effectiveEdges,
    });
    const { isConnecting, onConnectStartWrapper, onConnectEndWrapper } = useFlowCanvasConnectionState({
        onConnectStart: (event, params) => {
            onConnectStart(event as Parameters<typeof onConnectStart>[0], params as Parameters<typeof onConnectStart>[1]);
        },
        onConnectEnd: (event) => {
            onConnectEnd(event as Parameters<typeof onConnectEnd>[0]);
        },
    });
    const getCanvasCenterFlowPosition = (): { x: number; y: number } => {
        if (!reactFlowWrapper.current) {
            return screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        }
        const rect = reactFlowWrapper.current.getBoundingClientRect();
        return screenToFlowPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        });
    };

    const {
        selectedVisibleNodes,
        quickToolbarAnchor,
        quickToolbarColorValue,
        singleSelectedNode,
        quickAddOverlay,
        isQuickAddHovering,
        setIsQuickAddHovering,
        onQuickToolbarDelete,
        onQuickToolbarDuplicate,
        onQuickToolbarAddConnected,
        onQuickToolbarColorChange,
        alignmentGuides,
        handleNodeDragStart,
        handleNodeDrag,
        handleNodeDragStop,
    } = useFlowCanvasSelectionTools({
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
        alignmentGuidesEnabled: canvasInteractionsV1Enabled,
        toTypedFlowNode: (node) => toTypedFlowNode(node as Parameters<typeof toFlowNode>[0]),
        onNodeDragStart: (event, node) => onNodeDragStart(event as Parameters<typeof onNodeDragStart>[0], node),
        onNodeDrag: (event, node, draggedNodes) => onNodeDrag(event as Parameters<typeof onNodeDrag>[0], node, draggedNodes),
        onNodeDragStop: (event, node) => onNodeDragStop(event as Parameters<typeof onNodeDragStop>[0], node),
        startInteractionLowDetail,
        endInteractionLowDetail,
    });

    const onCanvasDoubleClickCapture = (event: React.MouseEvent<HTMLDivElement>): void => {
        if (!canvasInteractionsV1Enabled) return;
        if (!isPaneTarget(event.target)) return;
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        handleAddNode(position);
    };

    function toTypedFlowNode(node: Parameters<typeof toFlowNode>[0]): FlowNode {
        return toFlowNode<NodeData>(node);
    }

    const { handleCanvasPaste } = useFlowCanvasPaste({
        architectureStrictMode,
        activeTabId,
        fitView,
        updateTab,
        recordHistory,
        setNodes,
        setEdges,
        setSelectedNodeId,
        setMermaidDiagnostics,
        clearMermaidDiagnostics,
        addToast,
        strictModePasteBlockedMessage: t(
            'flowCanvas.strictModePasteBlocked',
            'Architecture strict mode blocked Mermaid paste. Open Code view, fix diagnostics, then retry.'
        ),
        pasteSelection,
        getCanvasCenterFlowPosition,
    });

    return (
        <div
            className={`w-full h-full relative ${isConnecting ? 'is-connecting' : ''} ${lowDetailModeActive ? 'flow-lod-low' : ''} ${interactionLowDetailModeActive ? 'flow-lod-interaction' : ''} ${farZoomReductionActive ? 'flow-lod-far' : ''}`}
            ref={reactFlowWrapper}
            onPasteCapture={handleCanvasPaste}
            onDoubleClickCapture={onCanvasDoubleClickCapture}
        >
            <ReactFlow
                nodes={layerAdjustedNodes}
                edges={effectiveEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onReconnect={onReconnect}
                onSelectionChange={onSelectionChange}
                onNodeDragStart={handleNodeDragStart}
                onNodeDrag={handleNodeDrag}
                onNodeDragStop={handleNodeDragStop}
                onMoveStart={startInteractionLowDetail}
                onMoveEnd={endInteractionLowDetail}
                onNodeDoubleClick={onNodeDoubleClick}
                onNodeClick={onCanvasEntityIntent}
                onEdgeClick={onCanvasEntityIntent}
                onNodeContextMenu={onNodeContextMenu}
                onPaneContextMenu={onPaneContextMenu}
                onEdgeContextMenu={onEdgeContextMenu}
                onPaneClick={onPaneClick}

                onConnectStart={onConnectStartWrapper}
                onConnectEnd={onConnectEndWrapper}
                onDragOver={onDragOver}
                onDrop={onDrop}
                nodeTypes={flowCanvasNodeTypes}
                edgeTypes={flowCanvasEdgeTypes}
                fitView
                className={reactFlowConfig.className}
                minZoom={0.1}
                onlyRenderVisibleElements={reactFlowConfig.onlyRenderVisibleElements}
                connectionMode={reactFlowConfig.connectionMode}
                isValidConnection={reactFlowConfig.isValidConnection}
                selectionOnDrag={reactFlowConfig.selectionOnDrag}
                panOnDrag={reactFlowConfig.panOnDrag}
                selectionMode={reactFlowConfig.selectionMode}
                multiSelectionKeyCode={reactFlowConfig.multiSelectionKeyCode}
                defaultEdgeOptions={reactFlowConfig.defaultEdgeOptions}
                connectionLineComponent={CustomConnectionLine}
                snapToGrid={snapToGrid}
            >
                {effectiveShowGrid && (
                    <Background
                        variant={reactFlowConfig.background.variant}
                        gap={reactFlowConfig.background.gap}
                        size={reactFlowConfig.background.size}
                        color={reactFlowConfig.background.color}
                    />
                )}
                <NavigationControls />
            </ReactFlow>
            <FlowCanvasOverlays
                canvasInteractionsEnabled={canvasInteractionsV1Enabled}
                alignmentGuides={alignmentGuides}
                zoom={zoom}
                viewportX={viewportX}
                viewportY={viewportY}
                quickToolbarAnchor={quickToolbarAnchor}
                selectedVisibleNodes={selectedVisibleNodes}
                quickToolbarColorValue={quickToolbarColorValue}
                onQuickToolbarDelete={onQuickToolbarDelete}
                onQuickToolbarDuplicate={onQuickToolbarDuplicate}
                onQuickToolbarAddConnected={onQuickToolbarAddConnected}
                onQuickToolbarColorChange={onQuickToolbarColorChange}
                singleSelectedNode={singleSelectedNode}
                quickAddOverlay={quickAddOverlay}
                isQuickAddHovering={isQuickAddHovering}
                setIsQuickAddHovering={setIsQuickAddHovering}
                connectMenu={connectMenu}
                setConnectMenu={setConnectMenu}
                screenToFlowPosition={screenToFlowPosition}
                handleAddAndConnect={handleAddAndConnect}
                contextMenu={contextMenu}
                onCloseContextMenu={onCloseContextMenu}
                copySelection={copySelection}
                contextActions={contextActions}
            />
        </div>
    );
};

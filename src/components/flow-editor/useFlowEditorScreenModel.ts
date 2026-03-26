import { useCallback, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useReactFlow } from '@/lib/reactflowCompat';
import { useFlowStore } from '@/store';
import { useSnapshots } from '@/hooks/useSnapshots';
import { useFlowHistory } from '@/hooks/useFlowHistory';
import { useFlowOperations } from '@/hooks/useFlowOperations';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { useFlowExport } from '@/hooks/useFlowExport';
import { useToast } from '@/components/ui/ToastContext';
import { usePlayback } from '@/hooks/usePlayback';
import { useFlowEditorUIState } from '@/hooks/useFlowEditorUIState';
import { useFlowEditorCallbacks } from '@/hooks/useFlowEditorCallbacks';
import {
    buildFlowEditorScreenControllerParams,
} from './buildFlowEditorScreenControllerParams';
import { useFlowEditorController } from './useFlowEditorController';
import { useFlowEditorInteractionBindings } from './useFlowEditorInteractionBindings';
import { useFlowEditorPanelActions } from './useFlowEditorPanelActions';
import { useFlowEditorRuntime } from './useFlowEditorRuntime';
import { useShortcutHelpActions, useViewSettings } from '@/store/viewHooks';
import { useSelectionActions, useSelectionState } from '@/store/selectionHooks';
import type { FlowSnapshot } from '@/lib/types';
import { isRolloutFlagEnabled } from '@/config/rolloutFlags';

interface UseFlowEditorScreenModelParams {
    onGoHome: () => void;
}

export function useFlowEditorScreenModel({ onGoHome }: UseFlowEditorScreenModelParams) {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    const collaborationEnabled = isRolloutFlagEnabled('collaborationEnabled');

    const {
        nodes,
        edges,
        setNodes,
        setEdges,
        tabs,
        activeTabId,
        addTab,
        closeTab,
        updateTab,
        toggleGrid,
        toggleSnap,
    } = useFlowStore(useShallow((state) => ({
        nodes: state.nodes,
        edges: state.edges,
        setNodes: state.setNodes,
        setEdges: state.setEdges,
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        addTab: state.addTab,
        closeTab: state.closeTab,
        updateTab: state.updateTab,
        toggleGrid: state.toggleGrid,
        toggleSnap: state.toggleSnap,
    })));
    const viewSettings = useViewSettings();
    const { setShortcutsHelpOpen } = useShortcutHelpActions();
    const [diffBaseline, setDiffBaseline] = useState<FlowSnapshot | null>(null);
    const { selectedNodeId, selectedEdgeId } = useSelectionState();
    const { setSelectedNodeId, setSelectedEdgeId } = useSelectionActions();
    const { showGrid, snapToGrid } = viewSettings;

    const {
        snapshots,
        manualSnapshots,
        autoSnapshots,
        saveSnapshot,
        deleteSnapshot,
        queueAutoSnapshot,
        restoreSnapshot,
    } = useSnapshots();
    const {
        isHistoryOpen,
        isCommandBarOpen,
        commandBarView,
        editorMode,
        studioTab,
        studioCodeMode,
        isSelectMode,
        openHistory,
        closeHistory,
        openCommandBar,
        closeCommandBar,
        setCanvasMode,
        setStudioMode,
        setStudioTab,
        setStudioCodeMode,
        enableSelectMode,
        enablePanMode,
    } = useFlowEditorUIState();

    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { fitView, screenToFlowPosition, zoomIn, zoomOut } = useReactFlow();
    const { recordHistory, undo, redo, canUndo, canRedo } = useFlowHistory();

    const {
        updateNodeData, applyBulkNodeData, updateNodeType, updateNodeZIndex, updateEdge,
        deleteNode, deleteEdge, duplicateNode,
        handleAddNode, handleAddShape, handleAddJourneyNode, handleAddMindmapNode, handleAddArchitectureNode, handleAddClassNode, handleAddEntityNode, handleAddAnnotation, handleAddSection, handleAddTextNode, handleAddImage, handleAddWireframe, handleAddDomainLibraryItem, handleAddMindmapChild, handleAddMindmapSibling, handleAddArchitectureService, handleCreateArchitectureBoundary,
        handleApplyArchitectureTemplate, handleConvertEntitySelectionToClassDiagram,
        copySelection, pasteSelection, copyStyleSelection, pasteStyleSelection,
        createConnectedNodeInDirection,
    } = useFlowOperations(recordHistory);

    const selectedNodeType = useMemo(
        () => nodes.find((node) => node.id === selectedNodeId)?.type ?? null,
        [nodes, selectedNodeId]
    );

    const {
        getCenter,
        handleSwitchTab,
        handleAddTab,
        handleCloseTab,
        handleRenameTab,
        selectAll,
        handleRestoreSnapshot,
        handleCommandBarApply,
    } = useFlowEditorCallbacks({
        addTab,
        closeTab,
        updateTab,
        navigate,
        tabsLength: tabs.length,
        cannotCloseLastTabMessage: t('flowEditor.cannotCloseLastTab'),
        setNodes,
        setEdges,
        restoreSnapshot,
        recordHistory,
        fitView,
        screenToFlowPosition,
    });

    useFlowEditorInteractionBindings({
        selectedNodeId,
        selectedEdgeId,
        selectedNodeType,
        deleteNode,
        deleteEdge,
        undo,
        redo,
        duplicateNode,
        selectAll,
        handleAddMindmapChild,
        handleAddMindmapSibling,
        openCommandBar,
        setShortcutsHelpOpen,
        enableSelectMode,
        enablePanMode,
        fitView,
        zoomIn,
        zoomOut,
        copySelection,
        pasteSelection,
        copyStyleSelection,
        pasteStyleSelection,
        createConnectedNodeInDirection,
        updateNodeData,
        setSelectedNodeId,
        setSelectedEdgeId,
        setNodes,
        setEdges,
    });

    const [pendingAIPrompt, setPendingAIPrompt] = useState<string | undefined>();
    const clearPendingAIPrompt = useCallback(() => setPendingAIPrompt(undefined), []);
    const {
        isGenerating,
        streamingText,
        retryCount,
        cancelGeneration,
        pendingDiff,
        confirmPendingDiff,
        discardPendingDiff,
        readiness,
        lastError,
        handleAIRequest,
        handleFocusedAIRequest,
        handleCodeAnalysis,
        handleSqlAnalysis,
        handleTerraformAnalysis,
        handleOpenApiAnalysis,
        chatMessages,
        clearChat,
        clearLastError,
    } = useAIGeneration(recordHistory, handleCommandBarApply);

    const {
        handleGenerateEntityFields,
        handleSuggestArchitectureNode,
        handleOpenMermaidCodeEditor,
        applyArchitectureTemplate,
    } = useFlowEditorPanelActions({
        handleFocusedAIRequest,
        setStudioTab,
        setStudioCodeMode,
        setStudioMode,
        handleApplyArchitectureTemplate,
    });

    const {
        isPlaying,
        currentStepIndex,
        totalSteps,
        startPlayback,
        stopPlayback,
        togglePlay,
        nextStep,
        prevStep,
        setPlaybackSpeed,
        playbackSpeed,
        jumpToStep,
    } = usePlayback();

    const {
        fileInputRef,
        handleExport,
        handleSvgExport,
        handlePdfExport,
        handleAnimatedExport,
        handleRevealExport,
        handleExportJSON,
        handleImportJSON,
        onFileImport,
    } = useFlowExport(recordHistory, reactFlowWrapper, {
        jumpToStep,
        stopPlayback,
        playbackSpeed,
    });

    const {
        collaborationTopNavState,
        remotePresence,
        collaborationNodePositions,
        isLayouting,
        onLayout,
        handleInsertTemplate,
        handleExportMermaid,
        handleExportPlantUML,
        handleExportOpenFlowDSL,
        handleExportFigma,
        handleShare,
        shareViewerUrl,
        clearShareViewerUrl,
    } = useFlowEditorRuntime({
        collaborationEnabled,
        activeTabId,
        nodes,
        edges,
        editorSurfaceRef: reactFlowWrapper,
        setNodes,
        setEdges,
        addToast,
        recordHistory,
        fitView,
        t,
        exportSerializationMode: viewSettings.exportSerializationMode,
        queueAutoSnapshot,
    });

    const flowEditorControllerConfig = buildFlowEditorScreenControllerParams({
        shell: {
            location,
            navigate,
            tabs,
            activeTabId,
            snapshots,
            nodes,
            edges,
            selectedNodeId,
            selectedEdgeId,
            isCommandBarOpen,
            isHistoryOpen,
            editorMode,
            handleExportJSON,
            onLayout,
            fileInputRef,
        },
        studio: {
            editorMode,
            studioTab,
            selectedNodeId,
            selectedEdgeId,
            setStudioTab,
            setStudioCodeMode,
            setStudioMode,
            closeCommandBar,
            setCanvasMode,
            setSelectedNodeId,
            setSelectedEdgeId,
        },
        panels: {
            commandBar: {
                commandBarView,
                undo,
                redo,
                handleInsertTemplate,
                showGrid,
                toggleGrid,
                snapToGrid,
                toggleSnap,
                handleCodeAnalysis,
                handleSqlAnalysis,
                handleTerraformAnalysis,
                handleOpenApiAnalysis,
            },
            snapshots: {
                closeHistory,
                manualSnapshots,
                autoSnapshots,
                saveSnapshot,
                handleRestoreSnapshot,
                deleteSnapshot,
                setDiffBaseline,
            },
            properties: {
                updateNodeData,
                applyBulkNodeData,
                updateNodeType,
                updateEdge,
                deleteNode,
                duplicateNode,
                deleteEdge,
                updateNodeZIndex,
                handleAddMindmapChild,
                handleAddMindmapSibling,
                handleAddArchitectureService,
                handleCreateArchitectureBoundary,
                handleApplyArchitectureTemplate: applyArchitectureTemplate,
                handleGenerateEntityFields,
                handleSuggestArchitectureNode,
                handleConvertEntitySelectionToClassDiagram,
                handleOpenMermaidCodeEditor,
            },
            studio: {
                handleCommandBarApply,
                handleAIRequest,
                isGenerating,
                streamingText,
                retryCount,
                cancelGeneration,
                pendingDiff,
                confirmPendingDiff,
                discardPendingDiff,
                aiReadiness: readiness,
                lastAIError: lastError,
                onClearAIError: clearLastError,
                chatMessages,
                clearChat,
                studioCodeMode,
                playback: {
                    currentStepIndex,
                    totalSteps,
                    isPlaying,
                    startPlayback,
                    togglePlay,
                    stopPlayback,
                    jumpToStep,
                    nextStep,
                    prevStep,
                    playbackSpeed,
                    setPlaybackSpeed,
                },
                pendingAIPrompt,
                clearPendingAIPrompt,
            },
            isHistoryOpen,
            editorMode,
        },
        chrome: {
            handleSwitchTab,
            handleAddTab,
            handleCloseTab,
            handleRenameTab,
            handleExport,
            handleSvgExport,
            handlePdfExport,
            handleAnimatedExport,
            handleRevealExport,
            handleExportMermaid,
            handleExportPlantUML,
            handleExportOpenFlowDSL,
            handleExportFigma,
            handleShare,
            handleImportJSON,
            openHistory,
            onGoHome,
            collaborationTopNavState,
            openCommandBar,
            handleAddShape,
            undo,
            redo,
            canUndo,
            canRedo,
            isSelectMode,
            enableSelectMode,
            enablePanMode,
            getCenter,
            t,
            handleAddNode,
            setPendingAIPrompt,
            startPlayback,
            totalSteps,
            isPlaying,
            togglePlay,
            nextStep,
            prevStep,
            stopPlayback,
            handleAddAnnotation,
            handleAddSection,
            handleAddTextNode,
            handleAddJourneyNode,
            handleAddMindmapNode,
            handleAddArchitectureNode,
            handleAddClassNode,
            handleAddEntityNode,
            handleAddImage,
            handleAddWireframe,
            handleAddDomainLibraryItem,
        },
    });
    const flowEditorController = useFlowEditorController(flowEditorControllerConfig);

    return {
        nodes,
        edges,
        tabs,
        activeTabId,
        viewSettings,
        diffBaseline,
        setDiffBaseline,
        recordHistory,
        isSelectMode,
        reactFlowWrapper,
        fileInputRef,
        onFileImport,
        shareViewerUrl,
        clearShareViewerUrl,
        collaborationEnabled,
        remotePresence,
        collaborationNodePositions,
        isLayouting,
        flowEditorController,
        t,
    };
}

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useReactFlow } from '@/lib/reactflowCompat';
import { ROLLOUT_FLAGS } from '@/config/rolloutFlags';
import { useFlowStore } from '../store';
import { Toolbar } from './Toolbar';
import { FlowCanvas } from './FlowCanvas';
import { TopNav } from './TopNav';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { ErrorBoundary } from './ErrorBoundary';
import { useSnapshots } from '../hooks/useSnapshots';
import { useFlowHistory } from '../hooks/useFlowHistory';
import { useFlowOperations } from '../hooks/useFlowOperations';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useAIGeneration } from '../hooks/useAIGeneration';
import { useFlowExport } from '../hooks/useFlowExport';
import { useToast } from './ui/ToastContext';
import { usePlayback } from '../hooks/usePlayback';
import { PlaybackControls } from './PlaybackControls';
import { useFlowEditorUIState } from '@/hooks/useFlowEditorUIState';
import { useFlowEditorActions } from '@/hooks/useFlowEditorActions';
import { useFlowEditorCallbacks } from '@/hooks/useFlowEditorCallbacks';
import { FlowEditorPanels } from './FlowEditorPanels';
import { FlowEditorLayoutOverlay } from './FlowEditorLayoutOverlay';
import { FlowEditorEmptyState } from './FlowEditorEmptyState';
import { CollaborationPresenceOverlay } from './flow-editor/CollaborationPresenceOverlay';
import { shouldExitStudioOnSelection } from './flow-editor/shouldExitStudioOnSelection';
import { useStoragePressureGuard } from '@/hooks/useStoragePressureGuard';
import { useAnimatedEdgePerformanceWarning } from '@/hooks/useAnimatedEdgePerformanceWarning';
import { useFlowEditorCollaboration } from '@/hooks/useFlowEditorCollaboration';
import type { StudioCodeMode, StudioTab } from '@/hooks/useFlowEditorUIState';

interface FlowEditorProps {
    onGoHome: () => void;
}

export function FlowEditor({ onGoHome }: FlowEditorProps) {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const collaborationV1Enabled = ROLLOUT_FLAGS.collaborationV1;

    // --- Global Store ---
    const {
        nodes, edges, setNodes, setEdges,
        tabs, activeTabId, addTab, closeTab, updateTab,
        viewSettings, toggleGrid, toggleSnap,
        selectedNodeId, setSelectedNodeId, selectedEdgeId, setSelectedEdgeId,
        setShortcutsHelpOpen
    } = useFlowStore();

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
    const studioSelectionSnapshotRef = useRef({
        selectedNodeId: null as string | null,
        selectedEdgeId: null as string | null,
    });
    const { fitView, screenToFlowPosition } = useReactFlow();

    // --- History ---
    const { recordHistory, undo, redo, canUndo, canRedo } = useFlowHistory();

    // --- Core Operations ---
    const {
        updateNodeData, applyBulkNodeData, updateNodeType, updateNodeZIndex, updateEdge,
        deleteNode, deleteEdge, duplicateNode,
        handleAddNode, handleAddJourneyNode, handleAddAnnotation, handleAddSection, handleAddTextNode, handleAddImage, handleAddMindmapChild, handleAddArchitectureService, handleCreateArchitectureBoundary,
        handleClear
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

    // --- Keyboard Shortcuts ---
    useKeyboardShortcuts({
        selectedNodeId, selectedEdgeId,
        deleteNode, deleteEdge, undo, redo, duplicateNode, selectAll,
        selectedNodeType,
        onAddMindmapChildShortcut: () => {
            if (selectedNodeId) {
                handleAddMindmapChild(selectedNodeId);
            }
        },
        onCommandBar: () => openCommandBar('root'),
        onSearch: () => openCommandBar('search'),
        onShortcutsHelp: () => setShortcutsHelpOpen(true),
        onSelectMode: enableSelectMode,
        onPanMode: enablePanMode,
    });

    // --- AI ---
    const { isGenerating, handleAIRequest, chatMessages, clearChat } = useAIGeneration(
        recordHistory
    );

    // --- Export ---
    const { fileInputRef, handleExport, handleExportJSON, handleImportJSON, onFileImport } = useFlowExport(
        recordHistory, reactFlowWrapper
    );
    const storageGuardTrigger = useMemo(
        () => `${tabs.length}:${snapshots.length}:${nodes.length}:${edges.length}`,
        [tabs.length, snapshots.length, nodes.length, edges.length]
    );
    useStoragePressureGuard({
        trigger: storageGuardTrigger,
        onExportJSON: handleExportJSON,
    });
    useAnimatedEdgePerformanceWarning({
        nodeCount: nodes.length,
        edges,
    });

    useEffect(() => {
        queueAutoSnapshot(nodes, edges);
    }, [edges, nodes, queueAutoSnapshot]);

    const {
        collaborationTopNavState,
        remotePresence,
    } = useFlowEditorCollaboration({
        collaborationEnabled: collaborationV1Enabled,
        activeTabId,
        nodes,
        edges,
        setNodes,
        setEdges,
        addToast,
    });

    // --- Playback ---
    const {
        isPlaying,
        currentStepIndex,
        totalSteps,
        startPlayback,
        stopPlayback,
        togglePlay,
        nextStep,
        prevStep
    } = usePlayback();

    const {
        isLayouting,
        onLayout,
        handleInsertTemplate,
        handleExportMermaid,
        handleExportPlantUML,
        handleExportOpenFlowDSL,
        handleExportFigma,
    } = useFlowEditorActions({
        nodes,
        edges,
        recordHistory,
        setNodes,
        setEdges,
        fitView,
        t,
        addToast,
        exportSerializationMode: viewSettings.exportSerializationMode,
    });

    // --- Derived State ---
    const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);
    const selectedNodes = useMemo(() => nodes.filter((node) => node.selected), [nodes]);
    const selectedEdge = useMemo(() => edges.find((e) => e.id === selectedEdgeId) || null, [edges, selectedEdgeId]);
    const captureStudioSelectionSnapshot = useCallback(() => {
        studioSelectionSnapshotRef.current = {
            selectedNodeId,
            selectedEdgeId,
        };
    }, [selectedEdgeId, selectedNodeId]);
    const openStudioPanel = useCallback((
        tab: StudioTab,
        options?: {
            codeMode?: StudioCodeMode;
            closeLauncher?: boolean;
        }
    ) => {
        captureStudioSelectionSnapshot();
        setStudioTab(tab);
        if (options?.codeMode) {
            setStudioCodeMode(options.codeMode);
        }
        setStudioMode();
        if (options?.closeLauncher) {
            closeCommandBar();
        }
    }, [captureStudioSelectionSnapshot, closeCommandBar, setStudioCodeMode, setStudioMode, setStudioTab]);

    const openStudioAI = useCallback(() => {
        openStudioPanel('ai', { closeLauncher: true });
    }, [openStudioPanel]);

    const openStudioCode = useCallback((codeMode: StudioCodeMode) => {
        openStudioPanel('code', { codeMode, closeLauncher: true });
    }, [openStudioPanel]);

    const toggleStudioPanel = useCallback(() => {
        if (editorMode === 'studio') {
            setSelectedNodeId(null);
            setSelectedEdgeId(null);
            setCanvasMode();
            return;
        }

        openStudioAI();
    }, [editorMode, openStudioAI, setCanvasMode, setSelectedEdgeId, setSelectedNodeId]);

    const closeStudioPanel = useCallback(() => {
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        setCanvasMode();
    }, [setCanvasMode, setSelectedEdgeId, setSelectedNodeId]);

    const handleCanvasEntityIntent = useCallback(() => {
        if (editorMode !== 'studio') {
            return;
        }

        setCanvasMode();
    }, [editorMode, setCanvasMode]);

    useEffect(() => {
        if (!shouldExitStudioOnSelection({
            editorMode,
            studioSelectionSnapshot: studioSelectionSnapshotRef.current,
            selectedNodeId,
            selectedEdgeId,
        })) {
            return;
        }

        setCanvasMode();
    }, [editorMode, selectedEdgeId, selectedNodeId, setCanvasMode]);

    return (
        <div className="w-full h-screen bg-[var(--brand-background)] flex flex-col relative" ref={reactFlowWrapper}>
            {/* Header */}
            <TopNav
                tabs={tabs}
                activeTabId={activeTabId}
                onSwitchTab={handleSwitchTab}
                onAddTab={handleAddTab}
                onCloseTab={handleCloseTab}
                onRenameTab={handleRenameTab}
                onExportPNG={handleExport}
                onExportJSON={handleExportJSON}
                onExportMermaid={handleExportMermaid}
                onExportPlantUML={handleExportPlantUML}
                onExportOpenFlowDSL={handleExportOpenFlowDSL}
                onExportFigma={handleExportFigma}
                onImportJSON={handleImportJSON}
                onHistory={openHistory}
                onGoHome={onGoHome}
                onPlay={startPlayback}
                collaboration={collaborationTopNavState}
            />

            <div className="flex min-h-0 flex-1 min-w-0 pt-16">
                <div className="relative min-w-0 flex-1">
                    <ErrorBoundary className="h-full">
                        <FlowCanvas
                            recordHistory={recordHistory}
                            isSelectMode={isSelectMode}
                            onCanvasEntityIntent={handleCanvasEntityIntent}
                        />
                    </ErrorBoundary>
                </div>
                <FlowEditorPanels
                    commandBar={{
                        isOpen: isCommandBarOpen,
                        onClose: closeCommandBar,
                        nodes,
                        edges,
                        onUndo: undo,
                        onRedo: redo,
                        onLayout,
                        onSelectTemplate: handleInsertTemplate,
                        onOpenStudioAI: openStudioAI,
                        onOpenStudioFlowMind: () => openStudioCode('flowmind'),
                        onOpenStudioMermaid: () => openStudioCode('mermaid'),
                        initialView: commandBarView,
                        showGrid,
                        onToggleGrid: toggleGrid,
                        snapToGrid,
                        onToggleSnap: toggleSnap,
                    }}
                    snapshots={{
                        isOpen: isHistoryOpen,
                        onClose: closeHistory,
                        snapshots,
                        manualSnapshots,
                        autoSnapshots,
                        onSaveSnapshot: (name) => saveSnapshot(name, nodes, edges),
                        onRestoreSnapshot: handleRestoreSnapshot,
                        onDeleteSnapshot: deleteSnapshot,
                    }}
                    properties={{
                        selectedNode,
                        selectedNodes,
                        selectedEdge,
                        onChangeNode: updateNodeData,
                        onBulkChangeNodes: applyBulkNodeData,
                        onChangeNodeType: updateNodeType,
                        onChangeEdge: updateEdge,
                        onDeleteNode: deleteNode,
                        onDuplicateNode: duplicateNode,
                        onDeleteEdge: deleteEdge,
                        onUpdateZIndex: updateNodeZIndex,
                        onAddMindmapChild: handleAddMindmapChild,
                        onAddArchitectureService: handleAddArchitectureService,
                        onCreateArchitectureBoundary: handleCreateArchitectureBoundary,
                        onClose: () => {
                            setSelectedNodeId(null);
                            setSelectedEdgeId(null);
                        },
                    }}
                    studio={{
                        onClose: closeStudioPanel,
                        onApply: handleCommandBarApply,
                        onAIGenerate: handleAIRequest,
                        isGenerating,
                        chatMessages,
                        onClearChat: clearChat,
                        activeTab: studioTab,
                        onTabChange: setStudioTab,
                        codeMode: studioCodeMode,
                        onCodeModeChange: setStudioCodeMode,
                    }}
                    isHistoryOpen={isHistoryOpen}
                    editorMode={editorMode}
                />
            </div>
            {collaborationV1Enabled && <CollaborationPresenceOverlay remotePresence={remotePresence} />}

            {/* Layout loading overlay */}
            {isLayouting && <FlowEditorLayoutOverlay message={t('flowEditor.applyingLayout')} />}

            {/* Toolbar (Hidden during playback) */}
            {currentStepIndex === -1 && (
                <Toolbar
                    onCommandBar={() => openCommandBar('root')}
                    onToggleStudio={toggleStudioPanel}
                    isStudioOpen={editorMode === 'studio'}
                    onClear={handleClear}
                    onAddNode={handleAddNode}
                    onAddAnnotation={handleAddAnnotation}
                    onAddSection={handleAddSection}
                    onAddText={handleAddTextNode}
                    onAddImage={handleAddImage}
                    onAddWireframes={() => openCommandBar('wireframes')}
                    onUndo={undo}
                    onRedo={redo}
                    onLayout={() => openCommandBar('layout')}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    isSelectMode={isSelectMode}
                    onToggleSelectMode={enableSelectMode}
                    isCommandBarOpen={isCommandBarOpen}
                    onTogglePanMode={enablePanMode}
                    getCenter={getCenter}
                />
            )}

            {/* Playback Controls Overlay - Force Rebuild */}
            {currentStepIndex >= 0 && (
                <PlaybackControls
                    isPlaying={isPlaying}
                    currentStepIndex={currentStepIndex}
                    totalSteps={totalSteps}
                    onPlayPause={togglePlay}
                    onNext={nextStep}
                    onPrev={prevStep}
                    onStop={stopPlayback}
                />
            )}

            {/* Empty State */}
            {nodes.length === 0 && (
                <FlowEditorEmptyState
                    title={t('flowEditor.emptyState.title')}
                    description={t('flowEditor.emptyState.description')}
                    generateLabel={t('flowEditor.emptyState.generateWithFlowpilot')}
                    templatesLabel={t('flowEditor.emptyState.browseTemplates')}
                    addNodeLabel={t('flowEditor.emptyState.addBlankNode')}
                    onGenerate={() => openStudioPanel('ai')}
                    onTemplates={() => openCommandBar('templates')}
                    onAddNode={() => handleAddNode()}
                />
            )}

            {/* Hidden file input for JSON import */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={onFileImport}
                className="hidden"
                id="json-import-input"
            />

            <KeyboardShortcutsModal />
        </div>
    );
};

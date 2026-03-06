import React from 'react';
import { CommandBar } from './CommandBar';
import { ErrorBoundary } from './ErrorBoundary';
import { PropertiesPanel } from './PropertiesPanel';
import { RightRail } from './RightRail';
import { SnapshotsPanel } from './SnapshotsPanel';
import { StudioPanel } from './StudioPanel';
import type { FlowEdge, FlowNode, FlowSnapshot } from '@/lib/types';
import type { ChatMessage } from '@/services/aiService';
import type { CommandBarView, FlowEditorMode, StudioCodeMode, StudioTab } from '@/hooks/useFlowEditorUIState';
import type { LayoutAlgorithm } from '@/services/elkLayout';
import type { FlowTemplate } from '@/services/templates';
import type { EdgeData, NodeData } from '@/lib/types';

interface CommandBarPanelProps {
    isOpen: boolean;
    onClose: () => void;
    nodes: FlowNode[];
    edges: FlowEdge[];
    onUndo: () => void;
    onRedo: () => void;
    onLayout: (
        direction?: 'TB' | 'LR' | 'RL' | 'BT',
        algorithm?: LayoutAlgorithm,
        spacing?: 'compact' | 'normal' | 'loose'
    ) => Promise<void>;
    onSelectTemplate: (template: FlowTemplate) => void;
    onOpenStudioAI: () => void;
    onOpenStudioFlowMind: () => void;
    onOpenStudioMermaid: () => void;
    initialView: CommandBarView;
    showGrid: boolean;
    onToggleGrid: () => void;
    snapToGrid: boolean;
    onToggleSnap: () => void;
}

interface SnapshotsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    snapshots: FlowSnapshot[];
    manualSnapshots: FlowSnapshot[];
    autoSnapshots: FlowSnapshot[];
    onSaveSnapshot: (name: string) => void;
    onRestoreSnapshot: (snapshot: FlowSnapshot) => void;
    onDeleteSnapshot: (id: string) => void;
}

interface PropertiesRailProps {
    selectedNode: FlowNode | null;
    selectedNodes: FlowNode[];
    selectedEdge: FlowEdge | null;
    onChangeNode: (id: string, data: Partial<NodeData>) => void;
    onBulkChangeNodes: React.ComponentProps<typeof PropertiesPanel>['onBulkChangeNodes'];
    onChangeNodeType: (id: string, type: string) => void;
    onChangeEdge: (id: string, data: Partial<EdgeData>) => void;
    onDeleteNode: (id: string) => void;
    onDuplicateNode: (id: string) => void;
    onDeleteEdge: (id: string) => void;
    onUpdateZIndex: (id: string, action: 'front' | 'back') => void;
    onAddMindmapChild: React.ComponentProps<typeof PropertiesPanel>['onAddMindmapChild'];
    onAddArchitectureService: React.ComponentProps<typeof PropertiesPanel>['onAddArchitectureService'];
    onCreateArchitectureBoundary: React.ComponentProps<typeof PropertiesPanel>['onCreateArchitectureBoundary'];
    onClose: () => void;
}

interface StudioRailProps {
    onClose: () => void;
    onApply: (nodes: FlowNode[], edges: FlowEdge[]) => void;
    onAIGenerate: (prompt: string, imageBase64?: string) => Promise<void>;
    isGenerating: boolean;
    chatMessages: ChatMessage[];
    onClearChat: () => void;
    activeTab: StudioTab;
    onTabChange: (tab: StudioTab) => void;
    codeMode: StudioCodeMode;
    onCodeModeChange: (mode: StudioCodeMode) => void;
}

interface FlowEditorPanelsProps {
    commandBar: CommandBarPanelProps;
    snapshots: SnapshotsPanelProps;
    properties: PropertiesRailProps;
    studio: StudioRailProps;
    isHistoryOpen: boolean;
    editorMode: FlowEditorMode;
}

export function FlowEditorPanels({
    commandBar,
    snapshots,
    properties,
    studio,
    isHistoryOpen,
    editorMode,
}: FlowEditorPanelsProps): React.ReactElement {
    const showPropertiesRail = editorMode === 'canvas' && Boolean(properties.selectedNode || properties.selectedEdge);
    const showStudioRail = editorMode === 'studio';
    const railContent = showStudioRail ? (
        <StudioPanel
            onClose={studio.onClose}
            nodes={commandBar.nodes}
            edges={commandBar.edges}
            onApply={studio.onApply}
            onAIGenerate={studio.onAIGenerate}
            isGenerating={studio.isGenerating}
            chatMessages={studio.chatMessages}
            onClearChat={studio.onClearChat}
            activeTab={studio.activeTab}
            onTabChange={studio.onTabChange}
            codeMode={studio.codeMode}
            onCodeModeChange={studio.onCodeModeChange}
        />
    ) : showPropertiesRail ? (
        <PropertiesPanel
            selectedNodes={properties.selectedNodes}
            selectedNode={properties.selectedNode}
            selectedEdge={properties.selectedEdge}
            onChangeNode={properties.onChangeNode}
            onBulkChangeNodes={properties.onBulkChangeNodes}
            onChangeNodeType={properties.onChangeNodeType}
            onChangeEdge={properties.onChangeEdge}
            onDeleteNode={properties.onDeleteNode}
            onDuplicateNode={properties.onDuplicateNode}
            onDeleteEdge={properties.onDeleteEdge}
            onUpdateZIndex={properties.onUpdateZIndex}
            onAddMindmapChild={properties.onAddMindmapChild}
            onAddArchitectureService={properties.onAddArchitectureService}
            onCreateArchitectureBoundary={properties.onCreateArchitectureBoundary}
            onClose={properties.onClose}
        />
    ) : null;

    return (
        <>
            <ErrorBoundary className="h-auto">
                <CommandBar
                    isOpen={commandBar.isOpen}
                    onClose={commandBar.onClose}
                    nodes={commandBar.nodes}
                    edges={commandBar.edges}
                    onUndo={commandBar.onUndo}
                    onRedo={commandBar.onRedo}
                    onLayout={commandBar.onLayout}
                    onSelectTemplate={commandBar.onSelectTemplate}
                    onOpenStudioAI={commandBar.onOpenStudioAI}
                    onOpenStudioFlowMind={commandBar.onOpenStudioFlowMind}
                    onOpenStudioMermaid={commandBar.onOpenStudioMermaid}
                    initialView={commandBar.initialView}
                    settings={{
                        showGrid: commandBar.showGrid,
                        onToggleGrid: commandBar.onToggleGrid,
                        snapToGrid: commandBar.snapToGrid,
                        onToggleSnap: commandBar.onToggleSnap,
                    }}
                />
            </ErrorBoundary>

            <SnapshotsPanel
                isOpen={isHistoryOpen}
                onClose={snapshots.onClose}
                snapshots={snapshots.snapshots}
                manualSnapshots={snapshots.manualSnapshots}
                autoSnapshots={snapshots.autoSnapshots}
                onSaveSnapshot={snapshots.onSaveSnapshot}
                onRestoreSnapshot={snapshots.onRestoreSnapshot}
                onDeleteSnapshot={snapshots.onDeleteSnapshot}
            />

            <ErrorBoundary className="h-full">
                {railContent ? <RightRail>{railContent}</RightRail> : null}
            </ErrorBoundary>
        </>
    );
}

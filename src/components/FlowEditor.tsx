import React from 'react';
import '@xyflow/react/dist/style.css';
import { FlowCanvas } from './FlowCanvas';
import { FlowEditorChrome } from './flow-editor/FlowEditorChrome';
import { useFlowEditorScreenModel } from './flow-editor/useFlowEditorScreenModel';
import { ArchitectureLintProvider } from '@/context/ArchitectureLintContext';
import { DiagramDiffProvider } from '@/context/DiagramDiffContext';
import { ShareEmbedModal } from '@/components/ShareEmbedModal';

interface FlowEditorProps {
    onGoHome: () => void;
}

export function FlowEditor({ onGoHome }: FlowEditorProps) {
    const {
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
    } = useFlowEditorScreenModel({ onGoHome });

    return (
        <DiagramDiffProvider nodes={nodes} edges={edges} baselineSnapshot={diffBaseline} onStopCompare={() => setDiffBaseline(null)}>
            <ArchitectureLintProvider nodes={nodes} edges={edges} rulesJson={viewSettings.lintRules}>
                <div className="w-full h-screen bg-[var(--brand-background)] flex flex-col relative" ref={reactFlowWrapper}>
                    <FlowEditorChrome
                        tabs={tabs}
                        activeTabId={activeTabId}
                        topNav={flowEditorController.chrome.topNav}
                        canvas={(
                            <FlowCanvas
                                recordHistory={recordHistory}
                                isSelectMode={isSelectMode}
                                onCanvasEntityIntent={flowEditorController.handleCanvasEntityIntent}
                            />
                        )}
                        shouldRenderPanels={flowEditorController.shouldRenderPanels}
                        panels={flowEditorController.panels}
                        collaborationEnabled={collaborationEnabled}
                        remotePresence={remotePresence}
                        collaborationNodePositions={collaborationNodePositions}
                        layoutMessage={t('flowEditor.applyingLayout')}
                        isLayouting={isLayouting}
                        playback={flowEditorController.chrome.playback}
                        toolbar={flowEditorController.chrome.toolbar}
                        emptyState={flowEditorController.chrome.emptyState}
                    />

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={onFileImport}
                        className="hidden"
                        id="json-import-input"
                    />
                    {shareViewerUrl && (
                        <ShareEmbedModal viewerUrl={shareViewerUrl} onClose={clearShareViewerUrl} />
                    )}
                </div>
            </ArchitectureLintProvider>
        </DiagramDiffProvider>
    );
}

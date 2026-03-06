import React from 'react';
import type { NodeData } from '@/lib/types';
import type { ConnectMenuState, ContextMenuState } from './useFlowCanvasMenus';
import type { UseFlowCanvasContextActionsResult } from './useFlowCanvasContextActions';
import { ConnectMenu } from '../ConnectMenu';
import { ContextMenu } from '../ContextMenu';
import { FlowCanvasAlignmentGuidesOverlay } from './FlowCanvasAlignmentGuidesOverlay';
import { FlowCanvasQuickActions } from './FlowCanvasQuickActions';
import type { AlignmentGuides } from './alignmentGuides';
import type { FlowCanvasQuickAddOverlay } from './useFlowCanvasQuickActions';
import type { FlowNode } from '@/lib/types';

interface FlowCanvasOverlaysProps {
    canvasInteractionsEnabled: boolean;
    alignmentGuides: AlignmentGuides;
    zoom: number;
    viewportX: number;
    viewportY: number;
    quickToolbarAnchor: { left: number; top: number } | null;
    selectedVisibleNodes: FlowNode[];
    quickToolbarColorValue: string;
    onQuickToolbarDelete: () => void;
    onQuickToolbarDuplicate: () => void;
    onQuickToolbarAddConnected: () => void;
    onQuickToolbarColorChange: (nextColor: string) => void;
    singleSelectedNode: FlowNode | null;
    quickAddOverlay: FlowCanvasQuickAddOverlay | null;
    isQuickAddHovering: boolean;
    setIsQuickAddHovering: React.Dispatch<React.SetStateAction<boolean>>;
    connectMenu: ConnectMenuState | null;
    setConnectMenu: (menu: ConnectMenuState | null) => void;
    screenToFlowPosition: (position: { x: number; y: number }) => { x: number; y: number };
    handleAddAndConnect: (
        type: string,
        position: { x: number; y: number },
        sourceId?: string,
        sourceHandle?: string,
        shape?: NodeData['shape']
    ) => void;
    contextMenu: ContextMenuState;
    onCloseContextMenu: () => void;
    copySelection: () => void;
    contextActions: UseFlowCanvasContextActionsResult;
}

export function FlowCanvasOverlays({
    canvasInteractionsEnabled,
    alignmentGuides,
    zoom,
    viewportX,
    viewportY,
    quickToolbarAnchor,
    selectedVisibleNodes,
    quickToolbarColorValue,
    onQuickToolbarDelete,
    onQuickToolbarDuplicate,
    onQuickToolbarAddConnected,
    onQuickToolbarColorChange,
    singleSelectedNode,
    quickAddOverlay,
    isQuickAddHovering,
    setIsQuickAddHovering,
    connectMenu,
    setConnectMenu,
    screenToFlowPosition,
    handleAddAndConnect,
    contextMenu,
    onCloseContextMenu,
    copySelection,
    contextActions,
}: FlowCanvasOverlaysProps): React.ReactElement {
    return (
        <>
            <FlowCanvasAlignmentGuidesOverlay
                enabled={canvasInteractionsEnabled}
                alignmentGuides={alignmentGuides}
                zoom={zoom}
                viewportX={viewportX}
                viewportY={viewportY}
            />
            <FlowCanvasQuickActions
                enabled={canvasInteractionsEnabled}
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
            />

            {connectMenu ? (
                <ConnectMenu
                    position={connectMenu.position}
                    onClose={() => setConnectMenu(null)}
                    onSelect={(type, shape) => {
                        const flowPos = screenToFlowPosition(connectMenu.position);
                        handleAddAndConnect(type, flowPos, connectMenu.sourceId, connectMenu.sourceHandle, shape as NodeData['shape']);
                    }}
                />
            ) : null}

            {contextMenu.isOpen ? (
                <ContextMenu
                    {...contextMenu}
                    onClose={onCloseContextMenu}
                    onCopy={copySelection}
                    onPaste={contextActions.onPaste}
                    onDuplicate={contextActions.onDuplicate}
                    onDelete={contextActions.onDelete}
                    onSendToBack={contextActions.onSendToBack}
                    canPaste={true}
                    selectedCount={contextActions.selectedCount}
                    onAlignNodes={contextActions.onAlignNodes}
                    onDistributeNodes={contextActions.onDistributeNodes}
                    onGroupSelected={contextActions.onGroupSelected}
                />
            ) : null}
        </>
    );
}

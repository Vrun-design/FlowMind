import type { Node } from '@/lib/reactflowCompat';
import { useFlowCanvasContextActions } from './useFlowCanvasContextActions';
import { useFlowCanvasMenus } from './useFlowCanvasMenus';

interface UseFlowCanvasMenusAndActionsParams {
    onPaneSelectionClear?: () => void;
    screenToFlowPosition: (position: { x: number; y: number }) => { x: number; y: number };
    copySelection: () => void;
    pasteSelection: (position: { x: number; y: number }) => void;
    duplicateNode: (id: string) => void;
    deleteNode: (id: string) => void;
    deleteEdge: (id: string) => void;
    updateNodeZIndex: (id: string, action: 'front' | 'back') => void;
    handleAlignNodes: (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
    handleDistributeNodes: (direction: 'horizontal' | 'vertical') => void;
    handleGroupNodes: () => void;
    nodes: Node[];
}

export function useFlowCanvasMenusAndActions({
    onPaneSelectionClear,
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
}: UseFlowCanvasMenusAndActionsParams) {
    const menus = useFlowCanvasMenus({
        onPaneSelectionClear,
    });
    const contextActions = useFlowCanvasContextActions({
        contextMenu: menus.contextMenu,
        onCloseContextMenu: menus.onCloseContextMenu,
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

    return {
        ...menus,
        contextActions,
    };
}

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useFlowCanvasMenusAndActions } from './useFlowCanvasMenusAndActions';

describe('useFlowCanvasMenusAndActions', () => {
    it('clears pane selection and closes the context menu on pane click', () => {
        const onPaneSelectionClear = vi.fn();
        const hook = renderHook(() =>
            useFlowCanvasMenusAndActions({
                onPaneSelectionClear,
                screenToFlowPosition: (position) => position,
                copySelection: vi.fn(),
                pasteSelection: vi.fn(),
                duplicateNode: vi.fn(),
                deleteNode: vi.fn(),
                deleteEdge: vi.fn(),
                updateNodeZIndex: vi.fn(),
                updateNodeType: vi.fn(),
                handleAlignNodes: vi.fn(),
                handleDistributeNodes: vi.fn(),
                handleGroupNodes: vi.fn(),
                nodes: [],
            })
        );

        act(() => {
            hook.result.current.onPaneContextMenu({
                preventDefault: vi.fn(),
                clientX: 10,
                clientY: 20,
            } as unknown as React.MouseEvent);
        });

        expect(hook.result.current.contextMenu.isOpen).toBe(true);

        act(() => {
            hook.result.current.onPaneClick();
        });

        expect(onPaneSelectionClear).toHaveBeenCalledTimes(1);
        expect(hook.result.current.contextMenu.isOpen).toBe(false);
    });
});

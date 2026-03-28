import { useShallow } from 'zustand/react/shallow';
import { useFlowStore } from '../store';
import type { FlowStoreState } from '../store';
import type { FlowTab } from '@/lib/types';

export type EditorPage = FlowTab;

export function useEditorPagesState(): {
    pages: EditorPage[];
    activePageId: string;
} {
    return useFlowStore(
        useShallow((state) => ({
            pages: state.tabs,
            activePageId: state.activeTabId,
        })),
    );
}

export function useActiveEditorPageId(): string {
    return useFlowStore((state) => state.activeTabId);
}

export function useEditorPageActions(): {
    setActivePageId: FlowStoreState['setActiveTabId'];
    setPages: FlowStoreState['setTabs'];
    addPage: FlowStoreState['addTab'];
    duplicateActivePage: FlowStoreState['duplicateActiveTab'];
    duplicatePage: FlowStoreState['duplicateTab'];
    deletePage: FlowStoreState['deleteTab'];
    closePage: FlowStoreState['closeTab'];
    updatePage: FlowStoreState['updateTab'];
    copySelectedToPage: FlowStoreState['copySelectedToTab'];
    moveSelectedToPage: FlowStoreState['moveSelectedToTab'];
} {
    return useFlowStore(
        useShallow((state) => ({
            setActivePageId: state.setActiveTabId,
            setPages: state.setTabs,
            addPage: state.addTab,
            duplicateActivePage: state.duplicateActiveTab,
            duplicatePage: state.duplicateTab,
            deletePage: state.deleteTab,
            closePage: state.closeTab,
            updatePage: state.updateTab,
            copySelectedToPage: state.copySelectedToTab,
            moveSelectedToPage: state.moveSelectedToTab,
        })),
    );
}

export function useEditorPageById(pageId: string): EditorPage | undefined {
    return useFlowStore((state) => state.tabs.find((tab) => tab.id === pageId));
}

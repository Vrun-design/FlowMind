import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INITIAL_EDGES, INITIAL_NODES } from './constants';
import type { FlowTab } from '@/lib/types';
import { createAIAndSelectionActions } from './store/actions/createAIAndSelectionActions';
import { createBrandActions } from './store/actions/createBrandActions';
import { createCanvasActions } from './store/actions/createCanvasActions';
import { createDesignSystemActions } from './store/actions/createDesignSystemActions';
import { createHistoryActions } from './store/actions/createHistoryActions';
import { createTabActions } from './store/actions/createTabActions';
import { createViewActions } from './store/actions/createViewActions';
import {
    DEFAULT_AI_SETTINGS,
    DEFAULT_BRAND_CONFIG,
    DEFAULT_BRAND_KIT,
    DEFAULT_DESIGN_SYSTEM,
    INITIAL_GLOBAL_EDGE_OPTIONS,
    INITIAL_VIEW_SETTINGS,
} from './store/defaults';
import type { FlowState } from './store/types';

export {
    DEFAULT_AI_SETTINGS,
    DEFAULT_BRAND_CONFIG,
    DEFAULT_BRAND_KIT,
    DEFAULT_DESIGN_SYSTEM,
};
export type {
    AIProvider,
    AISettings,
    BrandConfig,
    BrandKit,
    CustomHeaderConfig,
    FlowState as FlowStoreState,
    ViewSettings,
} from './store/types';

function normalizePersistedTab(rawTab: unknown): FlowTab | null {
    if (!rawTab || typeof rawTab !== 'object') return null;
    const tab = rawTab as Partial<FlowTab> & {
        history?: {
            past?: unknown;
            future?: unknown;
        };
    };

    if (typeof tab.id !== 'string' || tab.id.length === 0) return null;
    if (typeof tab.name !== 'string' || tab.name.length === 0) return null;

    return {
        id: tab.id,
        name: tab.name,
        nodes: Array.isArray(tab.nodes) ? tab.nodes : [],
        edges: Array.isArray(tab.edges) ? tab.edges : [],
        history: {
            past: Array.isArray(tab.history?.past) ? tab.history.past : [],
            future: Array.isArray(tab.history?.future) ? tab.history.future : [],
        },
    };
}

function migratePersistedState(persistedState: unknown): unknown {
    if (!persistedState || typeof persistedState !== 'object') return persistedState;
    const state = persistedState as Record<string, unknown>;

    const rawTabs = Array.isArray(state.tabs) ? state.tabs : [];
    const normalizedTabs = rawTabs
        .map((tab) => normalizePersistedTab(tab))
        .filter((tab): tab is FlowTab => tab !== null);

    const fallbackTab: FlowTab = {
        id: 'tab-1',
        name: 'Untitled Flow',
        nodes: INITIAL_NODES,
        edges: INITIAL_EDGES,
        history: { past: [], future: [] },
    };

    const tabs = normalizedTabs.length > 0 ? normalizedTabs : [fallbackTab];
    const activeTabId =
        typeof state.activeTabId === 'string' && tabs.some((tab) => tab.id === state.activeTabId)
            ? state.activeTabId
            : tabs[0].id;
    const persistedViewSettings =
        state.viewSettings && typeof state.viewSettings === 'object'
            ? (state.viewSettings as Record<string, unknown>)
            : {};

    return {
        ...state,
        tabs,
        activeTabId,
        viewSettings: {
            ...INITIAL_VIEW_SETTINGS,
            ...persistedViewSettings,
        },
    };
}

export const useFlowStore = create<FlowState>()(
    persist(
        (set, get) => ({
            nodes: INITIAL_NODES,
            edges: INITIAL_EDGES,
            tabs: [
                {
                    id: 'tab-1',
                    name: 'Untitled Flow',
                    nodes: INITIAL_NODES,
                    edges: INITIAL_EDGES,
                    history: { past: [], future: [] },
                },
            ],
            activeTabId: 'tab-1',
            designSystems: [DEFAULT_DESIGN_SYSTEM],
            activeDesignSystemId: 'default',
            viewSettings: INITIAL_VIEW_SETTINGS,
            globalEdgeOptions: INITIAL_GLOBAL_EDGE_OPTIONS,
            aiSettings: DEFAULT_AI_SETTINGS,
            brandConfig: DEFAULT_BRAND_CONFIG,
            brandKits: [DEFAULT_BRAND_KIT],
            activeBrandKitId: 'default',
            selectedNodeId: null,
            selectedEdgeId: null,
            ...createCanvasActions(set, get),
            ...createHistoryActions(set, get),
            ...createTabActions(set, get),
            ...createDesignSystemActions(set),
            ...createViewActions(set),
            ...createAIAndSelectionActions(set),
            ...createBrandActions(set),
        }),
        {
            name: 'openflowkit-storage',
            version: 1,
            migrate: (persistedState) => migratePersistedState(persistedState),
            partialize: (state) => ({
                tabs: state.tabs,
                activeTabId: state.activeTabId,
                designSystems: state.designSystems,
                activeDesignSystemId: state.activeDesignSystemId,
                viewSettings: state.viewSettings,
                globalEdgeOptions: state.globalEdgeOptions,
                aiSettings: state.aiSettings,
                brandConfig: state.brandConfig,
                brandKits: state.brandKits,
                activeBrandKitId: state.activeBrandKitId,
            }),
        }
    )
);

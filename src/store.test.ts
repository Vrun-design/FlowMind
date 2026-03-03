import { beforeEach, describe, expect, it } from 'vitest';
import type { FlowEdge, FlowNode, FlowTab } from '@/lib/types';
import { useFlowStore } from './store';

function createNode(id: string, label: string): FlowNode {
    return {
        id,
        type: 'process',
        position: { x: 0, y: 0 },
        data: { label, subLabel: '', color: 'slate' },
    };
}

function createEdge(id: string, source: string, target: string): FlowEdge {
    return { id, source, target };
}

function createTab(id: string, name: string, nodes: FlowNode[], edges: FlowEdge[]): FlowTab {
    return {
        id,
        name,
        nodes,
        edges,
        history: { past: [], future: [] },
    };
}

describe('flow store tab actions', () => {
    beforeEach(() => {
        const nodes = [createNode('n1', 'Base')];
        const edges = [createEdge('e1', 'n1', 'n1')];
        const tab = createTab('tab-1', 'Tab 1', nodes, edges);

        useFlowStore.setState({
            nodes,
            edges,
            tabs: [tab],
            activeTabId: 'tab-1',
        });
    });

    it('addTab creates and activates a new tab', () => {
        const { addTab } = useFlowStore.getState();
        const newId = addTab();
        const state = useFlowStore.getState();

        expect(newId).toMatch(/^tab-/);
        expect(state.activeTabId).toBe(newId);
        expect(state.tabs.some((tab) => tab.id === newId)).toBe(true);
    });

    it('setActiveTabId persists current tab content before switching', () => {
        const secondTab = createTab('tab-2', 'Tab 2', [createNode('n2', 'Second')], []);
        useFlowStore.setState((state) => ({
            tabs: [...state.tabs, secondTab],
            nodes: [createNode('n1-updated', 'Updated')],
            edges: [createEdge('e1-updated', 'n1-updated', 'n1-updated')],
            activeTabId: 'tab-1',
        }));

        useFlowStore.getState().setActiveTabId('tab-2');
        const state = useFlowStore.getState();
        const firstTab = state.tabs.find((tab) => tab.id === 'tab-1');

        expect(firstTab?.nodes[0].id).toBe('n1-updated');
        expect(firstTab?.edges[0].id).toBe('e1-updated');
        expect(state.activeTabId).toBe('tab-2');
        expect(state.nodes[0].id).toBe('n2');
    });

    it('setActiveTabId keeps each tab state isolated across repeated switches', () => {
        const tab2 = createTab('tab-2', 'Tab 2', [createNode('n2', 'Second')], []);
        const tab3 = createTab('tab-3', 'Tab 3', [createNode('n3', 'Third')], []);

        useFlowStore.setState((state) => ({
            tabs: [...state.tabs, tab2, tab3],
            activeTabId: 'tab-1',
            nodes: [createNode('n1-edit', 'Edited Tab 1')],
            edges: [createEdge('e1-edit', 'n1-edit', 'n1-edit')],
        }));

        useFlowStore.getState().setActiveTabId('tab-2');
        useFlowStore.getState().setNodes([createNode('n2-edit', 'Edited Tab 2')]);
        useFlowStore.getState().setEdges([createEdge('e2-edit', 'n2-edit', 'n2-edit')]);

        useFlowStore.getState().setActiveTabId('tab-3');
        useFlowStore.getState().setNodes([createNode('n3-edit', 'Edited Tab 3')]);
        useFlowStore.getState().setEdges([createEdge('e3-edit', 'n3-edit', 'n3-edit')]);

        useFlowStore.getState().setActiveTabId('tab-1');
        let state = useFlowStore.getState();
        expect(state.nodes[0].id).toBe('n1-edit');
        expect(state.edges[0].id).toBe('e1-edit');

        useFlowStore.getState().setActiveTabId('tab-2');
        state = useFlowStore.getState();
        expect(state.nodes[0].id).toBe('n2-edit');
        expect(state.edges[0].id).toBe('e2-edit');

        useFlowStore.getState().setActiveTabId('tab-3');
        state = useFlowStore.getState();
        expect(state.nodes[0].id).toBe('n3-edit');
        expect(state.edges[0].id).toBe('e3-edit');
    });

    it('setActiveTabId is a no-op when switching to the already active tab', () => {
        const tab2 = createTab('tab-2', 'Tab 2', [createNode('n2', 'Second')], []);
        useFlowStore.setState((state) => ({
            tabs: [...state.tabs, tab2],
            activeTabId: 'tab-1',
            nodes: [createNode('n1-live', 'Live Canvas')],
            edges: [createEdge('e1-live', 'n1-live', 'n1-live')],
        }));

        const before = useFlowStore.getState();
        const beforeTab1 = before.tabs.find((tab) => tab.id === 'tab-1');
        const beforeTab1NodeId = beforeTab1?.nodes[0]?.id;
        const beforeCanvasNodeId = before.nodes[0]?.id;
        const beforeCanvasEdgeId = before.edges[0]?.id;

        useFlowStore.getState().setActiveTabId('tab-1');

        const after = useFlowStore.getState();
        const afterTab1 = after.tabs.find((tab) => tab.id === 'tab-1');

        expect(after.activeTabId).toBe('tab-1');
        expect(after.nodes[0].id).toBe(beforeCanvasNodeId);
        expect(after.edges[0].id).toBe(beforeCanvasEdgeId);
        expect(afterTab1?.nodes[0]?.id).toBe(beforeTab1NodeId);
    });

    it('recovers tabs and active tab from persisted autosave snapshot', () => {
        const tab2 = createTab('tab-2', 'Tab 2', [createNode('n2', 'Recovered Tab 2')], [createEdge('e2', 'n2', 'n2')]);

        useFlowStore.setState((state) => ({
            tabs: [state.tabs[0], tab2],
            activeTabId: 'tab-2',
            nodes: tab2.nodes,
            edges: tab2.edges,
        }));

        const persistedSlice = useFlowStore.persist.getOptions().partialize(useFlowStore.getState());

        // Simulate cold start before hydration.
        useFlowStore.setState({
            nodes: [],
            edges: [],
            tabs: [],
            activeTabId: 'tab-1',
        });

        // Simulate hydration merge from persisted autosave payload.
        useFlowStore.setState(persistedSlice as Partial<ReturnType<typeof useFlowStore.getState>>);

        // Recovery path: pull active tab payload from hydrated tabs and rehydrate canvas.
        const hydrated = useFlowStore.getState();
        const activeTab = hydrated.tabs.find((tab) => tab.id === hydrated.activeTabId);
        expect(activeTab).toBeDefined();

        useFlowStore.setState({
            nodes: activeTab?.nodes ?? [],
            edges: activeTab?.edges ?? [],
        });

        const state = useFlowStore.getState();
        expect(state.activeTabId).toBe('tab-2');
        expect(state.tabs).toHaveLength(2);
        expect(state.nodes[0].id).toBe('n2');
        expect(state.nodes[0].data.label).toBe('Recovered Tab 2');
        expect(state.edges[0].id).toBe('e2');
    });

    it('migrates legacy persisted tabs by adding missing history fields', async () => {
        const migrate = useFlowStore.persist.getOptions().migrate;
        expect(migrate).toBeDefined();

        const legacyPersisted = {
            tabs: [
                {
                    id: 'tab-legacy',
                    name: 'Legacy',
                    nodes: [createNode('n-legacy', 'Legacy Node')],
                    edges: [createEdge('e-legacy', 'n-legacy', 'n-legacy')],
                },
            ],
            activeTabId: 'tab-legacy',
        };

        const migrated = await Promise.resolve(migrate?.(legacyPersisted, 0));
        const state = migrated as {
            tabs: FlowTab[];
            activeTabId: string;
        };

        expect(state.tabs).toHaveLength(1);
        expect(state.tabs[0].history.past).toEqual([]);
        expect(state.tabs[0].history.future).toEqual([]);
        expect(state.activeTabId).toBe('tab-legacy');
    });

    it('migrates invalid persisted activeTabId to a valid tab id', async () => {
        const migrate = useFlowStore.persist.getOptions().migrate;
        expect(migrate).toBeDefined();

        const legacyPersisted = {
            tabs: [
                {
                    id: 'tab-a',
                    name: 'A',
                    nodes: [createNode('na', 'A')],
                    edges: [],
                    history: { past: [], future: [] },
                },
            ],
            activeTabId: 'missing-tab',
        };

        const migrated = await Promise.resolve(migrate?.(legacyPersisted, 0));
        const state = migrated as {
            tabs: FlowTab[];
            activeTabId: string;
        };

        expect(state.activeTabId).toBe('tab-a');
    });

    it('migrates malformed persisted tabs to a safe fallback tab', async () => {
        const migrate = useFlowStore.persist.getOptions().migrate;
        expect(migrate).toBeDefined();

        const legacyPersisted = {
            tabs: [{ bogus: true }],
            activeTabId: 'tab-unknown',
        };

        const migrated = await Promise.resolve(migrate?.(legacyPersisted, 0));
        const state = migrated as {
            tabs: FlowTab[];
            activeTabId: string;
        };

        expect(state.tabs).toHaveLength(1);
        expect(state.tabs[0].id).toBe('tab-1');
        expect(state.tabs[0].history.past).toEqual([]);
        expect(state.tabs[0].history.future).toEqual([]);
        expect(state.activeTabId).toBe('tab-1');
    });
});

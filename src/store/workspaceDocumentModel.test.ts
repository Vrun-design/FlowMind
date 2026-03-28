import { describe, expect, it } from 'vitest';
import type { FlowTab } from '@/lib/types';
import { createWorkspaceDocumentsFromTabs } from './workspaceDocumentModel';
import type { FlowDocument } from '@/services/storage/flowDocumentModel';

function createTab(overrides: Partial<FlowTab> = {}): FlowTab {
    return {
        id: 'tab-1',
        name: 'Document One',
        diagramType: 'flowchart',
        updatedAt: '2026-03-27T00:00:00.000Z',
        nodes: [],
        edges: [],
        history: { past: [], future: [] },
        playback: undefined,
        ...overrides,
    };
}

function createDocumentFromTab(tab: FlowTab): FlowDocument {
    return {
        id: tab.id,
        name: tab.name,
        createdAt: tab.updatedAt ?? '2026-03-27T00:00:00.000Z',
        updatedAt: tab.updatedAt ?? '2026-03-27T00:00:00.000Z',
        activePageId: tab.id,
        pages: [tab],
    };
}

describe('workspaceDocumentModel', () => {
    it('builds document summaries from tabs', () => {
        const documents = createWorkspaceDocumentsFromTabs({
            documents: [createDocumentFromTab(createTab())],
            activeDocumentId: 'tab-1',
            activeNodes: [{ id: 'n1' } as never],
            activeEdges: [],
            activePages: [createTab()],
            activePageId: 'tab-1',
        });

        expect(documents).toHaveLength(1);
        expect(documents[0]).toMatchObject({
            id: 'tab-1',
            name: 'Document One',
            nodeCount: 1,
            edgeCount: 0,
            isActive: true,
        });
    });

    it('sorts the active document first, then by updated time', () => {
        const documents = createWorkspaceDocumentsFromTabs({
            documents: [
                createDocumentFromTab(createTab({
                    id: 'tab-older',
                    name: 'Older',
                    updatedAt: '2026-03-26T00:00:00.000Z',
                })),
                createDocumentFromTab(createTab({
                    id: 'tab-active',
                    name: 'Active',
                    updatedAt: '2026-03-25T00:00:00.000Z',
                })),
                createDocumentFromTab(createTab({
                    id: 'tab-newer',
                    name: 'Newer',
                    updatedAt: '2026-03-27T00:00:00.000Z',
                })),
            ],
            activeDocumentId: 'tab-active',
            activeNodes: [],
            activeEdges: [],
            activePages: [createTab({ id: 'tab-active', name: 'Active', updatedAt: '2026-03-25T00:00:00.000Z' })],
            activePageId: 'tab-active',
        });

        expect(documents.map((document) => document.id)).toEqual([
            'tab-active',
            'tab-newer',
            'tab-older',
        ]);
    });
});

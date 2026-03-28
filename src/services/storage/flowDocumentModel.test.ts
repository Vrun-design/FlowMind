import { describe, expect, it } from 'vitest';
import type { FlowTab } from '@/lib/types';
import type { PersistedDocument, WorkspaceMeta } from './persistenceTypes';
import {
  convertFlowDocumentsToTabs,
  createFlowDocumentFromPersistedDocument,
  createFlowDocumentsFromPersistedDocuments,
  createLoadedFlowWorkspace,
} from './flowDocumentModel';

function createPersistedDocument(overrides: Partial<PersistedDocument> = {}): PersistedDocument {
  const tabHistory: FlowTab['history'] = { past: [], future: [] };

  return {
    id: 'doc-1',
    name: 'System Design',
    diagramType: 'flowchart',
    createdAt: '2026-03-27T00:00:00.000Z',
    updatedAt: '2026-03-27T00:00:00.000Z',
    deletedAt: null,
    content: {
      nodes: [],
      edges: [],
      history: tabHistory,
      playback: undefined,
    },
    ...overrides,
  };
}

function createWorkspaceMeta(overrides: Partial<WorkspaceMeta> = {}): WorkspaceMeta {
  return {
    id: 'workspace',
    activeDocumentId: 'doc-1',
    documentOrder: ['doc-1'],
    lastOpenedAt: '2026-03-27T00:00:00.000Z',
    ...overrides,
  };
}

describe('flowDocumentModel', () => {
  it('maps a persisted document into a single-page flow document', () => {
    const persistedDocument = createPersistedDocument();

    const document = createFlowDocumentFromPersistedDocument(persistedDocument);

    expect(document.id).toBe('doc-1');
    expect(document.name).toBe('System Design');
    expect(document.pages).toHaveLength(1);
    expect(document.pages[0]?.id).toBe('doc-1:page:primary');
    expect(document.activePageId).toBe('doc-1:page:primary');
  });

  it('creates a loaded flow workspace with explicit documents', () => {
    const persistedDocument = createPersistedDocument();

    const workspace = createLoadedFlowWorkspace({
      document: persistedDocument,
      documents: [persistedDocument],
      workspaceMeta: createWorkspaceMeta(),
    });

    expect(workspace.activeDocumentId).toBe('doc-1');
    expect(workspace.documents).toHaveLength(1);
    expect(workspace.documents[0]?.pages).toHaveLength(1);
  });

  it('preserves multipage persisted documents', () => {
    const persistedDocument = createPersistedDocument({
      content: undefined,
      activePageId: 'doc-1:page:deployment',
      pages: [
        {
          id: 'doc-1:page:overview',
          name: 'Overview',
          diagramType: 'flowchart',
          updatedAt: '2026-03-27T00:00:00.000Z',
          content: {
            nodes: [],
            edges: [],
            history: { past: [], future: [] },
            playback: undefined,
          },
        },
        {
          id: 'doc-1:page:deployment',
          name: 'Deployment',
          diagramType: 'sequence',
          updatedAt: '2026-03-27T00:00:00.000Z',
          content: {
            nodes: [],
            edges: [],
            history: { past: [], future: [] },
            playback: undefined,
          },
        },
      ],
    });

    const document = createFlowDocumentFromPersistedDocument(persistedDocument);

    expect(document.pages).toHaveLength(2);
    expect(document.activePageId).toBe('doc-1:page:deployment');
    expect(document.pages[1]?.name).toBe('Deployment');
  });

  it('converts flow documents back to tabs for the current editor UI', () => {
    const documents = createFlowDocumentsFromPersistedDocuments([
      createPersistedDocument(),
    ]);

    const tabs = convertFlowDocumentsToTabs(documents);

    expect(tabs).toHaveLength(1);
    expect(tabs[0]?.id).toBe('doc-1');
    expect(tabs[0]?.name).toBe('System Design');
  });
});

import type { FlowTab } from '@/lib/types';
import type { FlowDocument, FlowPage } from './flowDocumentModel';
import type { PersistedDocument, PersistedDocumentPage } from './persistenceTypes';

function getNowIso(): string {
  return new Date().toISOString();
}

export function createPersistedDocumentFromTab(tab: FlowTab): PersistedDocument {
  const nowIso = getNowIso();
  const primaryPageId = `${tab.id}:page:primary`;
  return {
    id: tab.id,
    name: tab.name,
    diagramType: tab.diagramType,
    content: {
      nodes: tab.nodes,
      edges: tab.edges,
      playback: tab.playback,
      history: tab.history,
    },
    pages: [
      {
        id: primaryPageId,
        name: tab.name,
        diagramType: tab.diagramType,
        updatedAt: tab.updatedAt ?? nowIso,
        content: {
          nodes: tab.nodes,
          edges: tab.edges,
          playback: tab.playback,
          history: tab.history,
        },
      },
    ],
    activePageId: primaryPageId,
    createdAt: tab.updatedAt ?? nowIso,
    updatedAt: tab.updatedAt ?? nowIso,
    deletedAt: null,
  };
}

export function createPersistedDocumentsFromTabs(tabs: FlowTab[]): PersistedDocument[] {
  return tabs.map(createPersistedDocumentFromTab);
}

export function createFlowTabFromPersistedDocument(document: PersistedDocument): FlowTab {
  const primaryPage = document.pages?.find((page) => page.id === document.activePageId)
    ?? document.pages?.[0];
  const content = primaryPage?.content ?? document.content;
  const diagramType = primaryPage?.diagramType ?? document.diagramType;

  if (!content) {
    throw new Error(`Persisted document "${document.id}" is missing page content.`);
  }

  return {
    id: document.id,
    name: document.name,
    diagramType,
    updatedAt: primaryPage?.updatedAt ?? document.updatedAt,
    nodes: content.nodes,
    edges: content.edges,
    playback: content.playback,
    history: content.history,
  };
}

export function createFlowTabsFromPersistedDocuments(documents: PersistedDocument[]): FlowTab[] {
  return documents.map(createFlowTabFromPersistedDocument);
}

function createPersistedPageFromFlowPage(page: FlowPage): PersistedDocumentPage {
  return {
    id: page.id,
    name: page.name,
    diagramType: page.diagramType,
    updatedAt: page.updatedAt,
    content: {
      nodes: page.nodes,
      edges: page.edges,
      playback: page.playback,
      history: page.history,
    },
  };
}

export function createPersistedDocumentFromFlowDocument(document: FlowDocument): PersistedDocument {
  const pages = document.pages.map(createPersistedPageFromFlowPage);
  const activePage = pages.find((page) => page.id === document.activePageId) ?? pages[0];
  return {
    id: document.id,
    name: document.name,
    diagramType: activePage?.diagramType,
    content: activePage?.content,
    pages,
    activePageId: activePage?.id,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    deletedAt: null,
  };
}

export function createPersistedDocumentsFromFlowDocuments(documents: FlowDocument[]): PersistedDocument[] {
  return documents.map(createPersistedDocumentFromFlowDocument);
}

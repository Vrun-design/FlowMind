import type { FlowEdge, FlowNode, FlowTab } from '@/lib/types';
import type { FlowDocument } from '@/services/storage/flowDocumentModel';

export interface WorkspaceDocumentSummary {
    id: string;
    name: string;
    updatedAt?: string;
    nodeCount: number;
    edgeCount: number;
    isActive: boolean;
}

export interface CreateWorkspaceDocumentsParams {
    documents: FlowDocument[];
    activeDocumentId: string;
    activeNodes: FlowNode[];
    activeEdges: FlowEdge[];
    activePages: FlowTab[];
    activePageId: string;
}

export function syncActivePageTabs(
    pages: FlowTab[],
    activePageId: string,
    activeNodes: FlowNode[],
    activeEdges: FlowEdge[],
): FlowTab[] {
    return pages.map((page) =>
        page.id === activePageId
            ? {
                ...page,
                nodes: activeNodes,
                edges: activeEdges,
            }
            : page,
    );
}

export function mergeActivePagesIntoDocuments(params: {
    documents: FlowDocument[];
    activeDocumentId: string;
    activePages: FlowTab[];
    activePageId: string;
    activeNodes: FlowNode[];
    activeEdges: FlowEdge[];
}): FlowDocument[] {
    const { documents, activeDocumentId, activePages, activePageId, activeNodes, activeEdges } = params;
    const syncedPages = syncActivePageTabs(activePages, activePageId, activeNodes, activeEdges);

    return documents.map((document) => {
        if (document.id !== activeDocumentId) {
            return document;
        }

        return {
            ...document,
            activePageId,
            pages: syncedPages.map((page) => ({
                id: page.id,
                name: page.name,
                diagramType: page.diagramType,
                updatedAt: page.updatedAt,
                nodes: page.nodes,
                edges: page.edges,
                playback: page.playback,
                history: page.history,
            })),
        };
    });
}

export function createWorkspaceDocumentSummary(
    document: FlowDocument,
    activeDocumentId: string,
    activeNodes: FlowNode[],
    activeEdges: FlowEdge[],
    activePages: FlowTab[],
    activePageId: string,
): WorkspaceDocumentSummary {
    const isActive = document.id === activeDocumentId;
    const resolvedDocument = isActive
        ? mergeActivePagesIntoDocuments({
            documents: [document],
            activeDocumentId: document.id,
            activePages,
            activePageId,
            activeNodes,
            activeEdges,
        })[0]
        : document;
    const nodeCount = resolvedDocument.pages.reduce((sum, page) => sum + page.nodes.length, 0);
    const edgeCount = resolvedDocument.pages.reduce((sum, page) => sum + page.edges.length, 0);

    return {
        id: resolvedDocument.id,
        name: resolvedDocument.name,
        updatedAt: resolvedDocument.updatedAt,
        nodeCount,
        edgeCount,
        isActive,
    };
}

export function sortWorkspaceDocuments(documents: WorkspaceDocumentSummary[]): WorkspaceDocumentSummary[] {
    return [...documents].sort((left, right) => {
        if (left.isActive && !right.isActive) return -1;
        if (!left.isActive && right.isActive) return 1;
        const leftTime = Date.parse(left.updatedAt || '');
        const rightTime = Date.parse(right.updatedAt || '');
        return (Number.isNaN(rightTime) ? 0 : rightTime) - (Number.isNaN(leftTime) ? 0 : leftTime);
    });
}

export function createWorkspaceDocumentsFromTabs({
    documents,
    activeDocumentId,
    activeNodes,
    activeEdges,
    activePages,
    activePageId,
}: CreateWorkspaceDocumentsParams): WorkspaceDocumentSummary[] {
    return sortWorkspaceDocuments(
        documents.map((document) => createWorkspaceDocumentSummary(
            document,
            activeDocumentId,
            activeNodes,
            activeEdges,
            activePages,
            activePageId,
        )),
    );
}

export function findDocumentRouteTarget(documents: FlowDocument[], targetId: string): {
    documentId: string;
    pageId: string;
} | null {
    for (const document of documents) {
        if (document.id === targetId) {
            return {
                documentId: document.id,
                pageId: document.activePageId,
            };
        }

        const matchingPage = document.pages.find((page) => page.id === targetId);
        if (matchingPage) {
            return {
                documentId: document.id,
                pageId: matchingPage.id,
            };
        }
    }

    return null;
}

export function getEditorPagesForDocument(documents: FlowDocument[], documentId: string | null): {
    activeDocumentId: string;
    activePageId: string;
    pages: FlowTab[];
} | null {
    if (!documentId) {
        return null;
    }

    const document = documents.find((entry) => entry.id === documentId);
    if (!document || document.pages.length === 0) {
        return null;
    }

    return {
        activeDocumentId: document.id,
        activePageId: document.activePageId,
        pages: document.pages.map((page) => ({
            id: page.id,
            name: page.name,
            diagramType: page.diagramType,
            updatedAt: page.updatedAt,
            nodes: page.nodes,
            edges: page.edges,
            playback: page.playback,
            history: page.history,
        })),
    };
}

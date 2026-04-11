import { useCallback } from 'react';
import { useFlowStore } from '@/store';

import type { FlowEdge, FlowNode, MermaidImportMode } from '@/lib/types';
import type { MermaidDiagnosticsSnapshot } from '@/store/types';
import {
  createPastedTextNode,
  isEditablePasteTarget,
  resolveLayoutDirection,
} from './pasteHelpers';
import { detectMermaidDiagramType } from '@/services/mermaid/detectDiagramType';
import { extractMermaidDiagramHeader } from '@/services/mermaid/detectDiagramType';
import { normalizeParseDiagnostics } from '@/services/mermaid/diagnosticFormatting';
import { buildMermaidDiagnosticsSnapshot } from '@/services/mermaid/diagnosticsSnapshot';
import {
  appendMermaidImportGuidance,
  getMermaidImportToastMessage,
} from '@/services/mermaid/importStatePresentation';
import {
  getOfficialMermaidDiagnostics,
  getOfficialMermaidErrorMessage,
  isOfficialMermaidValidationBlocking,
  validateMermaidWithOfficialParser,
} from '@/services/mermaid/officialMermaidValidation';
import { parseMermaidByType } from '@/services/mermaid/parseMermaidByType';
import { enrichNodesWithIcons } from '@/lib/nodeEnricher';
import { normalizeNodeIconData } from '@/lib/nodeIconState';
import type { LayoutOptions } from '@/services/elk-layout/types';
import {
  importMermaidToCanvas,
  resolveEffectiveMermaidImportMode,
} from '@/services/mermaid/rendererFirstImport';

const IMPORT_LABEL_COMPACT_THRESHOLD = 10;
const IMPORT_LABEL_VERBOSE_THRESHOLD = 20;
const IMPORT_LARGE_DIAGRAM_THRESHOLD = 36;

function getAverageLabelLength(nodes: FlowNode[]): number {
  if (nodes.length === 0) return 0;
  const total = nodes.reduce((sum, node) => sum + String(node.data?.label ?? '').trim().length, 0);
  return total / nodes.length;
}

function resolveImportLayoutOptions(
  nodes: FlowNode[],
  diagramType?: string
): { spacing: NonNullable<LayoutOptions['spacing']>; contentDensity: NonNullable<LayoutOptions['contentDensity']> } {
  const avg = getAverageLabelLength(nodes);

  let spacing: NonNullable<LayoutOptions['spacing']>;
  if (diagramType === 'architecture') {
    spacing = nodes.length >= 24 ? 'normal' : 'compact';
  } else if (avg <= IMPORT_LABEL_COMPACT_THRESHOLD) {
    spacing = 'compact';
  } else if (avg <= IMPORT_LABEL_VERBOSE_THRESHOLD) {
    spacing = nodes.length >= IMPORT_LARGE_DIAGRAM_THRESHOLD ? 'loose' : 'normal';
  } else {
    spacing = 'loose';
  }

  const contentDensity: NonNullable<LayoutOptions['contentDensity']> =
    avg <= IMPORT_LABEL_COMPACT_THRESHOLD ? 'compact'
    : avg <= IMPORT_LABEL_VERBOSE_THRESHOLD ? 'balanced'
    : 'verbose';

  return { spacing, contentDensity };
}

type SetFlowNodes = (payload: FlowNode[] | ((nodes: FlowNode[]) => FlowNode[])) => void;
type SetFlowEdges = (payload: FlowEdge[] | ((edges: FlowEdge[]) => FlowEdge[])) => void;
type AddToast = (
  message: string,
  type?: 'success' | 'error' | 'info' | 'warning',
  duration?: number
) => void;

interface UseFlowCanvasPasteParams {
  architectureStrictMode: boolean;
  mermaidImportMode: MermaidImportMode;
  activeTabId: string;
  fitView: (options?: { duration?: number; padding?: number }) => void;
  updateTab: (tabId: string, updates: Partial<{ diagramType: string }>) => void;
  recordHistory: () => void;
  setNodes: SetFlowNodes;
  setEdges: SetFlowEdges;
  setSelectedNodeId: (id: string | null) => void;
  setMermaidDiagnostics: (payload: MermaidDiagnosticsSnapshot | null) => void;
  clearMermaidDiagnostics: () => void;
  addToast: AddToast;
  strictModePasteBlockedMessage: string;
  pasteSelection: (center?: { x: number; y: number }) => void;
  getLastInteractionFlowPosition: () => { x: number; y: number } | null;
  getCanvasCenterFlowPosition: () => { x: number; y: number };
}

export function useFlowCanvasPaste({
  architectureStrictMode,
  mermaidImportMode,
  activeTabId,
  fitView,
  updateTab,
  recordHistory,
  setNodes,
  setEdges,
  setSelectedNodeId,
  setMermaidDiagnostics,
  clearMermaidDiagnostics,
  addToast,
  strictModePasteBlockedMessage,
  pasteSelection,
  getLastInteractionFlowPosition,
  getCanvasCenterFlowPosition,
}: UseFlowCanvasPasteParams) {

  const safelyEnrichImportedNodes = useCallback(
    (nodes: FlowNode[], diagramType: MermaidDiagnosticsSnapshot['diagramType']): FlowNode[] => {
      try {
        return enrichNodesWithIcons(nodes, {
          diagramType,
          mode: 'mermaid-import',
        }).map((node) => ({
          ...node,
          data: normalizeNodeIconData(node.data),
        }));
      } catch {
        addToast(
          'Imported diagram rendered without icon enrichment due to an enrichment error.',
          'warning'
        );
        return nodes;
      }
    },
    [addToast]
  );

  const handleCanvasPaste = useCallback(
    async (event: React.ClipboardEvent<HTMLDivElement>): Promise<void> => {
      if (isEditablePasteTarget(event.target)) return;

      const rawText = event.clipboardData.getData('text/plain');
      const pastedText = rawText.trim();

      if (!pastedText) {
        pasteSelection(getLastInteractionFlowPosition() ?? getCanvasCenterFlowPosition());
        return;
      }

      event.preventDefault();

      const mermaidHeader = extractMermaidDiagramHeader(pastedText);
      const maybeMermaidType = mermaidHeader.diagramType ?? detectMermaidDiagramType(pastedText);
      if (mermaidHeader.rawType) {
        const officialMermaidValidation = await validateMermaidWithOfficialParser(pastedText);
        const officialDiagnostics = getOfficialMermaidDiagnostics(officialMermaidValidation);

        if (isOfficialMermaidValidationBlocking(officialMermaidValidation)) {
          const rawErrorMessage =
            getOfficialMermaidErrorMessage(officialMermaidValidation)
            ?? 'Official Mermaid validation failed.';
          const errorMessage = appendMermaidImportGuidance({
            message: rawErrorMessage,
            importState: officialMermaidValidation.detectedType ? 'unsupported_construct' : 'invalid_source',
            diagramType: officialMermaidValidation.detectedType ?? maybeMermaidType ?? undefined,
          });

          setMermaidDiagnostics(
            buildMermaidDiagnosticsSnapshot({
              source: 'paste',
              diagramType: officialMermaidValidation.detectedType ?? maybeMermaidType,
              importState: officialMermaidValidation.detectedType ? 'unsupported_construct' : 'invalid_source',
              originalSource: pastedText,
              diagnostics: officialDiagnostics,
              error: errorMessage,
            })
          );

          addToast(errorMessage, 'error');
          return;
        }

        const result = parseMermaidByType(pastedText, { architectureStrictMode });
        const parserDiagnostics = normalizeParseDiagnostics(result.diagnostics);
        const diagnostics = [...officialDiagnostics, ...parserDiagnostics];

        if (!result.error) {
          recordHistory();

          if (result.nodes.length > 0) {
            try {
              const layoutDirection = resolveLayoutDirection(result);
              const effectiveMermaidImportMode = resolveEffectiveMermaidImportMode(
                mermaidImportMode,
                result.diagramType
              );
              const enrichedNodes = effectiveMermaidImportMode === 'native_editable'
                ? safelyEnrichImportedNodes(result.nodes, result.diagramType)
                : result.nodes;
              const { spacing, contentDensity } = resolveImportLayoutOptions(enrichedNodes, result.diagramType);
              const canvasImport = await importMermaidToCanvas({
                parsed: { ...result, nodes: enrichedNodes },
                source: pastedText,
                importMode: effectiveMermaidImportMode,
                layout: {
                  direction: layoutDirection,
                  spacing,
                  contentDensity,
                },
              });

              setNodes(canvasImport.nodes);
              setEdges(canvasImport.edges);

              const shouldSurfaceDiagnostics =
                diagnostics.length > 0
                || canvasImport.visualMode === 'renderer_exact'
                || canvasImport.visualMode !== 'editable_exact'
                || canvasImport.layoutMode === 'mermaid_preserved_partial'
                || canvasImport.layoutMode === 'mermaid_partial'
                || canvasImport.layoutMode === 'elk_fallback';

              if (shouldSurfaceDiagnostics) {
                setMermaidDiagnostics(
                  buildMermaidDiagnosticsSnapshot({
                    source: 'paste',
                    diagramType: result.diagramType,
                    importState: result.importState,
                    originalSource: result.originalSource,
                    diagnostics,
                    nodeCount: canvasImport.nodes.length,
                    edgeCount: canvasImport.edges.length,
                    layoutMode: canvasImport.layoutMode,
                    visualMode: canvasImport.visualMode,
                    layoutFallbackReason: canvasImport.layoutFallbackReason,
                  })
                );
              } else {
                clearMermaidDiagnostics();
              }

              const toastMessage = getMermaidImportToastMessage({
                importState: result.importState,
                warningCount:
                  diagnostics.length + (canvasImport.visualMode === 'renderer_exact' ? 0 : 1),
              });
              if (toastMessage && (diagnostics.length > 0 || canvasImport.visualMode !== 'renderer_exact')) {
                addToast(toastMessage, 'warning');
              }
            } catch {
              const enrichedNodes = safelyEnrichImportedNodes(result.nodes, result.diagramType);
              setNodes(enrichedNodes);
              setEdges(result.edges);
              setMermaidDiagnostics(
                buildMermaidDiagnosticsSnapshot({
                  source: 'paste',
                  diagramType: result.diagramType,
                  importState: result.importState,
                  originalSource: result.originalSource,
                  diagnostics,
                  nodeCount: result.nodes.length,
                  edgeCount: result.edges.length,
                  layoutMode: 'elk_fallback',
                  visualMode: 'editable_fallback',
                  layoutFallbackReason: 'Import layout orchestration failed after parsing',
                })
              );
            }
          } else {
            setNodes(result.nodes);
            setEdges(result.edges);
            if (diagnostics.length > 0) {
              setMermaidDiagnostics(
                buildMermaidDiagnosticsSnapshot({
                  source: 'paste',
                  diagramType: result.diagramType,
                  importState: result.importState,
                  originalSource: result.originalSource,
                  diagnostics,
                  nodeCount: result.nodes.length,
                  edgeCount: result.edges.length,
                })
              );
            } else {
              clearMermaidDiagnostics();
            }
          }

          if ('diagramType' in result && result.diagramType) {
            updateTab(activeTabId, { diagramType: result.diagramType });
          }

          window.setTimeout(() => fitView({ duration: 600, padding: 0.2 }), 80);
          return;
        }

        const errorMessage = appendMermaidImportGuidance({
          message: result.error,
          importState: result.importState,
          diagramType: result.diagramType ?? maybeMermaidType ?? undefined,
        });
        setMermaidDiagnostics(
          buildMermaidDiagnosticsSnapshot({
            source: 'paste',
            diagramType: result.diagramType ?? maybeMermaidType,
            importState: result.importState,
            originalSource: result.originalSource,
            diagnostics,
            error: errorMessage,
          })
        );

        if (
          maybeMermaidType === 'architecture' &&
          architectureStrictMode &&
          result.error.includes('strict mode rejected')
        ) {
          addToast(strictModePasteBlockedMessage, 'error');
          return;
        }

        addToast(errorMessage, 'error');
        return;
      }

      const pasteFlowPosition = getLastInteractionFlowPosition() ?? getCanvasCenterFlowPosition();

      recordHistory();
      const { activeLayerId } = useFlowStore.getState();
      const newTextNode = createPastedTextNode(pastedText, pasteFlowPosition, activeLayerId);

      setNodes((existingNodes) => [
        ...existingNodes.map((node) => ({ ...node, selected: false })),
        { ...newTextNode, selected: true },
      ]);
      setSelectedNodeId(newTextNode.id);
    },
    [
      activeTabId,
      addToast,
      architectureStrictMode,
      clearMermaidDiagnostics,
      fitView,
      getCanvasCenterFlowPosition,
      pasteSelection,
      getLastInteractionFlowPosition,
      recordHistory,
      mermaidImportMode,
      setEdges,
      setMermaidDiagnostics,
      setNodes,
      setSelectedNodeId,
      safelyEnrichImportedNodes,
      strictModePasteBlockedMessage,
      updateTab,
    ]
  );

  return {
    handleCanvasPaste,
  };
}

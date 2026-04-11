import type { DiagramType } from '@/lib/types';
import type { ParseDiagnostic } from '@/lib/openFlowDSLParser';
import type { MermaidDiagnosticsSnapshot } from '@/store/types';
import type { MermaidImportStatus } from './importContracts';
import {
  appendMermaidImportGuidance,
  getMermaidImportStateDetail,
  getMermaidStatusLabel,
} from './importStatePresentation';

interface BuildMermaidDiagnosticsSnapshotParams {
  source: MermaidDiagnosticsSnapshot['source'];
  diagramType?: DiagramType;
  importState?: MermaidImportStatus;
  layoutMode?: MermaidDiagnosticsSnapshot['layoutMode'];
  visualMode?: MermaidDiagnosticsSnapshot['visualMode'];
  layoutFallbackReason?: string;
  originalSource?: string;
  diagnostics: ParseDiagnostic[];
  error?: string;
  nodeCount?: number;
  edgeCount?: number;
}

function isOfficialFlowchartReason(layoutFallbackReason?: string): boolean {
  return layoutFallbackReason?.toLowerCase().includes('official flowchart') ?? false;
}

function getLayoutSummary(
  layoutMode: MermaidDiagnosticsSnapshot['layoutMode'],
  visualMode: MermaidDiagnosticsSnapshot['visualMode'],
  layoutFallbackReason?: string
): string | undefined {
  if (visualMode === 'renderer_exact') {
    return 'Rendered exactly from Mermaid SVG';
  }

  if (layoutMode === 'mermaid_exact') {
    return 'Exact Mermaid layout';
  }

  if (layoutMode === 'mermaid_preserved_partial') {
    return layoutFallbackReason
      ? `Partial Mermaid layout preserved (${layoutFallbackReason})`
      : 'Partial Mermaid layout preserved';
  }

  if (layoutMode === 'mermaid_partial') {
    const prefix = isOfficialFlowchartReason(layoutFallbackReason)
      ? 'Imported as editable diagram with preserved Mermaid geometry'
      : 'Imported as editable diagram with partial Mermaid geometry';
    return layoutFallbackReason
      ? `${prefix} (${layoutFallbackReason})`
      : prefix;
  }

  if (layoutMode === 'elk_fallback') {
    return layoutFallbackReason
      ? `ELK fallback used (${layoutFallbackReason})`
      : 'ELK fallback used';
  }

  return undefined;
}

export function buildMermaidDiagnosticsSnapshot(
  params: BuildMermaidDiagnosticsSnapshotParams
): MermaidDiagnosticsSnapshot {
  const statusLabel = getMermaidStatusLabel({
    importState: params.importState,
    layoutMode: params.layoutMode,
    visualMode: params.visualMode,
  });
  const nodeCount = params.nodeCount ?? 0;
  const edgeCount = params.edgeCount ?? 0;

  return {
    source: params.source,
    diagramType: params.diagramType,
    importState: params.importState,
    statusLabel,
    statusDetail: [
      getMermaidImportStateDetail({
        importState: params.importState,
        diagramType: params.diagramType,
        nodeCount,
        edgeCount,
      }),
      getLayoutSummary(params.layoutMode, params.visualMode, params.layoutFallbackReason),
    ]
      .filter(Boolean)
      .join(' · '),
    layoutMode: params.layoutMode,
    visualMode: params.visualMode,
    layoutFallbackReason: params.layoutFallbackReason,
    originalSource: params.originalSource,
    diagnostics: params.diagnostics,
    error: params.error
      ? appendMermaidImportGuidance({
          message: params.error,
          importState: params.importState,
          diagramType: params.diagramType,
        })
      : undefined,
    updatedAt: Date.now(),
  };
}

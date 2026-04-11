import type { ParseDiagnostic } from '@/lib/openFlowDSLParser';
import type {
    MermaidImportDiagnostic,
    MermaidImportStatus,
} from '@/services/mermaid/importContracts';
import type { MermaidDiagnosticsSnapshot } from '@/store/types';
import {
    getMermaidImportStateDetail,
    getMermaidImportStateGuidance,
    getMermaidStatusLabel,
} from '@/services/mermaid/importStatePresentation';
import { writeLocalStorageJson } from '@/services/storage/uiLocalStorage';

export type ImportSource = 'json' | 'mermaid' | 'openflowdsl' | 'drawio' | 'visio';
export type ImportSeverity = 'info' | 'warning' | 'error';

export interface ImportIssue {
    code: string;
    severity: ImportSeverity;
    message: string;
    line?: number;
    snippet?: string;
    hint?: string;
}

export interface ImportFidelityReport {
    id: string;
    source: ImportSource;
    importState?: MermaidImportStatus;
    layoutMode?: MermaidDiagnosticsSnapshot['layoutMode'];
    layoutFallbackReason?: string;
    originalSource?: string;
    timestamp: string;
    status: 'success' | 'success_with_warnings' | 'failed';
    nodeCount: number;
    edgeCount: number;
    elapsedMs: number;
    issues: ImportIssue[];
    summary: {
        warningCount: number;
        errorCount: number;
    };
}

const IMPORT_REPORT_STORAGE_KEY = 'openflowkit-import-report-latest';

function isOfficialFlowchartReason(layoutFallbackReason?: string): boolean {
    return layoutFallbackReason?.toLowerCase().includes('official flowchart') ?? false;
}

function createReportId(): string {
    return `import-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function mapWarningToIssue(warning: string): ImportIssue {
    if (warning.toLowerCase().includes('legacy json')) {
        return { code: 'DOC-001', severity: 'warning', message: warning };
    }
    return { code: 'FMT-001', severity: 'warning', message: warning };
}

export function mapErrorToIssue(error: string): ImportIssue {
    if (error.toLowerCase().includes('unsupported')) {
        return { code: 'UNSUP-001', severity: 'error', message: error };
    }
    if (error.toLowerCase().includes('missing nodes or edges')) {
        return { code: 'FMT-001', severity: 'error', message: error };
    }
    return { code: 'DOC-001', severity: 'error', message: error };
}

export function mapParserDiagnosticToIssue(diagnostic: ParseDiagnostic): ImportIssue {
    const msg = diagnostic.message.toLowerCase();
    let code = 'FMT-001';
    if (msg.includes('no nodes found')) {
        code = 'DOC-001';
    } else if (msg.includes('unrecognized')) {
        code = 'FMT-001';
    } else if (msg.includes('unexpected')) {
        code = 'FMT-001';
    }

    return {
        code,
        severity: 'error',
        message: diagnostic.message,
        line: diagnostic.line,
        snippet: diagnostic.snippet,
        hint: diagnostic.hint,
    };
}

export function mapMermaidDiagnosticToIssue(diagnostic: MermaidImportDiagnostic): ImportIssue {
    return {
        code: diagnostic.code,
        severity: diagnostic.severity,
        message: diagnostic.message,
        line: diagnostic.line,
        snippet: diagnostic.snippet,
        hint: diagnostic.hint,
    };
}

export function buildImportFidelityReport(params: {
    source: ImportSource;
    importState?: MermaidImportStatus;
    layoutMode?: MermaidDiagnosticsSnapshot['layoutMode'];
    layoutFallbackReason?: string;
    originalSource?: string;
    nodeCount: number;
    edgeCount: number;
    elapsedMs: number;
    issues: ImportIssue[];
}): ImportFidelityReport {
    const issues = appendMermaidLayoutIssue(params);
    const warningCount = issues.filter((issue) => issue.severity === 'warning').length;
    const errorCount = issues.filter((issue) => issue.severity === 'error').length;
    const status = errorCount > 0 ? 'failed' : (warningCount > 0 ? 'success_with_warnings' : 'success');

    return {
        id: createReportId(),
        source: params.source,
        importState: params.importState,
        layoutMode: params.layoutMode,
        layoutFallbackReason: params.layoutFallbackReason,
        originalSource: params.originalSource,
        timestamp: new Date().toISOString(),
        status,
        nodeCount: params.nodeCount,
        edgeCount: params.edgeCount,
        elapsedMs: params.elapsedMs,
        issues,
        summary: {
            warningCount,
            errorCount,
        },
    };
}

export function persistLatestImportReport(report: ImportFidelityReport): void {
    writeLocalStorageJson(IMPORT_REPORT_STORAGE_KEY, report);
}

export function summarizeImportReport(report: ImportFidelityReport): string {
    const { warningCount, errorCount } = report.summary;
    if (report.source === 'mermaid') {
        const label = getMermaidStatusLabel({
            importState: report.importState,
            layoutMode: report.layoutMode,
        });
        const detail = getMermaidImportStateDetail({
            importState: report.importState,
            nodeCount: report.nodeCount,
            edgeCount: report.edgeCount,
        });
        const layoutDetail = getMermaidReportLayoutDetail(report);
        return `MERMAID import: ${label} (${[detail, layoutDetail, `${warningCount} warnings`, `${errorCount} errors`].filter(Boolean).join(', ')})`;
    }

    return `${report.source.toUpperCase()} import: ${report.status} (${report.nodeCount} nodes, ${report.edgeCount} edges, ${warningCount} warnings, ${errorCount} errors)`;
}

export function getImportRecoveryGuidance(report: ImportFidelityReport): string {
    if (report.source === 'mermaid') {
        const layoutGuidance = getMermaidLayoutRecoveryGuidance(report);
        if (layoutGuidance) {
            return layoutGuidance;
        }
        return (
            getMermaidImportStateGuidance(report.importState)
            ?? 'Review the Mermaid diagnostics, then retry with simplified or corrected Mermaid code.'
        );
    }

    return 'If this file came from another tool, try exporting a plain JSON/OpenFlowKit file again or remove unsupported metadata before retrying.';
}

function getMermaidReportLayoutDetail(report: ImportFidelityReport): string | null {
    if (report.layoutMode === 'mermaid_exact') {
        return 'exact Mermaid layout';
    }
    if (report.layoutMode === 'mermaid_preserved_partial') {
        return report.layoutFallbackReason
            ? `partial Mermaid layout preserved (${report.layoutFallbackReason})`
            : 'partial Mermaid layout preserved';
    }
    if (report.layoutMode === 'mermaid_partial') {
        const prefix = isOfficialFlowchartReason(report.layoutFallbackReason)
            ? 'editable Mermaid import with preserved official flowchart geometry'
            : 'editable Mermaid import with partial preserved geometry';
        return report.layoutFallbackReason
            ? `${prefix} (${report.layoutFallbackReason})`
            : prefix;
    }
    if (report.layoutMode === 'elk_fallback') {
        return report.layoutFallbackReason
            ? `ELK fallback (${report.layoutFallbackReason})`
            : 'ELK fallback';
    }

    return null;
}

function getMermaidLayoutRecoveryGuidance(report: ImportFidelityReport): string | undefined {
    if (report.layoutMode === 'mermaid_preserved_partial') {
        return report.layoutFallbackReason
            ? `Mermaid layout was mostly preserved, but some fidelity was downgraded: ${report.layoutFallbackReason}. Review the imported diagram, then refine the Mermaid code if route or container fidelity still looks off.`
            : 'Mermaid layout was mostly preserved, but some fidelity was downgraded. Review the imported diagram, then refine the Mermaid code if route or container fidelity still looks off.';
    }

    if (report.layoutMode === 'mermaid_partial') {
        const prefix = isOfficialFlowchartReason(report.layoutFallbackReason)
            ? 'Official Mermaid flowchart import was partial, but native editable geometry was preserved'
            : 'Mermaid extraction was partial, but native editable geometry was preserved';
        return report.layoutFallbackReason
            ? `${prefix}: ${report.layoutFallbackReason}. Review the imported diagram and adjust the Mermaid source only if the unmatched geometry still needs cleanup.`
            : `${prefix}. Review the imported diagram and adjust the Mermaid source only if the unmatched geometry still needs cleanup.`;
    }

    if (report.layoutMode === 'elk_fallback') {
        return report.layoutFallbackReason
            ? `Mermaid layout could not be preserved and ELK fallback was used: ${report.layoutFallbackReason}. Simplify the Mermaid source or continue editing from Mermaid code for best fidelity.`
            : 'Mermaid layout could not be preserved and ELK fallback was used. Simplify the Mermaid source or continue editing from Mermaid code for best fidelity.';
    }

    return undefined;
}

function appendMermaidLayoutIssue(params: {
    source: ImportSource;
    layoutMode?: MermaidDiagnosticsSnapshot['layoutMode'];
    layoutFallbackReason?: string;
    issues: ImportIssue[];
}): ImportIssue[] {
    if (params.source !== 'mermaid') {
        return params.issues;
    }

    const layoutIssue = getMermaidLayoutIssue(params.layoutMode, params.layoutFallbackReason);
    if (!layoutIssue) {
        return params.issues;
    }

    const alreadyPresent = params.issues.some(
        (issue) => issue.code === layoutIssue.code && issue.message === layoutIssue.message
    );
    if (alreadyPresent) {
        return params.issues;
    }

    return [...params.issues, layoutIssue];
}

function getMermaidLayoutIssue(
    layoutMode: MermaidDiagnosticsSnapshot['layoutMode'],
    layoutFallbackReason?: string
): ImportIssue | null {
    if (layoutMode === 'mermaid_preserved_partial') {
        return {
            code: 'MERMAID_LAYOUT_PRESERVED',
            severity: 'warning',
            message: layoutFallbackReason
                ? `Partial Mermaid layout preserved: ${layoutFallbackReason}`
                : 'Partial Mermaid layout preserved.',
            hint: 'Review edge routes and container geometry before relying on the imported layout.',
        };
    }

    if (layoutMode === 'mermaid_partial') {
        const prefix = isOfficialFlowchartReason(layoutFallbackReason)
            ? 'Official Mermaid flowchart import preserved native editable geometry with partial fidelity'
            : 'Partial Mermaid extraction preserved native editable geometry';
        return {
            code: 'MERMAID_LAYOUT_PARTIAL',
            severity: 'warning',
            message: layoutFallbackReason
                ? `${prefix}: ${layoutFallbackReason}`
                : `${prefix}.`,
            hint: 'Review unmatched sections or edge routes, but keep editing in native nodes/connectors.',
        };
    }

    if (layoutMode === 'elk_fallback') {
        return {
            code: 'MERMAID_LAYOUT_FALLBACK',
            severity: 'warning',
            message: layoutFallbackReason
                ? `Mermaid layout could not be preserved: ${layoutFallbackReason}`
                : 'Mermaid layout could not be preserved.',
            hint: 'Simplify the Mermaid source or continue editing from Mermaid code for best fidelity.',
        };
    }

    return null;
}

import { describe, expect, it } from 'vitest';
import { buildMermaidDiagnosticsSnapshot } from './diagnosticsSnapshot';

describe('diagnosticsSnapshot', () => {
  it('builds a partial-editability snapshot with preserved Mermaid layout status', () => {
    const snapshot = buildMermaidDiagnosticsSnapshot({
      source: 'paste',
      diagramType: 'flowchart',
      importState: 'editable_partial',
      layoutMode: 'mermaid_preserved_partial',
      layoutFallbackReason: 'matched 2/3 nodes',
      originalSource: 'flowchart TD\nA-->B',
      diagnostics: [{ message: 'warning' }],
      nodeCount: 3,
      edgeCount: 2,
    });

    expect(snapshot.statusLabel).toBe('Ready with warnings');
    expect(snapshot.statusDetail).toContain('3 nodes, 2 edges, partial editability');
    expect(snapshot.statusDetail).toContain('Partial Mermaid layout preserved');
    expect(snapshot.originalSource).toContain('flowchart TD');
    expect(snapshot.layoutMode).toBe('mermaid_preserved_partial');
    expect(snapshot.layoutFallbackReason).toBe('matched 2/3 nodes');
    expect(snapshot.error).toBeUndefined();
  });

  it('describes mermaid_partial as preserved editable geometry rather than ELK fallback', () => {
    const snapshot = buildMermaidDiagnosticsSnapshot({
      source: 'paste',
      diagramType: 'flowchart',
      importState: 'editable_partial',
      layoutMode: 'mermaid_partial',
      layoutFallbackReason: 'matched 2/3 nodes',
      originalSource: 'flowchart TD\nA-->B',
      diagnostics: [{ message: 'warning' }],
      nodeCount: 3,
      edgeCount: 2,
    });

    expect(snapshot.statusDetail).toContain('Imported as editable diagram with partial Mermaid geometry');
    expect(snapshot.layoutMode).toBe('mermaid_partial');
  });

  it('uses native editable wording for structurally partial official Mermaid imports', () => {
    const snapshot = buildMermaidDiagnosticsSnapshot({
      source: 'paste',
      diagramType: 'flowchart',
      importState: 'editable_partial',
      layoutMode: 'mermaid_partial',
      layoutFallbackReason: 'matched 0/1 official flowchart sections',
      originalSource: 'flowchart LR\nsubgraph group\nA-->B\nend',
      diagnostics: [{ message: 'warning' }],
      nodeCount: 2,
      edgeCount: 1,
    });

    expect(snapshot.statusDetail).toContain('Imported as editable diagram with preserved Mermaid geometry');
  });

  it('upgrades editable_full snapshots with degraded layout to warning status', () => {
    const snapshot = buildMermaidDiagnosticsSnapshot({
      source: 'paste',
      diagramType: 'flowchart',
      importState: 'editable_full',
      layoutMode: 'mermaid_preserved_partial',
      layoutFallbackReason: 'matched 1/2 official flowchart edge routes',
      originalSource: 'flowchart LR\nA-->B',
      diagnostics: [],
      nodeCount: 2,
      edgeCount: 1,
    });

    expect(snapshot.statusLabel).toBe('Ready with warnings');
    expect(snapshot.statusDetail).toContain('2 nodes, 1 edges');
    expect(snapshot.statusDetail).toContain('Partial Mermaid layout preserved');
    expect(snapshot.importState).toBe('editable_full');
  });

  it('adds fallback guidance to blocked snapshots', () => {
    const snapshot = buildMermaidDiagnosticsSnapshot({
      source: 'code',
      importState: 'unsupported_family',
      diagnostics: [],
      error: 'Mermaid "gitGraph" is not supported yet in editable mode.',
    });

    expect(snapshot.error).toContain('not editable yet');
    expect(snapshot.statusLabel).toBe('Unsupported Mermaid family');
  });

  it('describes renderer-first imports as exact Mermaid SVG renders', () => {
    const snapshot = buildMermaidDiagnosticsSnapshot({
      source: 'paste',
      diagramType: 'flowchart',
      importState: 'editable_full',
      visualMode: 'renderer_exact',
      originalSource: 'flowchart LR\nA-->B',
      diagnostics: [],
      nodeCount: 1,
      edgeCount: 0,
    });

    expect(snapshot.statusLabel).toBe('Rendered from Mermaid SVG');
    expect(snapshot.statusDetail).toContain('Rendered exactly from Mermaid SVG');
    expect(snapshot.visualMode).toBe('renderer_exact');
  });

  it('uses editable-mermaid status labels for native exact imports', () => {
    const snapshot = buildMermaidDiagnosticsSnapshot({
      source: 'paste',
      diagramType: 'flowchart',
      importState: 'editable_full',
      layoutMode: 'mermaid_exact',
      originalSource: 'flowchart LR\nA-->B',
      diagnostics: [],
      nodeCount: 2,
      edgeCount: 1,
    });

    expect(snapshot.statusLabel).toBe('Imported as editable Mermaid diagram');
    expect(snapshot.statusDetail).toContain('Exact Mermaid layout');
  });
});

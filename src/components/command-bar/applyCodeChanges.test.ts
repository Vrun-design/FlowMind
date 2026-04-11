import { describe, expect, it, vi } from 'vitest';
import { applyCodeChanges } from './applyCodeChanges';
import { composeDiagramForDisplay } from '@/services/composeDiagramForDisplay';
import { importMermaidToCanvas } from '@/services/mermaid/rendererFirstImport';

vi.mock('@/services/composeDiagramForDisplay', () => ({
  composeDiagramForDisplay: vi.fn(async (nodes, edges) => ({ nodes, edges })),
}));

vi.mock('@/services/mermaid/rendererFirstImport', () => ({
  resolveEffectiveMermaidImportMode: vi.fn((importMode, diagramType) =>
    diagramType === 'flowchart' ? 'native_editable' : importMode
  ),
  importMermaidToCanvas: vi.fn(async ({ parsed, importMode }) => ({
    nodes: parsed.nodes,
    edges: parsed.edges,
    visualMode: 'editable_exact',
    importMode,
  })),
}));

describe('applyCodeChanges', () => {
  it('passes Mermaid import context into display composition for code apply', async () => {
    const onApply = vi.fn();

    const applied = await applyCodeChanges({
      mode: 'mermaid',
      code: 'flowchart LR\nA-->B',
      architectureStrictMode: false,
      mermaidImportMode: 'native_editable',
      onApply,
      onClose: vi.fn(),
      activeTabId: 'tab-1',
      updateTab: vi.fn(),
      setMermaidDiagnostics: vi.fn(),
      clearMermaidDiagnostics: vi.fn(),
      addToast: vi.fn(),
      setError: vi.fn(),
      setDiagnostics: vi.fn(),
      setIsApplying: vi.fn(),
      setLiveStatus: vi.fn(),
      isLiveRequestStale: vi.fn(() => false),
      options: {
        closeOnSuccess: false,
        source: 'manual',
      },
    });

    expect(applied).toBe(true);
    expect(importMermaidToCanvas).toHaveBeenCalledWith(
      expect.objectContaining({
        importMode: 'native_editable',
        source: 'flowchart LR\nA-->B',
      })
    );
    expect(onApply).toHaveBeenCalled();
  });

  it('uses native editable Mermaid import by default for code apply', async () => {
    const onApply = vi.fn();

    const applied = await applyCodeChanges({
      mode: 'mermaid',
      code: 'flowchart LR\nA-->B',
      architectureStrictMode: false,
      onApply,
      onClose: vi.fn(),
      activeTabId: 'tab-1',
      updateTab: vi.fn(),
      setMermaidDiagnostics: vi.fn(),
      clearMermaidDiagnostics: vi.fn(),
      addToast: vi.fn(),
      setError: vi.fn(),
      setDiagnostics: vi.fn(),
      setIsApplying: vi.fn(),
      setLiveStatus: vi.fn(),
      isLiveRequestStale: vi.fn(() => false),
      options: {
        closeOnSuccess: false,
        source: 'manual',
      },
    });

    expect(applied).toBe(true);
    expect(importMermaidToCanvas).toHaveBeenCalledWith(
      expect.objectContaining({
        importMode: 'native_editable',
      })
    );
    expect(composeDiagramForDisplay).not.toHaveBeenCalled();
    expect(onApply).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'process',
        }),
      ]),
      expect.arrayContaining([
        expect.objectContaining({
          source: 'A',
          target: 'B',
        }),
      ])
    );
  });

  it('blocks Mermaid apply when official validation rejects invalid syntax', async () => {
    const setMermaidDiagnostics = vi.fn();
    const setError = vi.fn();
    const setDiagnostics = vi.fn();
    const addToast = vi.fn();

    const applied = await applyCodeChanges({
      mode: 'mermaid',
      code: 'flowchart TD\nA -->',
      architectureStrictMode: false,
      onApply: vi.fn(),
      onClose: vi.fn(),
      activeTabId: 'tab-1',
      updateTab: vi.fn(),
      setMermaidDiagnostics,
      clearMermaidDiagnostics: vi.fn(),
      addToast,
      setError,
      setDiagnostics,
      setIsApplying: vi.fn(),
      setLiveStatus: vi.fn(),
      isLiveRequestStale: vi.fn(() => false),
      options: {
        closeOnSuccess: false,
        source: 'manual',
      },
    });

    expect(applied).toBe(false);
    expect(setError).toHaveBeenCalledWith(expect.stringContaining('Parse error'));
    expect(setDiagnostics).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining('Parse error'),
        }),
      ])
    );
    expect(setMermaidDiagnostics).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('Parse error'),
        originalSource: 'flowchart TD\nA -->',
        statusLabel: 'Unsupported Mermaid construct',
      })
    );
    expect(addToast).toHaveBeenCalled();
  });

  it('adds fallback guidance for unsupported Mermaid families', async () => {
    const setMermaidDiagnostics = vi.fn();
    const setError = vi.fn();
    const setDiagnostics = vi.fn();
    const addToast = vi.fn();

    const applied = await applyCodeChanges({
      mode: 'mermaid',
      code: 'gitGraph\ncommit id: "A"',
      architectureStrictMode: false,
      onApply: vi.fn(),
      onClose: vi.fn(),
      activeTabId: 'tab-1',
      updateTab: vi.fn(),
      setMermaidDiagnostics,
      clearMermaidDiagnostics: vi.fn(),
      addToast,
      setError,
      setDiagnostics,
      setIsApplying: vi.fn(),
      setLiveStatus: vi.fn(),
      isLiveRequestStale: vi.fn(() => false),
      options: {
        closeOnSuccess: false,
        source: 'manual',
      },
    });

    expect(applied).toBe(false);
    expect(setError).toHaveBeenCalledWith(expect.stringContaining('not editable yet'));
    expect(setMermaidDiagnostics).toHaveBeenCalledWith(
      expect.objectContaining({
        originalSource: 'gitGraph\ncommit id: "A"',
        statusLabel: 'Unsupported Mermaid family',
      })
    );
    expect(
      addToast.mock.calls.some(
        ([message]) => typeof message === 'string' && message.includes('not editable yet')
      )
    ).toBe(true);
  });
});

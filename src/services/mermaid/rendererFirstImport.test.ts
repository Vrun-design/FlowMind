import { beforeEach, describe, expect, it, vi } from 'vitest';
import { importMermaidToCanvas } from './rendererFirstImport';
import type { MermaidDispatchParseResult } from './parseMermaidByType';

const initializeMock = vi.fn();
const renderMock = vi.fn();

vi.mock('@/services/composeDiagramForDisplay', () => ({
  composeDiagramForDisplay: vi.fn(async (nodes, edges) => ({
    nodes,
    edges,
    layoutMode: 'mermaid_exact',
    svgExtracted: true,
  })),
  sortParentsBeforeChildren: vi.fn((nodes) => nodes),
}));

vi.mock('@/services/smartEdgeRouting', () => ({
  assignSmartHandles: vi.fn((nodes, edges) => edges),
}));

vi.mock('mermaid', () => ({
  default: {
    initialize: initializeMock,
    render: renderMock,
  },
}));

function createParsedResult(): MermaidDispatchParseResult {
  return {
    nodes: [
      {
        id: 'a',
        type: 'process',
        position: { x: 0, y: 0 },
        data: { label: 'A' },
      },
      {
        id: 'b',
        type: 'process',
        position: { x: 0, y: 0 },
        data: { label: 'B' },
      },
    ],
    edges: [{ id: 'e1', source: 'a', target: 'b' }],
    diagramType: 'flowchart',
    originalSource: 'flowchart TD\nA-->B',
  };
}

describe('importMermaidToCanvas', () => {
  beforeEach(() => {
    initializeMock.mockReset();
    renderMock.mockReset();
    document.body.innerHTML = '';
  });

  it('imports flowcharts as native editable graphs by default', async () => {
    renderMock.mockResolvedValue({
      svg: '<svg viewBox="0 0 640 320" width="640" height="320"></svg>',
    });

    const result = await importMermaidToCanvas({
      parsed: createParsedResult(),
      source: 'flowchart TD\nA-->B',
      importMode: 'renderer_first',
      layout: {
        direction: 'TB',
        spacing: 'normal',
        contentDensity: 'balanced',
      },
    });

    expect(initializeMock).not.toHaveBeenCalled();
    expect(result.importMode).toBe('native_editable');
    expect(result.visualMode).not.toBe('renderer_exact');
    expect(result.nodes.every((node) => node.type !== 'mermaid_svg')).toBe(true);
    expect(result.nodes.map((node) => node.id)).toEqual(expect.arrayContaining(['a', 'b']));
    expect(result.edges).toHaveLength(1);
  });
});

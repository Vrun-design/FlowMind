import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlowEdge, FlowNode } from '@/lib/types';
import { composeDiagramForDisplay } from './composeDiagramForDisplay';
import { getElkLayout } from './elkLayout';
import { relayoutMindmapComponent, syncMindmapEdges } from '@/lib/mindmapLayout';
import { extractMermaidLayout } from '@/services/mermaid/extractLayoutFromSvg';
import { buildOfficialFlowchartImportGraph } from '@/services/mermaid/officialFlowchartImport';

vi.mock('./elkLayout', () => ({
  getElkLayout: vi.fn(async (nodes: FlowNode[], edges: FlowEdge[]) => ({ nodes, edges })),
}));

vi.mock('@/services/mermaid/extractLayoutFromSvg', () => ({
  extractMermaidLayout: vi.fn(async () => null),
}));

vi.mock('@/services/mermaid/officialFlowchartImport', () => ({
  buildOfficialFlowchartImportGraph: vi.fn(async () => null),
}));

vi.mock('@/lib/mindmapLayout', () => ({
  relayoutMindmapComponent: vi.fn((nodes: FlowNode[]) => nodes),
  syncMindmapEdges: vi.fn((_: FlowNode[], edges: FlowEdge[]) => edges),
}));

function createNode(
  id: string,
  options: Partial<FlowNode> & { label?: string; type?: string } = {}
): FlowNode {
  const { label, data, type = 'process', ...rest } = options;
  return {
    id,
    type,
    position: { x: 0, y: 0 },
    ...rest,
    data: {
      label: label ?? id,
      ...(data ?? {}),
    },
  } as FlowNode;
}

function createEdge(id: string, source: string, target: string): FlowEdge {
  return { id, source, target } as FlowEdge;
}

describe('composeDiagramForDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses ELK composition for regular diagrams', async () => {
    const nodes = [createNode('a'), createNode('b')];
    const edges = [createEdge('e1', 'a', 'b')];

    await composeDiagramForDisplay(nodes, edges, {
      direction: 'LR',
      algorithm: 'layered',
      spacing: 'compact',
      contentDensity: 'compact',
    });

    expect(getElkLayout).toHaveBeenCalledWith(nodes, edges, {
      direction: 'LR',
      algorithm: 'layered',
      spacing: 'compact',
      contentDensity: 'compact',
      diagramType: undefined,
      source: undefined,
    });
  });

  it('uses ELK fallback composition for imported non-sequence diagrams when SVG extraction is unavailable', async () => {
    const nodes = [createNode('a'), createNode('b')];
    const edges = [createEdge('e1', 'a', 'b')];

    const result = await composeDiagramForDisplay(nodes, edges, {
      direction: 'TB',
      spacing: 'compact',
      contentDensity: 'balanced',
      diagramType: 'flowchart',
      source: 'import',
    });

    expect(getElkLayout).toHaveBeenCalledWith(nodes, edges, {
      direction: 'TB',
      algorithm: undefined,
      spacing: 'compact',
      contentDensity: 'balanced',
      diagramType: 'flowchart',
      source: 'import',
    });
    expect(result.layoutMode).toBe('elk_fallback');
  });

  it('preserves Mermaid exact edge geometry when SVG extraction fully matches', async () => {
    const nodes = [createNode('a'), createNode('b')];
    const edges = [createEdge('e1', 'a', 'b')];
    vi.mocked(extractMermaidLayout).mockResolvedValueOnce({
      nodes: [
        { id: 'a', x: 10, y: 20, width: 120, height: 52 },
        { id: 'b', x: 210, y: 20, width: 120, height: 52 },
      ],
      clusters: [],
      edges: [
        {
          source: 'a',
          target: 'b',
          path: 'M 130 46 C 160 46, 170 46, 210 46',
          points: [{ x: 130, y: 46 }, { x: 170, y: 46 }, { x: 210, y: 46 }],
        },
      ],
      matchedLeafNodeCount: 2,
      totalLeafNodeCount: 2,
      matchedSectionCount: 0,
      totalSectionCount: 0,
    });

    const result = await composeDiagramForDisplay(nodes, edges, {
      diagramType: 'flowchart',
      source: 'import',
      mermaidSource: 'flowchart LR\nA-->B',
    });

    expect(result.layoutMode).toBe('mermaid_exact');
    expect(result.svgExtracted).toBe(true);
    expect(result.edges[0].data?.routingMode).toBe('import-fixed');
    expect(result.edges[0].data?.importRoutePath).toBe('M 130 46 C 160 46, 170 46, 210 46');
    expect(getElkLayout).not.toHaveBeenCalledWith(nodes, edges, expect.objectContaining({
      source: 'import',
    }));
  });

  it('prefers the official flowchart import builder when it resolves an exact editable graph', async () => {
    const nodes = [createNode('a'), createNode('b')];
    const edges = [createEdge('e1', 'a', 'b')];
    vi.mocked(buildOfficialFlowchartImportGraph).mockResolvedValueOnce({
      nodes: [
        createNode('a', { position: { x: 20, y: 40 } }),
        createNode('b', { position: { x: 220, y: 40 } }),
      ],
      edges: [
        {
          ...createEdge('e1', 'a', 'b'),
          data: {
            routingMode: 'import-fixed',
            importRoutePath: 'M 100 66 C 140 66, 180 66, 220 66',
          },
        } as FlowEdge,
      ],
      matchedLeafNodeCount: 2,
      totalLeafNodeCount: 2,
      matchedSectionCount: 0,
      totalSectionCount: 0,
      matchedEdgeGeometryCount: 1,
      totalEdgeCount: 1,
    });

    const result = await composeDiagramForDisplay(nodes, edges, {
      diagramType: 'flowchart',
      source: 'import',
      mermaidSource: 'flowchart LR\nA-->B',
    });

    expect(result.layoutMode).toBe('mermaid_exact');
    expect(result.svgExtracted).toBe(true);
    expect(result.nodes.find((node) => node.id === 'a')?.position).toEqual({ x: 20, y: 40 });
    expect(result.edges[0].data?.routingMode).toBe('import-fixed');
    expect(extractMermaidLayout).not.toHaveBeenCalled();
    expect(getElkLayout).not.toHaveBeenCalled();
  });

  it('keeps Mermaid node geometry when only edge matching is partial and preserves matched section sizing', async () => {
    const nodes = [
      createNode('a'),
      createNode('b'),
      createNode('group', { type: 'section' }),
      createNode('child', { parentId: 'group' }),
    ];
    const edges = [createEdge('e1', 'a', 'b'), createEdge('e2', 'a', 'group')];
    vi.mocked(extractMermaidLayout).mockResolvedValueOnce({
      nodes: [
        { id: 'a', x: 10, y: 20, width: 120, height: 52 },
        { id: 'b', x: 210, y: 20, width: 120, height: 52 },
        { id: 'child', x: 220, y: 70, width: 100, height: 40 },
      ],
      clusters: [{ id: 'group', x: 180, y: 0, width: 200, height: 140 }],
      edges: [
        {
          source: 'a',
          target: 'b',
          path: 'M 130 46 C 160 46, 170 46, 210 46',
          points: [{ x: 130, y: 46 }, { x: 170, y: 46 }, { x: 210, y: 46 }],
        },
      ],
      matchedLeafNodeCount: 3,
      totalLeafNodeCount: 3,
      matchedSectionCount: 1,
      totalSectionCount: 1,
      reason: 'matched 1/2 edges while preserving Mermaid node geometry',
    });

    const result = await composeDiagramForDisplay(nodes, edges, {
      diagramType: 'flowchart',
      source: 'import',
      mermaidSource: 'flowchart LR\nA-->B\nA-->group',
    });

    expect(result.layoutMode).toBe('mermaid_preserved_partial');
    expect(result.svgExtracted).toBe(true);
    expect(result.layoutFallbackReason).toContain('matched 1/2 edges');
    expect(result.nodes.find((node) => node.id === 'a')?.position).toEqual({ x: 10, y: 20 });
    expect(result.nodes.find((node) => node.id === 'group')?.data?.sectionSizingMode).toBe('manual');
    expect(result.nodes.find((node) => node.id === 'group')?.style).toMatchObject({
      width: 200,
      height: 140,
    });
    // Leaf nodes get a text-estimated style.width (for wrapping) but NOT style.height —
    // React Flow measures height from rendered content so each node sizes to its lines.
    const childWidth = result.nodes.find((node) => node.id === 'child')?.style?.width as number | undefined;
    expect(typeof childWidth).toBe('number');
    expect(childWidth).toBeGreaterThanOrEqual(120);
    expect(childWidth).toBeLessThanOrEqual(200);
    expect(result.nodes.find((node) => node.id === 'child')?.style?.height).toBeUndefined();
    expect(result.edges[0].data?.routingMode).toBe('import-fixed');
    expect(result.edges[1].data?.routingMode).not.toBe('import-fixed');
    expect(getElkLayout).not.toHaveBeenCalledWith(nodes, edges, expect.objectContaining({
      source: 'import',
    }));
  });

  it('marks official flowchart partial edge fidelity as preserved Mermaid layout instead of ELK fallback', async () => {
    const nodes = [createNode('a'), createNode('b')];
    const edges = [createEdge('e1', 'a', 'b'), createEdge('e2', 'b', 'a')];
    vi.mocked(buildOfficialFlowchartImportGraph).mockResolvedValueOnce({
      nodes: [
        createNode('a', { position: { x: 20, y: 40 } }),
        createNode('b', { position: { x: 220, y: 40 } }),
      ],
      edges: [
        {
          ...createEdge('e1', 'a', 'b'),
          data: {
            routingMode: 'import-fixed',
            importRoutePath: 'M 100 66 C 140 66, 180 66, 220 66',
          },
        } as FlowEdge,
        createEdge('e2', 'b', 'a'),
      ],
      matchedLeafNodeCount: 2,
      totalLeafNodeCount: 2,
      matchedSectionCount: 0,
      totalSectionCount: 0,
      matchedEdgeGeometryCount: 1,
      totalEdgeCount: 2,
      reason: 'matched 1/2 official flowchart edge routes',
    });

    const result = await composeDiagramForDisplay(nodes, edges, {
      diagramType: 'flowchart',
      source: 'import',
      mermaidSource: 'flowchart LR\nA-->B\nB-->A',
    });

    expect(result.layoutMode).toBe('mermaid_preserved_partial');
    expect(result.layoutFallbackReason).toContain('matched 1/2 official flowchart edge routes');
    expect(result.svgExtracted).toBe(true);
    expect(extractMermaidLayout).not.toHaveBeenCalled();
    expect(getElkLayout).not.toHaveBeenCalled();
  });

  it('uses official graph positions when the official flowchart importer returns a structurally partial graph', async () => {
    const nodes = [createNode('a'), createNode('b'), createNode('group', { type: 'section' })];
    const edges = [createEdge('e1', 'a', 'b')];
    vi.mocked(buildOfficialFlowchartImportGraph).mockResolvedValueOnce({
      nodes: [
        createNode('a', { position: { x: 20, y: 40 } }),
        createNode('b', { position: { x: 220, y: 40 } }),
      ],
      edges,
      matchedLeafNodeCount: 2,
      totalLeafNodeCount: 2,
      matchedSectionCount: 0,
      totalSectionCount: 1,
      matchedEdgeGeometryCount: 1,
      totalEdgeCount: 1,
      reason: 'matched 0/1 official flowchart sections',
    });
    vi.mocked(extractMermaidLayout).mockResolvedValueOnce({
      nodes: [
        { id: 'a', x: 10, y: 20, width: 120, height: 52 },
        { id: 'b', x: 210, y: 20, width: 120, height: 52 },
      ],
      clusters: [{ id: 'group', x: 180, y: 0, width: 200, height: 140 }],
      edges: [
        {
          source: 'a',
          target: 'b',
          path: 'M 130 46 C 160 46, 170 46, 210 46',
          points: [{ x: 130, y: 46 }, { x: 170, y: 46 }, { x: 210, y: 46 }],
        },
      ],
      matchedLeafNodeCount: 2,
      totalLeafNodeCount: 2,
      matchedSectionCount: 1,
      totalSectionCount: 1,
    });

    const result = await composeDiagramForDisplay(nodes, edges, {
      diagramType: 'flowchart',
      source: 'import',
      mermaidSource: 'flowchart LR\nsubgraph group\nA-->B\nend',
    });

    expect(result.layoutMode).toBe('mermaid_partial');
    expect(result.layoutFallbackReason).toContain('matched 0/1 official flowchart sections');
    expect(result.svgExtracted).toBe(true);
    expect(getElkLayout).not.toHaveBeenCalled();
    expect(extractMermaidLayout).not.toHaveBeenCalled();
  });

  it('uses mindmap relayout for mindmap diagrams', async () => {
    const nodes = [createNode('root', { type: 'mindmap' }), createNode('child', { type: 'mindmap' })];
    const edges = [createEdge('e1', 'root', 'child')];

    await composeDiagramForDisplay(nodes, edges, { diagramType: 'mindmap' });

    expect(relayoutMindmapComponent).toHaveBeenCalled();
    expect(syncMindmapEdges).toHaveBeenCalled();
    expect(getElkLayout).not.toHaveBeenCalledWith(nodes, edges, expect.anything());
  });
});

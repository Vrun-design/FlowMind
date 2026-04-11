import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlowNode } from '@/lib/types';
import { buildOfficialFlowchartImportGraph } from './officialFlowchartImport';
import { extractRawMermaidGeometry } from './extractLayoutFromSvg';

const getDiagramFromTextMock = vi.fn();

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    mermaidAPI: {
      getDiagramFromText: getDiagramFromTextMock,
    },
  },
}));

vi.mock('./extractLayoutFromSvg', async () => {
  const actual = await vi.importActual<typeof import('./extractLayoutFromSvg')>('./extractLayoutFromSvg');
  return {
    ...actual,
    extractRawMermaidGeometry: vi.fn(),
  };
});

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

describe('buildOfficialFlowchartImportGraph', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds editable flowchart nodes, sections, and fixed routes from official Mermaid data', async () => {
    getDiagramFromTextMock.mockResolvedValue({
      getType: () => 'flowchart-v2',
      db: {
        edges: [
          { start: 'api', end: 'worker', text: 'async', id: 'L_api_worker_0' },
          { start: 'worker', end: 'payments-team', text: '', id: 'L_worker_payments_0' },
        ],
        subGraphs: [
          {
            id: 'payments-team',
            nodes: ['api', 'worker'],
            title: 'Payments Team',
          },
        ],
        vertices: {
          api: { text: 'API' },
          worker: { text: 'Worker' },
        },
      },
    });

    vi.mocked(extractRawMermaidGeometry).mockResolvedValue({
      nodes: [
        { rawId: 'api', label: 'API', x: 40, y: 60, width: 110, height: 52 },
        { rawId: 'worker', label: 'Worker', x: 220, y: 60, width: 120, height: 52 },
      ],
      clusters: [
        { rawId: 'payments-team', label: 'Payments Team', x: 20, y: 20, width: 360, height: 160 },
      ],
      edges: [
        {
          rawId: 'L_api_worker_0',
          path: 'M 150 86 C 180 86, 200 86, 220 86',
          points: [{ x: 150, y: 86 }, { x: 200, y: 86 }, { x: 220, y: 86 }],
        },
        {
          rawId: 'L_worker_payments_0',
          path: 'M 340 86 C 350 86, 365 86, 380 86',
          points: [{ x: 340, y: 86 }, { x: 365, y: 86 }, { x: 380, y: 86 }],
        },
      ],
    });

    const graph = await buildOfficialFlowchartImportGraph(
      'flowchart LR\nsubgraph Payments Team\napi[API]\nworker[Worker]\nend\napi-->worker\nworker-->payments-team',
      [
        createNode('payments', {
          type: 'section',
          label: 'Payments Team',
          data: {
            label: 'Payments Team',
            color: 'blue',
            icon: 'Group',
            subLabel: 'legacy',
          },
        }),
        createNode('api', {
          label: 'API',
          parentId: 'payments',
          data: {
            label: 'API',
            color: 'violet',
            icon: 'database',
            assetPresentation: 'icon',
            archIconPackId: 'aws-official-starter-v1',
            archIconShapeId: 'compute-lambda',
          },
        }),
        createNode('worker', {
          label: 'Worker',
          parentId: 'payments',
          data: {
            label: 'Worker',
            color: 'emerald',
            icon: 'server',
          },
        }),
      ]
    );

    expect(graph).not.toBeNull();
    expect(graph?.matchedLeafNodeCount).toBe(2);
    expect(graph?.matchedSectionCount).toBe(1);
    expect(graph?.matchedEdgeGeometryCount).toBe(2);
    expect(graph?.nodes.find((node) => node.id === 'payments')?.style).toMatchObject({
      width: 360,
      height: 160,
    });
    expect(graph?.nodes.find((node) => node.id === 'payments')?.data).toMatchObject({
      color: 'slate',
      colorMode: 'subtle',
      icon: undefined,
      subLabel: '',
    });
    expect(graph?.nodes.find((node) => node.id === 'api')?.data).toMatchObject({
      color: 'white',
      colorMode: 'subtle',
      icon: undefined,
      assetPresentation: undefined,
      archIconPackId: undefined,
      archIconShapeId: undefined,
    });
    expect(graph?.nodes.find((node) => node.id === 'api')?.parentId).toBe('payments');
    expect(graph?.nodes.find((node) => node.id === 'worker')?.parentId).toBe('payments');
    expect(graph?.edges.map((edge) => [edge.source, edge.target, edge.label])).toEqual([
      ['api', 'worker', 'async'],
      ['worker', 'payments', undefined],
    ]);
    expect(graph?.edges.every((edge) => edge.data?.routingMode === 'import-fixed')).toBe(true);
  });

  it('matches parser sections by preserved Mermaid subgraph id before falling back to labels', async () => {
    getDiagramFromTextMock.mockResolvedValue({
      getType: () => 'flowchart-v2',
      db: {
        edges: [],
        subGraphs: [
          {
            id: 'WritePath',
            nodes: ['LT', 'ING1'],
            title: 'Write Path',
          },
        ],
        vertices: {
          LT: { text: 'Live Turn' },
          ING1: { text: 'ingestLiveTurnMemory' },
        },
      },
    });

    vi.mocked(extractRawMermaidGeometry).mockResolvedValue({
      nodes: [
        { rawId: 'LT', label: 'Live Turn', x: 40, y: 40, width: 100, height: 40 },
        { rawId: 'ING1', label: 'ingestLiveTurnMemory', x: 40, y: 120, width: 160, height: 40 },
      ],
      clusters: [
        { rawId: 'WritePath', label: 'Write Path', x: 20, y: 20, width: 220, height: 180 },
      ],
      edges: [{ rawId: 'L_LT_ING1_0', path: 'M 90 80 C 90 95, 90 108, 90 120', points: [{ x: 90, y: 80 }, { x: 90, y: 101 }, { x: 90, y: 120 }] }],
    });

    const graph = await buildOfficialFlowchartImportGraph(
      'flowchart TD\nsubgraph WritePath["Write Path"]\nLT[Live Turn] --> ING1[ingestLiveTurnMemory]\nend',
      [
        createNode('subgraph_Write_Path', {
          type: 'section',
          label: 'Write Path',
          data: {
            label: 'Write Path',
            sectionMermaidId: 'WritePath',
            sectionMermaidTitle: 'Write Path',
          },
        }),
        createNode('LT', {
          label: 'Live Turn',
          parentId: 'subgraph_Write_Path',
        }),
        createNode('ING1', {
          label: 'ingestLiveTurnMemory',
          parentId: 'subgraph_Write_Path',
        }),
      ]
    );

    expect(graph).not.toBeNull();
    expect(graph?.matchedSectionCount).toBe(1);
    expect(graph?.nodes.find((node) => node.type === 'section')?.id).toBe('subgraph_Write_Path');
  });
});

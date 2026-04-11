import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlowEdge, FlowNode } from '@/lib/types';
import { composeDiagramForDisplay } from '@/services/composeDiagramForDisplay';
import { parseMermaidByType } from './parseMermaidByType';
import { MERMAID_COMPAT_FIXTURES } from '../../../scripts/mermaid-compat-fixtures.mjs';
import { buildOfficialFlowchartImportGraph } from './officialFlowchartImport';
import { extractMermaidLayout } from './extractLayoutFromSvg';
import { getElkLayout } from '@/services/elkLayout';

vi.mock('@/services/elkLayout', () => ({
  getElkLayout: vi.fn(async (nodes: FlowNode[], edges: FlowEdge[]) => ({ nodes, edges })),
}));

vi.mock('./officialFlowchartImport', () => ({
  buildOfficialFlowchartImportGraph: vi.fn(async () => null),
}));

vi.mock('./extractLayoutFromSvg', () => ({
  extractMermaidLayout: vi.fn(async () => null),
}));

interface MermaidFixtureRecord {
  name: string;
  source: string;
}

interface FlowchartOutcomeCase {
  fixtureName: string;
  setupMocks(parsed: ReturnType<typeof parseMermaidByType>): void;
  assertResult(result: Awaited<ReturnType<typeof composeDiagramForDisplay>>): void;
}

function getFixtureSource(name: string): string {
  const fixture = (MERMAID_COMPAT_FIXTURES as MermaidFixtureRecord[]).find(
    (candidate) => candidate.name === name
  );
  expect(fixture, `missing fixture "${name}"`).toBeDefined();
  return fixture!.source;
}

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

const FLOWCHART_OUTCOME_CASES: FlowchartOutcomeCase[] = [
  {
    fixtureName: 'flowchart-basic',
    setupMocks(): void {
      vi.mocked(buildOfficialFlowchartImportGraph).mockResolvedValueOnce({
        nodes: [
          createNode('A', { position: { x: 40, y: 40 }, label: 'Start' }),
          createNode('B', { position: { x: 40, y: 180 }, label: 'End' }),
        ],
        edges: [
          {
            ...createEdge('e1', 'A', 'B'),
            data: {
              routingMode: 'import-fixed',
              importRoutePath: 'M 100 94 C 100 120, 100 146, 100 180',
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
    },
    assertResult(result): void {
      expect(result.layoutMode).toBe('mermaid_exact');
      expect(result.svgExtracted).toBe(true);
      expect(result.layoutFallbackReason).toBeUndefined();
      expect(getElkLayout).not.toHaveBeenCalled();
    },
  },
  {
    fixtureName: 'flowchart-auth-decision',
    setupMocks(): void {
      vi.mocked(buildOfficialFlowchartImportGraph).mockResolvedValueOnce({
        nodes: [
          createNode('user', { position: { x: 180, y: 40 }, label: 'User' }),
          createNode('gateway', { position: { x: 160, y: 140 }, label: 'API Gateway' }),
          createNode('auth', { position: { x: 165, y: 250 }, label: 'Authenticated?' }),
          createNode('app', { position: { x: 60, y: 390 }, label: 'Dashboard' }),
          createNode('login', { position: { x: 280, y: 390 }, label: 'Login' }),
        ],
        edges: [
          {
            ...createEdge('e1', 'user', 'gateway'),
            data: { routingMode: 'import-fixed', importRoutePath: 'M 240 92 C 240 110, 240 126, 240 140' },
          } as FlowEdge,
          createEdge('e2', 'gateway', 'auth'),
          createEdge('e3', 'auth', 'app'),
          createEdge('e4', 'auth', 'login'),
        ],
        matchedLeafNodeCount: 5,
        totalLeafNodeCount: 5,
        matchedSectionCount: 0,
        totalSectionCount: 0,
        matchedEdgeGeometryCount: 1,
        totalEdgeCount: 4,
        reason: 'matched 1/4 official flowchart edge routes',
      });
    },
    assertResult(result): void {
      expect(result.layoutMode).toBe('mermaid_preserved_partial');
      expect(result.svgExtracted).toBe(true);
      expect(result.layoutFallbackReason).toContain('matched 1/4 official flowchart edge routes');
      expect(getElkLayout).not.toHaveBeenCalled();
    },
  },
  {
    fixtureName: 'flowchart-subgraph-explicit-id',
    setupMocks(): void {
      vi.mocked(buildOfficialFlowchartImportGraph).mockResolvedValueOnce({
        nodes: [
          createNode('A', { position: { x: 90, y: 110 }, label: 'A' }),
          createNode('B', { position: { x: 90, y: 210 }, label: 'B' }),
        ],
        edges: [createEdge('e1', 'A', 'B')],
        matchedLeafNodeCount: 2,
        totalLeafNodeCount: 2,
        matchedSectionCount: 0,
        totalSectionCount: 1,
        matchedEdgeGeometryCount: 1,
        totalEdgeCount: 1,
        reason: 'matched 0/1 official flowchart sections',
      });
    },
    assertResult(result): void {
      expect(result.layoutMode).toBe('mermaid_partial');
      expect(result.layoutFallbackReason).toContain('matched 0/1 official flowchart sections');
      expect(result.svgExtracted).toBe(true);
      expect(getElkLayout).not.toHaveBeenCalled();
      expect(extractMermaidLayout).not.toHaveBeenCalled();
    },
  },
  {
    fixtureName: 'flowchart-modern-annotation-dotted-ids',
    setupMocks(): void {
      vi.mocked(buildOfficialFlowchartImportGraph).mockResolvedValueOnce(null);
      vi.mocked(extractMermaidLayout).mockResolvedValueOnce(null);
    },
    assertResult(result): void {
      expect(result.layoutMode).toBe('elk_fallback');
      expect(result.layoutFallbackReason).toContain('Mermaid SVG extraction unavailable');
      expect(result.svgExtracted).toBeUndefined();
      expect(getElkLayout).toHaveBeenCalled();
    },
  },
];

describe('flowchart import outcome corpus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps representative flowchart imports in the correct layout outcome bucket', async () => {
    for (const testCase of FLOWCHART_OUTCOME_CASES) {
      const source = getFixtureSource(testCase.fixtureName);
      const parsed = parseMermaidByType(source);

      expect(parsed.diagramType, testCase.fixtureName).toBe('flowchart');
      expect(parsed.importState, testCase.fixtureName).toBe('editable_full');

      testCase.setupMocks(parsed);
      const result = await composeDiagramForDisplay(parsed.nodes, parsed.edges, {
        direction: parsed.direction ?? 'TB',
        spacing: 'compact',
        diagramType: parsed.diagramType,
        source: 'import',
        mermaidSource: source,
      });

      testCase.assertResult(result);
      vi.clearAllMocks();
    }
  });
});

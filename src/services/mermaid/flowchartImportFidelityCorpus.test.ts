import { beforeEach, describe, expect, it, vi } from 'vitest';
import { composeDiagramForDisplay } from '@/services/composeDiagramForDisplay';
import { parseMermaidByType } from './parseMermaidByType';
import {
  readMermaidImportedEdgeMetadata,
  readMermaidImportedNodeMetadata,
} from './importProvenance';
import { extractRawMermaidGeometry } from './extractLayoutFromSvg';
import { MERMAID_COMPAT_FIXTURES } from '../../../scripts/mermaid-compat-fixtures.mjs';
import type { FlowNode } from '@/lib/types';

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

interface MermaidFixtureRecord {
  name: string;
  source: string;
}

interface FlowchartFidelityCase {
  fixtureName: string;
  officialDb: {
    edges: Array<{ start: string; end: string; text?: string; id?: string }>;
    subGraphs: Array<{ id: string; nodes: string[]; title?: string }>;
    vertices: Record<string, { text?: string }>;
  };
  rawGeometry: Awaited<ReturnType<typeof extractRawMermaidGeometry>>;
  assert(result: Awaited<ReturnType<typeof composeDiagramForDisplay>>): void;
}

function getFixtureSource(name: string): string {
  const fixture = (MERMAID_COMPAT_FIXTURES as MermaidFixtureRecord[]).find(
    (candidate) => candidate.name === name
  );
  expect(fixture, `missing fixture "${name}"`).toBeDefined();
  return fixture!.source;
}

function findNodeByLabel(
  nodes: FlowNode[],
  label: string
): FlowNode | undefined {
  return nodes.find((node) => String(node.data?.label ?? '').includes(label));
}

const FLOWCHART_FIDELITY_CASES: FlowchartFidelityCase[] = [
  {
    fixtureName: 'flowchart-basic',
    officialDb: {
      edges: [{ start: 'A', end: 'B', id: 'L_A_B_0' }],
      subGraphs: [],
      vertices: {
        A: { text: 'Start' },
        B: { text: 'End' },
      },
    },
    rawGeometry: {
      nodes: [
        { rawId: 'A', label: 'Start', x: 40, y: 40, width: 120, height: 54 },
        { rawId: 'B', label: 'End', x: 40, y: 180, width: 120, height: 54 },
      ],
      clusters: [],
      edges: [
        {
          path: 'M 100 94 C 100 120, 100 146, 100 180',
          points: [{ x: 100, y: 94 }, { x: 100, y: 140 }, { x: 100, y: 180 }],
        },
      ],
    },
    assert(result): void {
      expect(result.layoutMode).toBe('mermaid_exact');
      expect(result.svgExtracted).toBe(true);

      const start = findNodeByLabel(result.nodes, 'Start');
      const end = findNodeByLabel(result.nodes, 'End');
      expect(start).toBeDefined();
      expect(end).toBeDefined();
      expect(start!.position.y).toBeLessThan(end!.position.y);
      expect(readMermaidImportedNodeMetadata(start!)).toEqual({
        role: 'leaf',
        source: 'official-flowchart',
        fidelity: 'renderer-backed',
      });
      expect(readMermaidImportedEdgeMetadata(result.edges[0])).toMatchObject({
        source: 'official-flowchart',
        fidelity: 'renderer-backed',
        hasFixedRoute: true,
      });
      expect(result.edges[0].data?.routingMode).toBe('import-fixed');
    },
  },
  {
    fixtureName: 'flowchart-subgraph-explicit-id',
    officialDb: {
      edges: [{ start: 'A', end: 'B', id: 'L_A_B_0' }],
      subGraphs: [{ id: 'api', nodes: ['A', 'B'], title: 'API Layer' }],
      vertices: {
        A: { text: 'Gateway' },
        B: { text: 'Service' },
      },
    },
    rawGeometry: {
      nodes: [
        { rawId: 'A', label: 'Gateway', x: 90, y: 110, width: 130, height: 52 },
        { rawId: 'B', label: 'Service', x: 90, y: 210, width: 130, height: 52 },
      ],
      clusters: [
        { rawId: 'api', label: 'API Layer', x: 40, y: 50, width: 260, height: 260 },
      ],
      edges: [
        {
          path: 'M 155 162 C 155 180, 155 196, 155 210',
          points: [{ x: 155, y: 162 }, { x: 155, y: 188 }, { x: 155, y: 210 }],
        },
      ],
    },
    assert(result): void {
      expect(result.layoutMode).toBe('mermaid_exact');

      const section = result.nodes.find((node) => node.id === 'api');
      const gateway = findNodeByLabel(result.nodes, 'Gateway');
      const service = findNodeByLabel(result.nodes, 'Service');

      expect(section?.type).toBe('section');
      expect(section?.style).toMatchObject({ width: 260, height: 260 });
      expect(readMermaidImportedNodeMetadata(section!)).toEqual({
        role: 'container',
        source: 'official-flowchart',
        fidelity: 'renderer-backed',
      });
      expect(gateway?.parentId).toBe('api');
      expect(service?.parentId).toBe('api');
      expect(gateway?.position.y).toBeLessThan(service!.position.y);
    },
  },
  {
    fixtureName: 'flowchart-nested-subgraphs',
    officialDb: {
      edges: [{ start: 'gateway', end: 'service', id: 'L_gateway_service_0' }],
      subGraphs: [
        { id: 'platform', nodes: ['api'], title: 'Platform' },
        { id: 'api', nodes: ['gateway', 'service'], title: 'API' },
      ],
      vertices: {
        gateway: { text: 'Gateway' },
        service: { text: 'Service' },
      },
    },
    rawGeometry: {
      nodes: [
        { rawId: 'gateway', label: 'Gateway', x: 120, y: 120, width: 120, height: 52 },
        { rawId: 'service', label: 'Service', x: 120, y: 220, width: 120, height: 52 },
      ],
      clusters: [
        { rawId: 'platform', label: 'Platform', x: 40, y: 40, width: 360, height: 320 },
        { rawId: 'api', label: 'API', x: 90, y: 90, width: 240, height: 220 },
      ],
      edges: [
        {
          path: 'M 180 172 C 180 190, 180 205, 180 220',
          points: [{ x: 180, y: 172 }, { x: 180, y: 198 }, { x: 180, y: 220 }],
        },
      ],
    },
    assert(result): void {
      expect(result.layoutMode).toBe('mermaid_exact');

      const platform = result.nodes.find((node) => node.id === 'platform');
      const api = result.nodes.find((node) => node.id === 'api');
      const gateway = result.nodes.find((node) => node.id === 'gateway');
      const service = result.nodes.find((node) => node.id === 'service');

      expect(platform?.data?.sectionSizingMode).toBe('manual');
      expect(platform?.style).toMatchObject({ width: 360, height: 320 });
      expect(readMermaidImportedNodeMetadata(platform!)).toEqual({
        role: 'container',
        source: 'official-flowchart',
        fidelity: 'renderer-backed',
      });
      expect(api?.parentId).toBe('platform');
      expect(api?.position).toEqual({ x: 50, y: 50 });
      expect(api?.data?.sectionSizingMode).toBe('manual');
      expect(gateway?.parentId).toBe('api');
      expect(gateway?.position).toEqual({ x: 30, y: 30 });
      expect(service?.parentId).toBe('api');
      expect(service?.position).toEqual({ x: 30, y: 130 });
      expect(gateway?.position.y).toBeLessThan(service!.position.y);
      expect(readMermaidImportedEdgeMetadata(result.edges[0])?.hasFixedRoute).toBe(true);
    },
  },
  {
    fixtureName: 'flowchart-auth-decision',
    officialDb: {
      edges: [
        { start: 'user', end: 'gateway', id: 'L_user_gateway_0' },
        { start: 'gateway', end: 'auth', id: 'L_gateway_auth_0' },
        { start: 'auth', end: 'app', text: 'Yes', id: 'L_auth_app_0' },
        { start: 'auth', end: 'login', text: 'No', id: 'L_auth_login_0' },
      ],
      subGraphs: [],
      vertices: {
        user: { text: 'User' },
        gateway: { text: 'API Gateway' },
        auth: { text: 'Authenticated?' },
        app: { text: 'Dashboard' },
        login: { text: 'Login' },
      },
    },
    rawGeometry: {
      nodes: [
        { rawId: 'user', label: 'User', x: 180, y: 40, width: 120, height: 52 },
        { rawId: 'gateway', label: 'API Gateway', x: 160, y: 140, width: 160, height: 52 },
        { rawId: 'auth', label: 'Authenticated?', x: 165, y: 250, width: 150, height: 70 },
        { rawId: 'app', label: 'Dashboard', x: 60, y: 390, width: 140, height: 52 },
        { rawId: 'login', label: 'Login', x: 280, y: 390, width: 120, height: 52 },
      ],
      clusters: [],
      edges: [
        {
          path: 'M 240 92 C 240 110, 240 126, 240 140',
          points: [{ x: 240, y: 92 }, { x: 240, y: 118 }, { x: 240, y: 140 }],
        },
        {
          path: 'M 240 192 C 240 210, 240 230, 240 250',
          points: [{ x: 240, y: 192 }, { x: 240, y: 220 }, { x: 240, y: 250 }],
        },
        {
          path: 'M 165 285 C 130 320, 110 350, 130 390',
          points: [{ x: 165, y: 285 }, { x: 120, y: 340 }, { x: 130, y: 390 }],
        },
        {
          path: 'M 315 285 C 350 320, 350 350, 340 390',
          points: [{ x: 315, y: 285 }, { x: 355, y: 338 }, { x: 340, y: 390 }],
        },
      ],
    },
    assert(result): void {
      expect(result.layoutMode).toBe('mermaid_exact');
      expect(result.edges).toHaveLength(4);
      expect(result.edges.every((edge) => edge.data?.routingMode === 'import-fixed')).toBe(true);

      const auth = result.nodes.find((node) => node.id === 'auth');
      const app = result.nodes.find((node) => node.id === 'app');
      const login = result.nodes.find((node) => node.id === 'login');
      expect(auth).toBeDefined();
      expect(app).toBeDefined();
      expect(login).toBeDefined();
      expect(auth!.position.y).toBeLessThan(app!.position.y);
      expect(auth!.position.y).toBeLessThan(login!.position.y);
      expect(app!.position.x).toBeLessThan(login!.position.x);
      expect(result.edges.map((edge) => edge.label)).toEqual([undefined, undefined, 'Yes', 'No']);
    },
  },
  {
    fixtureName: 'flowchart-modern-annotation-dotted-ids',
    officialDb: {
      edges: [{ start: 'api.gateway', end: 'db.primary', id: 'L_gateway_db_0' }],
      subGraphs: [],
      vertices: {
        'api.gateway': { text: 'API Gateway' },
        'db.primary': { text: 'Primary DB' },
      },
    },
    rawGeometry: {
      nodes: [
        { rawId: 'flowchart-api.gateway-0', label: 'API Gateway', x: 40, y: 80, width: 160, height: 52 },
        { rawId: 'flowchart-db.primary-0', label: 'Primary DB', x: 280, y: 80, width: 150, height: 52 },
      ],
      clusters: [],
      edges: [
        {
          path: 'M 200 106 C 230 106, 250 106, 280 106',
          points: [{ x: 200, y: 106 }, { x: 240, y: 106 }, { x: 280, y: 106 }],
        },
      ],
    },
    assert(result): void {
      expect(result.layoutMode).toBe('mermaid_exact');
      expect(result.nodes.map((node) => node.id)).toEqual(
        expect.arrayContaining(['api.gateway', 'db.primary'])
      );

      const api = result.nodes.find((node) => node.id === 'api.gateway');
      const db = result.nodes.find((node) => node.id === 'db.primary');
      expect(api?.position.x).toBeLessThan(db!.position.x);
      expect(readMermaidImportedNodeMetadata(api!)).toEqual({
        role: 'leaf',
        source: 'official-flowchart',
        fidelity: 'renderer-backed',
      });
      expect(readMermaidImportedEdgeMetadata(result.edges[0])?.hasFixedRoute).toBe(true);
      expect(result.edges[0]).toMatchObject({
        source: 'api.gateway',
        target: 'db.primary',
      });
    },
  },
];

describe('flowchart import fidelity corpus', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const casesBySource = new Map(
      FLOWCHART_FIDELITY_CASES.map((testCase) => [getFixtureSource(testCase.fixtureName), testCase])
    );

    getDiagramFromTextMock.mockImplementation(async (source: string) => {
      const testCase = casesBySource.get(source);
      if (!testCase) {
        throw new Error(`Unexpected Mermaid source in fidelity corpus: ${source}`);
      }

      return {
        getType: () => 'flowchart-v2',
        db: testCase.officialDb,
      };
    });

    vi.mocked(extractRawMermaidGeometry).mockImplementation(async (source: string) => {
      const testCase = casesBySource.get(source);
      return testCase?.rawGeometry ?? null;
    });
  });

  it('keeps representative flowchart imports on the renderer-backed exact path', async () => {
    for (const testCase of FLOWCHART_FIDELITY_CASES) {
      const source = getFixtureSource(testCase.fixtureName);
      const parsed = parseMermaidByType(source);

      expect(parsed.diagramType, testCase.fixtureName).toBe('flowchart');
      expect(parsed.importState, testCase.fixtureName).toBe('editable_full');

      const result = await composeDiagramForDisplay(parsed.nodes, parsed.edges, {
        direction: parsed.direction ?? 'TB',
        spacing: 'compact',
        diagramType: parsed.diagramType,
        source: 'import',
        mermaidSource: source,
      });

      testCase.assert(result);
    }
  });
});

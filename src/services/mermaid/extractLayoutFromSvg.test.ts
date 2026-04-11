import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlowNode } from '@/lib/types';
import { extractMermaidLayout, parseSvgPathPoints } from './extractLayoutFromSvg';

const renderMock = vi.fn();
const registerLayoutLoadersMock = vi.fn();

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    registerLayoutLoaders: registerLayoutLoadersMock,
    render: renderMock,
  },
}));

function createNode(
  id: string,
  options: Partial<FlowNode> & { label?: string } = {}
): FlowNode {
  const { label, data, ...rest } = options;
  return {
    id,
    type: 'process',
    position: { x: 0, y: 0 },
    ...rest,
    data: {
      label: label ?? id,
      ...(data ?? {}),
    },
  } as FlowNode;
}

describe('parseSvgPathPoints', () => {
  it('handles mixed absolute and relative commands', () => {
    expect(parseSvgPathPoints('M 0 0 L 10 0 l 5 5 H 30 v 10 C 40 20, 50 30, 60 40')).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 15, y: 5 },
      { x: 30, y: 5 },
      { x: 30, y: 15 },
      { x: 60, y: 40 },
    ]);
  });
});

describe('extractMermaidLayout', () => {
  beforeEach(() => {
    renderMock.mockReset();
    document.body.innerHTML = '';
  });

  it('reconciles dotted ids, section labels, and edge geometry from Mermaid SVG', async () => {
    renderMock.mockResolvedValue({
      svg: `
        <svg xmlns="http://www.w3.org/2000/svg">
          <g class="cluster" id="cluster_Payments">
            <rect x="-20" y="-10" width="260" height="160"></rect>
            <text>Payments</text>
          </g>
          <g class="node" id="flowchart-api.gateway-0" transform="translate(70,60)">
            <rect x="-60" y="-26" width="120" height="52"></rect>
            <text>API Gateway</text>
          </g>
          <g class="node" id="flowchart-worker-0" transform="translate(220,60)">
            <rect x="-60" y="-26" width="120" height="52"></rect>
            <text>Worker</text>
          </g>
          <g class="edgePath">
            <path class="path" d="M 130 60 C 160 60, 190 60, 220 60"></path>
          </g>
        </svg>
      `,
    });

    const layout = await extractMermaidLayout(
      'flowchart LR\nsubgraph Payments\napi.gateway[API Gateway]\nworker[Worker]\nend\napi.gateway-->worker',
      [
        createNode('payments', { type: 'section', label: 'Payments' }),
        createNode('api.gateway', { label: 'API Gateway', parentId: 'payments' }),
        createNode('worker', { label: 'Worker', parentId: 'payments' }),
      ]
    );

    expect(layout).not.toBeNull();
    expect(layout?.matchedLeafNodeCount).toBe(2);
    expect(layout?.matchedSectionCount).toBe(1);
    expect(layout?.nodes.map((node) => node.id)).toEqual(['api.gateway', 'worker']);
    expect(layout?.clusters.map((cluster) => cluster.id)).toEqual(['payments']);
    expect(layout?.nodes.every((node) => node.x >= 40 && node.y >= 40)).toBe(true);
    expect(layout?.clusters.every((cluster) => cluster.x >= 40 && cluster.y >= 40)).toBe(true);
    expect(layout?.edges).toHaveLength(1);
    expect(layout?.edges[0]).toMatchObject({
      source: 'api.gateway',
      target: 'worker',
      path: expect.stringContaining('M'),
    });
    expect(Math.min(...(layout?.edges[0].points ?? []).map((point) => point.x))).toBeGreaterThanOrEqual(40);
  });

  it('reconciles edges that terminate on Mermaid clusters', async () => {
    renderMock.mockResolvedValue({
      svg: `
        <svg xmlns="http://www.w3.org/2000/svg">
          <g class="cluster" id="cluster_LiveLayer">
            <rect x="240" y="20" width="200" height="160"></rect>
            <text>Live Layer</text>
          </g>
          <g class="node" id="flowchart-api-0" transform="translate(90,100)">
            <rect x="-50" y="-26" width="100" height="52"></rect>
            <text>API</text>
          </g>
          <g class="node" id="flowchart-lgw-0" transform="translate(330,90)">
            <rect x="-50" y="-26" width="100" height="52"></rect>
            <text>liveGateway</text>
          </g>
          <g class="edgePath">
            <path class="path" d="M 140 100 C 190 100, 220 100, 240 100"></path>
          </g>
          <g class="edgePath">
            <path class="path" d="M 140 88 C 180 80, 240 70, 280 64"></path>
          </g>
        </svg>
      `,
    });

    const layout = await extractMermaidLayout(
      'flowchart LR\nAPI-->LiveLayer',
      [
        createNode('api', { label: 'API' }),
        createNode('LiveLayer', { type: 'section', label: 'Live Layer' }),
        createNode('LGW', { label: 'liveGateway', parentId: 'LiveLayer' }),
      ]
    );

    expect(layout).not.toBeNull();
    expect(layout?.matchedLeafNodeCount).toBe(2);
    expect(layout?.matchedSectionCount).toBe(1);
    expect(layout?.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: 'api',
          target: 'LiveLayer',
        }),
      ])
    );
  });

  it('matches clusters by descendant containment when Mermaid emits anonymous subgraph ids', async () => {
    renderMock.mockResolvedValue({
      svg: `
        <svg xmlns="http://www.w3.org/2000/svg">
          <g class="cluster" id="subGraph0">
            <rect x="0" y="0" width="260" height="180"></rect>
            <text>Rendered Title</text>
          </g>
          <g class="node" id="flowchart-api-0" transform="translate(90,60)">
            <rect x="-50" y="-26" width="100" height="52"></rect>
            <text>API</text>
          </g>
          <g class="node" id="flowchart-worker-0" transform="translate(90,130)">
            <rect x="-50" y="-26" width="100" height="52"></rect>
            <text>Worker</text>
          </g>
        </svg>
      `,
    });

    const layout = await extractMermaidLayout(
      'flowchart TD\nsubgraph Payments Team\napi[API]\nworker[Worker]\nend',
      [
        createNode('payments-team', { type: 'section', label: 'Payments Team' }),
        createNode('api', { label: 'API', parentId: 'payments-team' }),
        createNode('worker', { label: 'Worker', parentId: 'payments-team' }),
      ]
    );

    expect(layout?.matchedSectionCount).toBe(1);
    expect(layout?.clusters[0]?.id).toBe('payments-team');
  });
});

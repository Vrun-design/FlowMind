import { describe, expect, it } from 'vitest';
import type { FlowNode } from '@/lib/types';
import { projectMermaidImportScene } from './importSceneProjection';
import {
  readMermaidImportedEdgeMetadata,
  readMermaidImportedNodeMetadata,
} from './importProvenance';

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

describe('projectMermaidImportScene', () => {
  it('projects imported containers and fixed-route edges into editable canvas primitives', () => {
    const result = projectMermaidImportScene({
      nodes: [
        {
          id: 'payments',
          kind: 'container',
          label: 'Payments',
          position: { x: 20, y: 20 },
          width: 300,
          height: 180,
        },
        {
          id: 'api',
          kind: 'leaf',
          label: 'API',
          parentId: 'payments',
          position: { x: 40, y: 60 },
          width: 120,
          height: 52,
          sourceNode: createNode('api', {
            label: 'API',
            parentId: 'legacy-parent',
            data: {
              label: 'API',
              subLabel: 'legacy subtitle',
              color: 'violet',
              icon: 'database',
              assetPresentation: 'icon',
              archIconPackId: 'aws-official-starter-v1',
              archIconShapeId: 'compute-lambda',
            },
          }),
        },
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'api',
          target: 'payments',
          label: 'calls',
          routePath: 'M 160 86 C 200 86, 250 86, 320 86',
          routePoints: [{ x: 160, y: 86 }, { x: 250, y: 86 }, { x: 320, y: 86 }],
        },
      ],
    });

    expect(result.nodes.find((node) => node.id === 'payments')?.data?.sectionSizingMode).toBe('manual');
    expect(result.nodes.find((node) => node.id === 'payments')?.style).toMatchObject({
      width: 300,
      height: 180,
    });
    expect(result.nodes.find((node) => node.id === 'payments')?.zIndex).toBe(-1);
    expect(readMermaidImportedNodeMetadata(result.nodes.find((node) => node.id === 'payments')!)).toEqual({
      role: 'container',
      source: 'official-flowchart',
      fidelity: 'renderer-backed',
    });
    expect(result.nodes.find((node) => node.id === 'api')?.parentId).toBe('payments');
    expect(result.nodes.find((node) => node.id === 'api')?.position).toEqual({ x: 20, y: 40 });
    expect(result.nodes.find((node) => node.id === 'payments')?.data).toMatchObject({
      label: 'Payments',
      subLabel: '',
      color: 'slate',
      colorMode: 'subtle',
      sectionSizingMode: 'manual',
    });
    expect(result.nodes.find((node) => node.id === 'api')?.data).toMatchObject({
      label: 'API',
      subLabel: '',
      color: 'white',
      colorMode: 'subtle',
      icon: undefined,
      assetPresentation: undefined,
      archIconPackId: undefined,
      archIconShapeId: undefined,
    });
    expect(readMermaidImportedNodeMetadata(result.nodes.find((node) => node.id === 'api')!)).toEqual({
      role: 'leaf',
      source: 'official-flowchart',
      fidelity: 'renderer-backed',
    });
    expect(result.edges[0].data?.routingMode).toBe('import-fixed');
    expect(result.edges[0].data?.importRoutePath).toContain('M 160 86');
    expect(result.edges[0].sourceHandle).toBe('right');
    expect(result.edges[0].targetHandle).toBe('left');
    expect(readMermaidImportedEdgeMetadata(result.edges[0])).toEqual({
      source: 'official-flowchart',
      fidelity: 'renderer-backed',
      hasFixedRoute: true,
      preferredSourceHandle: 'right',
      preferredTargetHandle: 'left',
    });
  });

  it('converts nested Mermaid import positions from absolute scene space to parent-relative canvas space', () => {
    const result = projectMermaidImportScene({
      nodes: [
        {
          id: 'platform',
          kind: 'container',
          label: 'Platform',
          position: { x: 40, y: 40 },
          width: 360,
          height: 320,
        },
        {
          id: 'api',
          kind: 'container',
          label: 'API',
          parentId: 'platform',
          position: { x: 90, y: 90 },
          width: 240,
          height: 220,
        },
        {
          id: 'gateway',
          kind: 'leaf',
          label: 'Gateway',
          parentId: 'api',
          position: { x: 120, y: 120 },
          width: 120,
          height: 52,
        },
      ],
      edges: [],
    });

    expect(result.nodes.find((node) => node.id === 'platform')?.position).toEqual({ x: 40, y: 40 });
    expect(result.nodes.find((node) => node.id === 'api')?.position).toEqual({ x: 50, y: 50 });
    expect(result.nodes.find((node) => node.id === 'gateway')?.position).toEqual({ x: 30, y: 30 });
  });

  it('orders imported parent containers before their children for React Flow projection', () => {
    const result = projectMermaidImportScene({
      nodes: [
        {
          id: 'gateway',
          kind: 'leaf',
          label: 'Gateway',
          parentId: 'api',
          position: { x: 120, y: 120 },
          width: 120,
          height: 52,
        },
        {
          id: 'api',
          kind: 'container',
          label: 'API',
          parentId: 'platform',
          position: { x: 90, y: 90 },
          width: 240,
          height: 220,
        },
        {
          id: 'platform',
          kind: 'container',
          label: 'Platform',
          position: { x: 40, y: 40 },
          width: 360,
          height: 320,
        },
      ],
      edges: [],
    });

    expect(result.nodes.map((node) => node.id)).toEqual(['platform', 'api', 'gateway']);
  });
});

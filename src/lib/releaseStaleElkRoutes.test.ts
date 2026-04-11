import { describe, expect, it } from 'vitest';
import type { FlowEdge } from '@/lib/types';
import { releaseStaleElkRoutesForNodeIds } from './releaseStaleElkRoutes';
import { readMermaidImportedEdgeMetadata } from '@/services/mermaid/importProvenance';

function createEdge(overrides: Partial<FlowEdge> = {}): FlowEdge {
  return {
    id: 'edge-1',
    source: 'a',
    target: 'b',
    data: {},
    ...overrides,
  } as FlowEdge;
}

describe('releaseStaleElkRoutesForNodeIds', () => {
  it('releases elk-routed edges connected to moved nodes back to auto mode', () => {
    const edges = [
      createEdge({
        data: {
          routingMode: 'elk',
          elkPoints: [{ x: 10, y: 10 }],
        },
      }),
    ];

    const result = releaseStaleElkRoutesForNodeIds(edges, new Set(['a']));

    expect(result).not.toBe(edges);
    expect(result[0].data?.routingMode).toBe('auto');
    expect(result[0].data?.elkPoints).toBeUndefined();
  });

  it('releases Mermaid import-fixed routes when a connected node moves', () => {
    const edges = [
      createEdge({
        sourceHandle: 'right',
        targetHandle: 'left',
        data: {
          routingMode: 'import-fixed',
          importRoutePoints: [{ x: 10, y: 10 }, { x: 40, y: 40 }],
          importRoutePath: 'M 10 10 L 40 40',
          _mermaidImportedEdge: {
            source: 'official-flowchart',
            fidelity: 'renderer-backed',
            hasFixedRoute: true,
          },
        },
      }),
    ];

    const result = releaseStaleElkRoutesForNodeIds(edges, new Set(['a']));

    expect(result).not.toBe(edges);
    expect(result[0].data?.routingMode).toBe('auto');
    expect(result[0].data?.importRoutePoints).toBeUndefined();
    expect(result[0].data?.importRoutePath).toBeUndefined();
    expect(readMermaidImportedEdgeMetadata(result[0])).toEqual({
      source: 'official-flowchart',
      fidelity: 'renderer-backed',
      hasFixedRoute: false,
      preferredSourceHandle: 'right',
      preferredTargetHandle: 'left',
    });
  });

  it('preserves manual routes even when a connected node moves', () => {
    const edges = [
      createEdge({
        data: {
          routingMode: 'manual',
          elkPoints: [{ x: 10, y: 10 }],
          waypoints: [{ x: 20, y: 20 }],
        },
      }),
    ];

    const result = releaseStaleElkRoutesForNodeIds(edges, new Set(['a']));

    expect(result).toBe(edges);
  });

  it('does nothing when no connected nodes moved', () => {
    const edges = [
      createEdge({
        data: {
          routingMode: 'elk',
          elkPoints: [{ x: 10, y: 10 }],
        },
      }),
    ];

    const result = releaseStaleElkRoutesForNodeIds(edges, new Set(['z']));

    expect(result).toBe(edges);
  });
});

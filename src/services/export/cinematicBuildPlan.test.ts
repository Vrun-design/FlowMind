import { describe, expect, it } from 'vitest';
import type { FlowEdge, FlowNode } from '@/lib/types';
import { buildCinematicBuildPlan } from './cinematicBuildPlan';

function createNode(id: string, x: number, y: number): FlowNode {
  return {
    id,
    type: 'process',
    position: { x, y },
    data: { label: id },
  } as FlowNode;
}

function createEdge(id: string, source: string, target: string): FlowEdge {
  return {
    id,
    source,
    target,
  } as FlowEdge;
}

describe('buildCinematicBuildPlan', () => {
  it('builds the expected linear sequence for a simple chain', () => {
    const nodes = [
      createNode('a', 0, 0),
      createNode('b', 200, 0),
      createNode('c', 400, 0),
      createNode('d', 600, 0),
    ];
    const edges = [
      createEdge('ab', 'a', 'b'),
      createEdge('bc', 'b', 'c'),
      createEdge('cd', 'c', 'd'),
    ];

    const plan = buildCinematicBuildPlan(nodes, edges);

    expect(plan.orderedNodeIds).toEqual(['a', 'b', 'c', 'd']);
    expect(plan.segments.map((segment) => [segment.sourceNodeId, segment.leadEdgeId, segment.targetNodeId])).toEqual([
      [null, null, 'a'],
      ['a', 'ab', 'b'],
      ['b', 'bc', 'c'],
      ['c', 'cd', 'd'],
    ]);
  });

  it('falls back safely for cyclic graphs', () => {
    const nodes = [
      createNode('a', 0, 0),
      createNode('b', 200, 0),
      createNode('c', 400, 0),
    ];
    const edges = [
      createEdge('ab', 'a', 'b'),
      createEdge('bc', 'b', 'c'),
      createEdge('ca', 'c', 'a'),
    ];

    const plan = buildCinematicBuildPlan(nodes, edges);

    expect(plan.hasTopologyFallback).toBe(true);
    expect(plan.orderedNodeIds).toEqual(['a', 'b', 'c']);
  });
});

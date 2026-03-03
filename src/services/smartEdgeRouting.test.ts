import { describe, expect, it } from 'vitest';
import type { Edge, Node } from 'reactflow';
import { assignSmartHandles } from './smartEdgeRouting';

function createNode(id: string, x: number, y: number): Node {
  return {
    id,
    type: 'process',
    position: { x, y },
    data: { label: id },
  } as Node;
}

function createEdge(id: string, source: string, target: string): Edge {
  return { id, source, target } as Edge;
}

describe('assignSmartHandles', () => {
  it('keeps sibling ordering deterministic for same-direction edges', () => {
    const nodes = [createNode('a', 0, 0), createNode('b', 300, 0)];
    const edges = [
      createEdge('e1', 'a', 'b'),
      createEdge('e2', 'a', 'b'),
      createEdge('e3', 'a', 'b'),
    ];

    const routed = assignSmartHandles(nodes, edges);

    expect(routed[0].sourceHandle).toBe('right');
    expect(routed[0].targetHandle).toBe('left');
    expect(routed[1].sourceHandle).toBe('bottom');
    expect(routed[1].targetHandle).toBe('bottom');
    expect(routed[2].sourceHandle).toBe('right');
    expect(routed[2].targetHandle).toBe('left');
  });

  it('keeps bidirectional pairing behavior', () => {
    const nodes = [createNode('a', 0, 0), createNode('b', 0, 300)];
    const edges = [
      createEdge('e-forward', 'a', 'b'),
      createEdge('e-reverse', 'b', 'a'),
    ];

    const routed = assignSmartHandles(nodes, edges);
    const forward = routed.find((edge) => edge.id === 'e-forward');
    const reverse = routed.find((edge) => edge.id === 'e-reverse');

    expect(forward?.sourceHandle).toBe('bottom');
    expect(forward?.targetHandle).toBe('top');
    expect(reverse?.sourceHandle).toBe('right');
    expect(reverse?.targetHandle).toBe('right');
  });

  it('invalidates cached routing context when node mutation epoch changes', () => {
    const edges = [createEdge('e1', 'a', 'b')];

    const nodesHorizontal = [createNode('a', 0, 0), createNode('b', 300, 0)];
    const routedHorizontal = assignSmartHandles(nodesHorizontal, edges);
    expect(routedHorizontal[0].sourceHandle).toBe('right');
    expect(routedHorizontal[0].targetHandle).toBe('left');

    const nodesVertical = [createNode('a', 0, 0), createNode('b', 0, 300)];
    const routedVertical = assignSmartHandles(nodesVertical, edges);
    expect(routedVertical[0].sourceHandle).toBe('bottom');
    expect(routedVertical[0].targetHandle).toBe('top');
  });

  it('invalidates cached routing context when edge mutation epoch changes', () => {
    const nodes = [createNode('a', 0, 0), createNode('b', 300, 0)];
    const oneEdge = [createEdge('e1', 'a', 'b')];
    const twoEdges = [createEdge('e1', 'a', 'b'), createEdge('e2', 'a', 'b')];

    const routedOne = assignSmartHandles(nodes, oneEdge);
    expect(routedOne[0].sourceHandle).toBe('right');
    expect(routedOne[0].targetHandle).toBe('left');

    const routedTwo = assignSmartHandles(nodes, twoEdges);
    expect(routedTwo[0].sourceHandle).toBe('right');
    expect(routedTwo[0].targetHandle).toBe('left');
    expect(routedTwo[1].sourceHandle).toBe('bottom');
    expect(routedTwo[1].targetHandle).toBe('bottom');
  });

  it('preserves edge label placement metadata during reroute updates', () => {
    const nodes = [createNode('a', 0, 0), createNode('b', 0, 300)];
    const edge = {
      ...createEdge('e-label', 'a', 'b'),
      sourceHandle: 'right',
      targetHandle: 'left',
      label: 'HTTP',
      data: {
        labelPosition: 0.72,
        labelOffsetX: 6,
        labelOffsetY: -4,
      },
    } as Edge;

    const routed = assignSmartHandles(nodes, [edge]);

    expect(routed[0]).not.toBe(edge);
    expect(routed[0].sourceHandle).toBe('bottom');
    expect(routed[0].targetHandle).toBe('top');
    expect(routed[0].label).toBe('HTTP');
    expect(routed[0].data?.labelPosition).toBe(0.72);
    expect(routed[0].data?.labelOffsetX).toBe(6);
    expect(routed[0].data?.labelOffsetY).toBe(-4);
  });
});

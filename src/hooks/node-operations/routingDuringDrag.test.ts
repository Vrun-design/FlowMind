import { describe, expect, it } from 'vitest';
import type { Edge, Node } from 'reactflow';
import { rerouteConnectedEdgesDuringDrag } from './routingDuringDrag';

function createNode(id: string, x: number, y: number): Node {
  return {
    id,
    type: 'process',
    position: { x, y },
    data: { label: id },
  } as Node;
}

function createEdge(
  id: string,
  source: string,
  target: string,
  sourceHandle?: string,
  targetHandle?: string
): Edge {
  return {
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
  } as Edge;
}

describe('rerouteConnectedEdgesDuringDrag', () => {
  it('reroutes only edges connected to dragged nodes', () => {
    const nodes = [
      createNode('a', 0, 0),
      createNode('b', 200, 0),
      createNode('c', 500, 0),
    ];
    const edgeAB = createEdge('e-ab', 'a', 'b', 'right', 'left');
    const edgeBC = createEdge('e-bc', 'b', 'c', 'right', 'left');
    const edges = [edgeAB, edgeBC];
    const draggedNodes = [createNode('a', 200, 300)];

    const nextEdges = rerouteConnectedEdgesDuringDrag(nodes, edges, draggedNodes);

    expect(nextEdges).not.toBe(edges);
    expect(nextEdges[0]).not.toBe(edgeAB);
    expect(nextEdges[0].sourceHandle).toBe('top');
    expect(nextEdges[0].targetHandle).toBe('bottom');
    expect(nextEdges[1]).toBe(edgeBC);
  });

  it('returns original array when no edges are affected', () => {
    const nodes = [
      createNode('a', 0, 0),
      createNode('b', 200, 0),
      createNode('c', 500, 0),
    ];
    const edgeBC = createEdge('e-bc', 'b', 'c', 'right', 'left');
    const edges = [edgeBC];
    const draggedNodes = [createNode('a', 200, 300)];

    const nextEdges = rerouteConnectedEdgesDuringDrag(nodes, edges, draggedNodes);

    expect(nextEdges).toBe(edges);
    expect(nextEdges[0]).toBe(edgeBC);
  });
});

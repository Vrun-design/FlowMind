import { describe, expect, it } from 'vitest';
import type { Edge, Node } from 'reactflow';
import { getOpenFlowDSLExportDiagnostics, toOpenFlowDSL } from './openFlowDSLExporter';

function createNode(id: string, label: string, parentNode?: string): Node {
  return {
    id,
    type: 'process',
    position: { x: 0, y: 0 },
    data: { label },
    parentNode,
  } as Node;
}

function createEdge(id: string, source: string, target: string, label?: string): Edge {
  return { id, source, target, label } as Edge;
}

describe('toOpenFlowDSL', () => {
  it('exports deterministically for shuffled equivalent inputs', () => {
    const nodesA = [
      createNode('root-b', 'Root B'),
      createNode('child-a', 'Child A', 'root-a'),
      createNode('root-a', 'Root A'),
    ];
    const edgesA = [
      createEdge('e2', 'root-b', 'root-a'),
      createEdge('e1', 'root-a', 'root-b', 'rel'),
    ];

    const nodesB = [nodesA[2], nodesA[0], nodesA[1]];
    const edgesB = [edgesA[1], edgesA[0]];

    expect(toOpenFlowDSL(nodesA, edgesA)).toBe(toOpenFlowDSL(nodesB, edgesB));
  });

  it('supports legacy mode where input order is preserved', () => {
    const nodesA = [
      createNode('root-b', 'Root B'),
      createNode('root-a', 'Root A'),
    ];
    const edgesA = [
      createEdge('e2', 'root-b', 'root-a'),
      createEdge('e1', 'root-a', 'root-b'),
    ];

    const nodesB = [nodesA[1], nodesA[0]];
    const edgesB = [edgesA[1], edgesA[0]];

    expect(toOpenFlowDSL(nodesA, edgesA, { mode: 'legacy' })).not.toBe(
      toOpenFlowDSL(nodesB, edgesB, { mode: 'legacy' })
    );
  });

  it('reports diagnostics for dangling edges', () => {
    const diagnostics = getOpenFlowDSLExportDiagnostics(
      [createNode('n1', 'Start')],
      [createEdge('e1', 'n1', 'missing-node')]
    );
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain('missing target');
  });
});

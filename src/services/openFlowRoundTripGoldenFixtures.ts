import type { Edge, Node } from 'reactflow';

export interface OpenFlowRoundTripGoldenFixture {
  name: string;
  nodes: Node[];
  edges: Edge[];
}

function createNode(
  id: string,
  label: string,
  type: Node['type'] = 'process',
  parentId?: string
): Node {
  const defaultColorByType: Record<string, string | undefined> = {
    start: 'emerald',
    decision: 'amber',
    end: 'red',
  };

  return {
    id,
    type,
    position: { x: 0, y: 0 },
    data: {
      label,
      color: defaultColorByType[type ?? 'process'],
    },
    parentId,
  } as Node;
}

function createEdge(id: string, source: string, target: string, label?: string): Edge {
  return {
    id,
    source,
    target,
    label,
  } as Edge;
}

export const OPENFLOW_ROUND_TRIP_GOLDEN_FIXTURES: OpenFlowRoundTripGoldenFixture[] = [
  {
    name: 'simple-linear',
    nodes: [
      createNode('n2', 'Finish', 'end'),
      createNode('n1', 'Start', 'start'),
    ],
    edges: [createEdge('e1', 'n1', 'n2')],
  },
  {
    name: 'decision-branch',
    nodes: [
      createNode('n3', 'Approved', 'process'),
      createNode('n1', 'Review', 'decision'),
      createNode('n2', 'Rejected', 'process'),
    ],
    edges: [
      createEdge('e2', 'n1', 'n3', 'yes'),
      createEdge('e1', 'n1', 'n2', 'no'),
    ],
  },
  {
    name: 'branch-merge',
    nodes: [
      createNode('n4', 'Done', 'end'),
      createNode('n3', 'Merge', 'process'),
      createNode('n2', 'Retry', 'process'),
      createNode('n1', 'Check', 'decision'),
    ],
    edges: [
      createEdge('e3', 'n3', 'n4'),
      createEdge('e2', 'n2', 'n3', 'retry'),
      createEdge('e1', 'n1', 'n3', 'ok'),
    ],
  },
];

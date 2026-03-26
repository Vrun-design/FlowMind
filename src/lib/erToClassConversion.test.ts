import { describe, expect, it } from 'vitest';
import { convertSelectedErNodesToClassDiagram } from './erToClassConversion';
import type { FlowEdge, FlowNode } from './types';

function createNodes(): FlowNode[] {
  return [
    {
      id: 'user',
      type: 'er_entity',
      selected: true,
      position: { x: 0, y: 0 },
      data: {
        label: 'User',
        erFields: ['id: UUID PK', 'teamId: UUID FK', 'email: VARCHAR UNIQUE'],
      },
    },
    {
      id: 'team',
      type: 'er_entity',
      selected: true,
      position: { x: 300, y: 0 },
      data: {
        label: 'Team',
        erFields: ['id: UUID PK', 'name: VARCHAR'],
      },
    },
    {
      id: 'note',
      type: 'annotation',
      selected: false,
      position: { x: 0, y: 0 },
      data: { label: 'Keep me' },
    },
  ];
}

function createEdges(): FlowEdge[] {
  return [
    {
      id: 'edge-1',
      source: 'team',
      target: 'user',
      data: {
        erRelation: '||--o{',
        erRelationLabel: 'contains',
      },
    },
  ];
}

describe('convertSelectedErNodesToClassDiagram', () => {
  it('converts selected ER entities into class nodes and remaps their edges', () => {
    const result = convertSelectedErNodesToClassDiagram(createNodes(), createEdges());

    expect(result.changedNodeIds).toEqual(['user', 'team']);
    expect(result.changedEdgeIds).toEqual(['edge-1']);
    expect(result.nodes[0].type).toBe('class');
    expect(result.nodes[0].data.classAttributes).toContain('+ id: UUID {PK}');
    expect(result.nodes[0].data.classAttributes).toContain('+ teamId: UUID {FK}');
    expect(result.edges[0].data?.classRelation).toBe('-->');
    expect(result.edges[0].data?.classRelationLabel).toBe('contains (1 to 0..*)');
    expect(result.edges[0].data?.erRelation).toBeUndefined();
  });

  it('returns the original graph when no ER entity is selected', () => {
    const nodes = createNodes().map((node) => ({ ...node, selected: false }));
    const edges = createEdges();
    const result = convertSelectedErNodesToClassDiagram(nodes, edges);

    expect(result.changedNodeIds).toHaveLength(0);
    expect(result.nodes).toBe(nodes);
    expect(result.edges).toBe(edges);
  });
});

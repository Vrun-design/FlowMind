import { describe, expect, it } from 'vitest';
import type { Connection } from '@/lib/reactflowCompat';
import type { FlowEdge, FlowNode } from '@/lib/types';
import {
  buildSequenceMessageEdge,
  DEFAULT_SEQUENCE_MESSAGE_LABEL,
  getNextSequenceMessageOrder,
  isSequenceConnection,
  syncSequenceEdgeParticipantKinds,
} from './sequenceMessage';

function createParticipantNode(
  id: string,
  kind: 'participant' | 'actor' = 'participant'
): FlowNode {
  return {
    id,
    type: 'sequence_participant',
    position: { x: 0, y: 0 },
    data: {
      label: id,
      seqParticipantKind: kind,
    },
  } as FlowNode;
}

function createSequenceEdge(
  id: string,
  source: string,
  target: string,
  order: number,
  sourceIsActor = false,
  targetIsActor = false
): FlowEdge {
  return {
    id,
    source,
    target,
    type: 'sequence_message',
    label: 'Message',
    data: {
      seqMessageKind: 'sync',
      seqMessageOrder: order,
      sourceIsActor,
      targetIsActor,
    },
  } as FlowEdge;
}

describe('sequenceMessage helpers', () => {
  it('builds a default labeled sequence message with the next stable order', () => {
    const connection: Connection = {
      source: 'client',
      target: 'api',
      sourceHandle: null,
      targetHandle: null,
    };
    const existingEdges = [
      createSequenceEdge('e-1', 'a', 'b', 0),
      createSequenceEdge('e-2', 'b', 'c', 3),
    ];

    const edge = buildSequenceMessageEdge(
      connection,
      createParticipantNode('client', 'actor'),
      createParticipantNode('api'),
      existingEdges,
    );

    expect(edge.label).toBe(DEFAULT_SEQUENCE_MESSAGE_LABEL);
    expect(edge.data?.seqMessageOrder).toBe(4);
    expect(edge.data?.sourceIsActor).toBe(true);
    expect(edge.data?.targetIsActor).toBe(false);
    expect(edge.sourceHandle).toBe('top');
    expect(edge.targetHandle).toBe('top');
  });

  it('detects valid sequence participant connections only', () => {
    expect(isSequenceConnection(
      createParticipantNode('a'),
      createParticipantNode('b'),
      { source: 'a', target: 'b', sourceHandle: null, targetHandle: null },
    )).toBe(true);

    expect(isSequenceConnection(
      createParticipantNode('a'),
      { id: 'b', type: 'process', position: { x: 0, y: 0 }, data: { label: 'B' } } as FlowNode,
      { source: 'a', target: 'b', sourceHandle: null, targetHandle: null },
    )).toBe(false);
  });

  it('returns the next order after the highest existing sequence order', () => {
    expect(getNextSequenceMessageOrder([
      createSequenceEdge('e-1', 'a', 'b', 2),
      { id: 'other', source: 'x', target: 'y', type: 'default' } as FlowEdge,
      createSequenceEdge('e-2', 'b', 'c', 7),
    ])).toBe(8);
  });

  it('syncs edge actor flags when participant kinds change', () => {
    const nodes = [
      createParticipantNode('client', 'actor'),
      createParticipantNode('api', 'participant'),
    ];
    const edges = [
      createSequenceEdge('seq-1', 'client', 'api', 0, false, true),
    ];

    const nextEdges = syncSequenceEdgeParticipantKinds(nodes, edges);

    expect(nextEdges).not.toBe(edges);
    expect(nextEdges[0].data?.sourceIsActor).toBe(true);
    expect(nextEdges[0].data?.targetIsActor).toBe(false);
  });
});

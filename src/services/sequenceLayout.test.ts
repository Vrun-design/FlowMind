import { describe, expect, it } from 'vitest';
import type { FlowEdge, FlowNode } from '@/lib/types';
import { relayoutSequenceDiagram } from './sequenceLayout';

function createParticipant(
  id: string,
  x: number,
  kind: 'participant' | 'actor' = 'participant'
): FlowNode {
  return {
    id,
    type: 'sequence_participant',
    position: { x, y: 120 },
    data: {
      label: id,
      seqParticipantKind: kind,
    },
  } as FlowNode;
}

function createNote(id: string, target: string, order: number): FlowNode {
  return {
    id,
    type: 'sequence_note',
    position: { x: 0, y: 0 },
    data: {
      label: 'Shared context',
      seqNoteTarget: target,
      seqNotePosition: 'over',
      seqMessageOrder: order,
    },
  } as FlowNode;
}

function createFragment(id: string, order: number): FlowNode {
  return {
    id,
    type: 'annotation',
    position: { x: 0, y: 0 },
    data: {
      label: 'ALT',
      subLabel: 'happy path',
      seqFragmentId: id,
      seqMessageOrder: order,
    },
  } as FlowNode;
}

function createMessage(id: string, source: string, target: string, order: number): FlowEdge {
  return {
    id,
    source,
    target,
    type: 'sequence_message',
    data: {
      seqMessageOrder: order,
    },
  } as FlowEdge;
}

describe('relayoutSequenceDiagram', () => {
  it('repositions sequence participants into evenly spaced top lanes', () => {
    const nodes = [
      createParticipant('api', 240),
      createParticipant('client', 0, 'actor'),
      createParticipant('db', 480),
    ];

    const result = relayoutSequenceDiagram(nodes, []);
    const participants = result.nodes.filter((node) => node.type === 'sequence_participant');

    expect(participants.map((node) => node.position.y)).toEqual([0, 40, 40]);
    expect(participants[0].position.x).toBeLessThan(participants[1].position.x);
    expect(participants[1].position.x).toBeLessThan(participants[2].position.x);
  });

  it('keeps sequence notes and fragments aligned to message order timeline', () => {
    const nodes = [
      createParticipant('client', 0, 'actor'),
      createParticipant('api', 220),
      createNote('note-1', 'api', 2),
      createFragment('fragment-1', 1),
    ];
    const edges = [createMessage('e-1', 'client', 'api', 1)];

    const result = relayoutSequenceDiagram(nodes, edges);
    const note = result.nodes.find((node) => node.id === 'note-1');
    const fragment = result.nodes.find((node) => node.id === 'fragment-1');

    expect(note?.position.y).toBeGreaterThan(150);
    expect(fragment?.position.x).toBeLessThan(0);
    expect(result.edges).toBe(edges);
  });
});

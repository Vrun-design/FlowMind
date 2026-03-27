import { describe, expect, it } from 'vitest';
import { toMermaid } from './mermaidBuilder';
import type { FlowNode, FlowEdge } from '@/lib/types';
import { SEQUENCE_PLUGIN } from '@/diagram-types/sequence/plugin';

const node = (id: string, type: string, label: string, extra = {}): FlowNode =>
    ({ id, type, position: { x: 0, y: 0 }, data: { label, ...extra } } as FlowNode);
const edge = (id: string, source: string, target: string): FlowEdge =>
    ({ id, source, target } as FlowEdge);

describe('toMermaid', () => {
    it('flowchart — two process nodes with edge starts with flowchart TD and contains node IDs', () => {
        const result = toMermaid(
            [node('a', 'process', 'A'), node('b', 'process', 'B')],
            [edge('e1', 'a', 'b')]
        );
        expect(result).toMatch(/^flowchart TD/);
        expect(result).toContain('a');
        expect(result).toContain('b');
    });

    it('architecture — two architecture nodes starts with architecture-beta and contains service', () => {
        const result = toMermaid(
            [
                node('svc1', 'architecture', 'ServiceA', { archResourceType: 'service' }),
                node('svc2', 'architecture', 'ServiceB', { archResourceType: 'service' }),
            ],
            [edge('e1', 'svc1', 'svc2')]
        );
        expect(result).toMatch(/^architecture-beta/);
        expect(result).toContain('service');
    });

    it('mindmap — two mindmap nodes starts with mindmap', () => {
        const result = toMermaid(
            [
                node('root', 'mindmap', 'Root', { mindmapDepth: 0 }),
                node('child', 'mindmap', 'Topic', { mindmapDepth: 1 }),
            ],
            [edge('e1', 'root', 'child')]
        );
        expect(result).toMatch(/^mindmap/);
    });

    it('class diagram — two class nodes starts with classDiagram', () => {
        const result = toMermaid(
            [node('ClassA', 'class', 'ClassA'), node('ClassB', 'class', 'ClassB')],
            []
        );
        expect(result).toMatch(/^classDiagram/);
    });

    it('ER diagram — two entity nodes starts with erDiagram', () => {
        const result = toMermaid(
            [node('User', 'er_entity', 'User'), node('Order', 'er_entity', 'Order')],
            []
        );
        expect(result).toMatch(/^erDiagram/);
    });

    it('sequence diagram — participants and messages export to sequenceDiagram syntax', () => {
        const result = toMermaid(
            [
                { ...node('client', 'sequence_participant', 'Client', { seqParticipantKind: 'actor' }), position: { x: 0, y: 0 } },
                { ...node('api', 'sequence_participant', 'API', { seqParticipantKind: 'participant' }), position: { x: 220, y: 0 } },
            ],
            [
                {
                    id: 'seq-1',
                    source: 'client',
                    target: 'api',
                    type: 'sequence_message',
                    label: 'POST /checkout',
                    data: { seqMessageKind: 'sync', seqMessageOrder: 0 },
                } as FlowEdge,
                {
                    id: 'seq-2',
                    source: 'api',
                    target: 'client',
                    type: 'sequence_message',
                    label: '202 Accepted',
                    data: { seqMessageKind: 'return', seqMessageOrder: 1 },
                } as FlowEdge,
            ]
        );
        expect(result).toMatch(/^sequenceDiagram/);
        expect(result).toContain('actor client as Client');
        expect(result).toContain('participant api as API');
        expect(result).toContain('client->>api: POST /checkout');
        expect(result).toContain('api-->>client: 202 Accepted');
    });

    it('sequence diagram — exported Mermaid round-trips through the sequence parser', () => {
        const mermaid = toMermaid(
            [
                { ...node('client', 'sequence_participant', 'Client', { seqParticipantKind: 'actor' }), position: { x: 0, y: 0 } },
                { ...node('api', 'sequence_participant', 'API', { seqParticipantKind: 'participant' }), position: { x: 220, y: 0 } },
                { ...node('db', 'sequence_participant', 'Postgres', { seqParticipantKind: 'participant' }), position: { x: 440, y: 0 } },
            ],
            [
                {
                    id: 'seq-1',
                    source: 'client',
                    target: 'api',
                    type: 'sequence_message',
                    label: 'POST /checkout',
                    data: { seqMessageKind: 'sync', seqMessageOrder: 0 },
                } as FlowEdge,
                {
                    id: 'seq-2',
                    source: 'api',
                    target: 'db',
                    type: 'sequence_message',
                    label: 'insert order',
                    data: { seqMessageKind: 'async', seqMessageOrder: 1 },
                } as FlowEdge,
            ]
        );
        const parsed = SEQUENCE_PLUGIN.parseMermaid(mermaid);

        expect(parsed.error).toBeUndefined();
        expect(parsed.nodes.map((entry) => entry.data.label)).toEqual(['Client', 'API', 'Postgres']);
        expect(parsed.edges.map((entry) => entry.data?.seqMessageKind)).toEqual(['sync', 'async']);
    });

    it('empty — no nodes returns a string without throwing', () => {
        const result = toMermaid([], []);
        expect(typeof result).toBe('string');
    });

    it('node label sanitization — label with spaces is included in output', () => {
        const result = toMermaid(
            [node('n1', 'process', 'Hello World & More')],
            []
        );
        expect(result).toContain('Hello World');
    });
});

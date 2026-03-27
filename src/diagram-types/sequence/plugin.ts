import type { FlowEdge, FlowNode } from '@/lib/types';
import type { DiagramPlugin } from '@/diagram-types/core';

interface ParsedParticipant {
  id: string;
  label: string;
  kind: 'participant' | 'actor';
  alias?: string;
}

interface ParsedMessage {
  from: string;
  to: string;
  label: string;
  kind: 'sync' | 'async' | 'return' | 'self' | 'create' | 'destroy';
}

function resolveMessageKind(arrow: string): ParsedMessage['kind'] {
  if (arrow === '-->' || arrow === '-->>' || arrow === '-->>>' || arrow === '--x') return 'return';
  if (arrow === '-)' || arrow === '--)') return 'async';
  if (arrow === '-x') return 'destroy';
  return 'sync';
}

function parseSequence(input: string): { nodes: FlowNode[]; edges: FlowEdge[]; error?: string; diagnostics?: string[] } {
  const lines = input.replace(/\r\n/g, '\n').split('\n');
  const participants: ParsedParticipant[] = [];
  const messages: ParsedMessage[] = [];
  const knownIds = new Set<string>();
  const diagnostics: string[] = [];
  let hasHeader = false;

  function ensureParticipant(name: string): void {
    if (knownIds.has(name)) return;
    participants.push({ id: name, label: name, kind: 'participant' });
    knownIds.add(name);
  }

  for (const [index, rawLine] of lines.entries()) {
    const lineNumber = index + 1;
    const line = rawLine.trim();
    if (!line || line.startsWith('%%') || line.startsWith('note ') || line.startsWith('Note ')) continue;
    if (/^(loop|alt|else|opt|par|critical|break|rect|end)\b/i.test(line)) continue;
    if (/^(activate|deactivate)\b/i.test(line)) continue;
    if (/^title\b/i.test(line)) continue;
    if (/^autonumber\b/i.test(line)) continue;

    if (/^sequenceDiagram\b/i.test(line)) {
      hasHeader = true;
      continue;
    }
    if (!hasHeader) continue;

    const participantMatch = line.match(/^(participant|actor)\s+(.+?)(?:\s+as\s+(.+))?$/i);
    if (participantMatch) {
      const kind = participantMatch[1].toLowerCase() as 'participant' | 'actor';
      const rawId = participantMatch[2].trim();
      const alias = participantMatch[3]?.trim();
      const id = rawId;
      if (!knownIds.has(id)) {
        participants.push({ id, label: alias || id, kind, alias });
        knownIds.add(id);
      }
      continue;
    }

    const arrowPatterns = ['-->>>', '-->>', '-->', '--x', '--)', '->>>', '->>', '->', '-x', '-)'];
    let matched = false;
    for (const arrow of arrowPatterns) {
      const arrowIndex = line.indexOf(arrow);
      if (arrowIndex <= 0) continue;
      const from = line.slice(0, arrowIndex).trim();
      const rest = line.slice(arrowIndex + arrow.length).trim();
      const colonIndex = rest.indexOf(':');
      const to = colonIndex >= 0 ? rest.slice(0, colonIndex).trim() : rest.trim();
      const label = colonIndex >= 0 ? rest.slice(colonIndex + 1).trim() : '';

      if (!from || !to) {
        diagnostics.push(`Invalid message at line ${lineNumber}: "${line}"`);
        matched = true;
        break;
      }

      ensureParticipant(from);
      ensureParticipant(to);

      const isSelf = from === to;
      const kind = isSelf ? 'self' : resolveMessageKind(arrow);
      messages.push({ from, to, label, kind });
      matched = true;
      break;
    }

    if (!matched && /(->|-->|->>|-->>|-x|--x)/.test(line)) {
      diagnostics.push(`Unrecognized message syntax at line ${lineNumber}: "${line}"`);
    }
  }

  if (!hasHeader) {
    return { nodes: [], edges: [], error: 'Missing sequenceDiagram header.' };
  }

  if (participants.length === 0) {
    return { nodes: [], edges: [], error: 'No participants found.' };
  }

  const LANE_WIDTH = 220;
  const participantKindMap = new Map(participants.map((p) => [p.id, p.kind]));

  const nodes: FlowNode[] = participants.map((p, i) => ({
    id: p.id,
    type: 'sequence_participant',
    position: { x: i * LANE_WIDTH, y: 0 },
    data: {
      label: p.label,
      seqParticipantKind: p.kind,
      seqParticipantAlias: p.alias,
    },
  }));

  const edges: FlowEdge[] = messages.map((msg, i) => ({
    id: `e-seq-${i + 1}`,
    source: msg.from,
    target: msg.to,
    sourceHandle: 'top',
    targetHandle: 'top',
    label: msg.label || undefined,
    type: 'sequence_message',
    data: {
      seqMessageKind: msg.kind,
      seqMessageOrder: i,
      sourceIsActor: participantKindMap.get(msg.from) === 'actor',
      targetIsActor: participantKindMap.get(msg.to) === 'actor',
    },
  }));

  return diagnostics.length > 0 ? { nodes, edges, diagnostics } : { nodes, edges };
}

export const SEQUENCE_PLUGIN: DiagramPlugin = {
  id: 'sequence',
  displayName: 'Sequence Diagram',
  parseMermaid: parseSequence,
};

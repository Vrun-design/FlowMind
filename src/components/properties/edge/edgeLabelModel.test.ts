import { describe, expect, it } from 'vitest';
import type { FlowEdge } from '@/lib/types';
import { buildEdgeLabelUpdates, getEditableEdgeLabel } from './edgeLabelModel';

function createEdge(overrides: Partial<FlowEdge> = {}): FlowEdge {
  return {
    id: 'edge-1',
    source: 'a',
    target: 'b',
    data: {},
    ...overrides,
  };
}

describe('edgeLabelModel', () => {
  it('reads and writes top-level labels for standard edges', () => {
    const edge = createEdge({ label: 'Sync' });

    expect(getEditableEdgeLabel(edge)).toBe('Sync');
    expect(buildEdgeLabelUpdates(edge, 'Async')).toEqual({ label: 'Async' });
  });

  it('prefers ER relation labels when ER semantics are present', () => {
    const edge = createEdge({
      label: 'ignored',
      data: { erRelation: '||--o{', erRelationLabel: 'places' },
    });

    expect(getEditableEdgeLabel(edge)).toBe('places');
    expect(buildEdgeLabelUpdates(edge, 'owns')).toEqual({
      data: { erRelation: '||--o{', erRelationLabel: 'owns' },
      label: undefined,
    });
  });
});

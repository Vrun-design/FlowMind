import { describe, expect, it } from 'vitest';
import { enrichNodesWithIcons } from './nodeEnricher';
import type { FlowNode } from './types';

function makeNode(id: string, label: string, overrides?: Partial<FlowNode>): FlowNode {
  return {
    id,
    type: 'process',
    position: { x: 0, y: 0 },
    data: { label, color: 'slate' },
    ...overrides,
  } as FlowNode;
}

describe('enrichNodesWithIcons', () => {
  it('assigns color based on semantic classification', async () => {
    const nodes = [
      makeNode('start', 'Start'),
      makeNode('end', 'End'),
      makeNode('db', 'PostgreSQL'),
      makeNode('check', 'Is Valid?', {
        data: { label: 'Is Valid?', color: 'slate', shape: 'diamond' },
      }),
    ];

    const enriched = await enrichNodesWithIcons(nodes);

    expect(enriched[0].data.color).toBe('emerald');
    expect(enriched[1].data.color).toBe('red');
    expect(enriched[2].data.color).toBe('violet');
    expect(enriched[3].data.color).toBe('amber');
  });

  it('assigns icons for known technologies', async () => {
    const nodes = [
      makeNode('db', 'PostgreSQL'),
      makeNode('cache', 'Redis Cache'),
      makeNode('api', 'Express API'),
    ];

    const enriched = await enrichNodesWithIcons(nodes);

    // PostgreSQL should get a provider icon (developer catalog)
    const pgNode = enriched[0];
    if (pgNode.data.archIconPackId) {
      expect(pgNode.data.archIconPackId).toBe('developer-icons-v1');
      expect(pgNode.data.archIconShapeId).toContain('postgresql');
    } else {
      expect(pgNode.data.icon).toBe('database');
    }

    // Redis should get a provider icon (developer catalog)
    const redisNode = enriched[1];
    if (redisNode.data.archIconPackId) {
      expect(redisNode.data.archIconPackId).toBe('developer-icons-v1');
      expect(redisNode.data.archIconShapeId).toContain('redis');
    } else {
      expect(redisNode.data.icon).toBe('hard-drive');
    }

    // Express should get a provider icon or Lucide fallback
    const expressNode = enriched[2];
    if (expressNode.data.archIconPackId) {
      expect(expressNode.data.archIconPackId).toBe('developer-icons-v1');
    } else {
      expect(expressNode.data.icon).toBe('server');
    }
  });

  it('skips section and group nodes', async () => {
    const nodes = [
      { ...makeNode('grp', 'Group'), type: 'section' as const },
      makeNode('x', 'Something'),
    ];

    const enriched = await enrichNodesWithIcons(nodes);

    expect(enriched[0].data.color).toBe('slate');
    expect(enriched[0].data.icon).toBeUndefined();
  });

  it('preserves existing non-slate colors', async () => {
    const nodes = [
      {
        id: 'a',
        type: 'process',
        position: { x: 0, y: 0 },
        data: { label: 'Start', color: 'pink' },
      },
    ];

    const enriched = await enrichNodesWithIcons(nodes as FlowNode[]);

    expect(enriched[0].data.color).toBe('pink');
  });

  it('preserves existing icons', async () => {
    const nodes = [
      {
        id: 'a',
        type: 'process',
        position: { x: 0, y: 0 },
        data: { label: 'PostgreSQL', color: 'violet', icon: 'my-icon' },
      },
    ];

    const enriched = await enrichNodesWithIcons(nodes as FlowNode[]);

    expect(enriched[0].data.icon).toBe('my-icon');
  });

  it('handles empty node array', async () => {
    const enriched = await enrichNodesWithIcons([]);
    expect(enriched).toEqual([]);
  });

  it('preserves nodes with no changes', async () => {
    const nodes = [
      {
        id: 'a',
        type: 'process',
        position: { x: 0, y: 0 },
        data: { label: 'Something Random', color: 'blue', icon: 'Box' },
      },
    ];

    const enriched = await enrichNodesWithIcons(nodes as FlowNode[]);
    expect(enriched[0]).toEqual(nodes[0]);
  });

  it('classifies decision shape correctly', async () => {
    const nodes = [
      makeNode('check', 'Validate?', {
        data: { label: 'Validate?', color: 'slate', shape: 'diamond' },
      }),
    ];

    const enriched = await enrichNodesWithIcons(nodes);
    expect(enriched[0].data.color).toBe('amber');
  });

  it('classifies cylinder shape as database', async () => {
    const nodes = [
      makeNode('pg', 'PostgreSQL DB', {
        data: { label: 'PostgreSQL DB', color: 'slate', shape: 'cylinder' },
      }),
    ];

    const enriched = await enrichNodesWithIcons(nodes);
    expect(enriched[0].data.color).toBe('violet');
    // Cylinder + PostgreSQL gets a provider icon or Lucide fallback
    if (!enriched[0].data.archIconPackId) {
      expect(enriched[0].data.icon).toBe('database');
    }
  });
});

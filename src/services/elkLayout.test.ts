import { describe, expect, it } from 'vitest';
import type { Edge, Node } from 'reactflow';
import {
  buildResolvedLayoutConfiguration,
  getDeterministicSeedOptions,
  normalizeLayoutInputsForDeterminism,
  resolveLayoutPresetOptions,
} from './elkLayout';

function createNode(id: string, parentNode?: string): Node {
  return {
    id,
    type: 'process',
    position: { x: 0, y: 0 },
    data: { label: id },
    parentNode,
  } as Node;
}

function createEdge(id: string, source: string, target: string): Edge {
  return { id, source, target } as Edge;
}

describe('normalizeLayoutInputsForDeterminism', () => {
  it('sorts top-level nodes, child nodes, and edges deterministically', () => {
    const nodes = [
      createNode('z'),
      createNode('a'),
      createNode('c-child', 'group-1'),
      createNode('group-1'),
      createNode('b-child', 'group-1'),
    ];
    const edges = [
      createEdge('e2', 'z', 'a'),
      createEdge('e1', 'a', 'z'),
      createEdge('e3', 'a', 'z'),
    ];

    const normalized = normalizeLayoutInputsForDeterminism(nodes, edges);
    const childIds = (normalized.childrenByParent.get('group-1') || []).map((node) => node.id);

    expect(normalized.topLevelNodes.map((node) => node.id)).toEqual(['a', 'z', 'group-1']);
    expect(childIds).toEqual(['b-child', 'c-child']);
    expect(normalized.sortedEdges.map((edge) => edge.id)).toEqual(['e1', 'e3', 'e2']);
  });

  it('returns empty child list for parents without children', () => {
    const normalized = normalizeLayoutInputsForDeterminism([createNode('a')], []);
    expect(normalized.childrenByParent.get('a')).toBeUndefined();
    expect(normalized.topLevelNodes).toHaveLength(1);
    expect(normalized.sortedEdges).toHaveLength(0);
  });

  it('uses deterministic component tie-break ordering for top-level nodes and edges', () => {
    const nodes = [
      createNode('z1'),
      createNode('b1'),
      createNode('a1'),
      createNode('c1'),
    ];
    const edges = [
      createEdge('edge-bc', 'b1', 'c1'),
      createEdge('edge-za', 'z1', 'a1'),
    ];

    const normalized = normalizeLayoutInputsForDeterminism(nodes, edges);

    expect(normalized.topLevelNodes.map((node) => node.id)).toEqual(['a1', 'z1', 'b1', 'c1']);
    expect(normalized.sortedEdges.map((edge) => edge.id)).toEqual(['edge-za', 'edge-bc']);
  });

  it('keeps grouped diagram child ordering deterministic across interleaved input order', () => {
    const nodes = [
      createNode('group-b'),
      createNode('a-child-2', 'group-a'),
      createNode('group-a'),
      createNode('b-child-2', 'group-b'),
      createNode('a-child-1', 'group-a'),
      createNode('b-child-1', 'group-b'),
    ];
    const edges = [
      createEdge('edge-b', 'b-child-1', 'b-child-2'),
      createEdge('edge-a', 'a-child-1', 'a-child-2'),
    ];

    const normalized = normalizeLayoutInputsForDeterminism(nodes, edges);

    expect(normalized.topLevelNodes.map((node) => node.id)).toEqual(['group-a', 'group-b']);
    expect((normalized.childrenByParent.get('group-a') || []).map((node) => node.id)).toEqual(['a-child-1', 'a-child-2']);
    expect((normalized.childrenByParent.get('group-b') || []).map((node) => node.id)).toEqual(['b-child-1', 'b-child-2']);
  });
});

describe('getDeterministicSeedOptions', () => {
  it('adds deterministic seed for algorithms that support randomized layouts', () => {
    expect(getDeterministicSeedOptions('force')).toEqual({ 'elk.randomSeed': '1337' });
    expect(getDeterministicSeedOptions('stress')).toEqual({ 'elk.randomSeed': '1337' });
    expect(getDeterministicSeedOptions('radial')).toEqual({ 'elk.randomSeed': '1337' });
  });

  it('falls back to deterministic-input-only path for non-seeded algorithms', () => {
    expect(getDeterministicSeedOptions('layered')).toEqual({});
    expect(getDeterministicSeedOptions('mrtree')).toEqual({});
  });
});

describe('resolveLayoutPresetOptions', () => {
  it('keeps explicit options when no preset is provided', () => {
    expect(
      resolveLayoutPresetOptions({ algorithm: 'mrtree', direction: 'BT', spacing: 'compact' })
    ).toEqual({
      algorithm: 'mrtree',
      direction: 'BT',
      spacing: 'compact',
    });
  });

  it('maps hierarchical preset to layered defaults', () => {
    expect(resolveLayoutPresetOptions({ preset: 'hierarchical' })).toEqual({
      algorithm: 'layered',
      direction: 'TB',
      spacing: 'normal',
    });
  });

  it('maps orthogonal compact and spacious presets deterministically', () => {
    expect(resolveLayoutPresetOptions({ preset: 'orthogonal-compact' })).toEqual({
      algorithm: 'layered',
      direction: 'LR',
      spacing: 'compact',
    });
    expect(resolveLayoutPresetOptions({ preset: 'orthogonal-spacious' })).toEqual({
      algorithm: 'layered',
      direction: 'LR',
      spacing: 'loose',
    });
  });
});

describe('buildResolvedLayoutConfiguration', () => {
  it('keeps orthogonal presets direction-consistent and spacing-distinct', () => {
    const compact = buildResolvedLayoutConfiguration({ preset: 'orthogonal-compact' });
    const spacious = buildResolvedLayoutConfiguration({ preset: 'orthogonal-spacious' });

    expect(compact.direction).toBe('LR');
    expect(spacious.direction).toBe('LR');
    expect(compact.layoutOptions['elk.direction']).toBe('RIGHT');
    expect(spacious.layoutOptions['elk.direction']).toBe('RIGHT');

    expect(Number(compact.dims.nodeNode)).toBeLessThan(Number(spacious.dims.nodeNode));
    expect(Number(compact.dims.nodeLayer)).toBeLessThan(Number(spacious.dims.nodeLayer));
    expect(Number(compact.dims.component)).toBeLessThan(Number(spacious.dims.component));
  });
});

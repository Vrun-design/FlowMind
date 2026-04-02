import { describe, expect, it } from 'vitest';
import { parseMermaidByType } from '@/services/mermaid/parseMermaidByType';
import { toMermaid } from './exportService';

describe('flowchart round-trip', () => {
  it('preserves flowchart edge style semantics through parse/export/parse', () => {
    const source = `
      flowchart TD
      A[Start] -.->|warmup| B{Gate}
      B ==> C([Done])
      C <-- D[Retry]
    `;

    const first = parseMermaidByType(source);
    expect(first.error).toBeUndefined();
    expect(first.diagramType).toBe('flowchart');
    expect(first.nodes.length).toBeGreaterThan(0);
    expect(first.edges).toHaveLength(3);

    expect(first.edges[0].style?.strokeDasharray).toBeDefined();
    expect(first.edges[1].style?.strokeWidth).toBe(4);
    expect(first.edges[2].markerStart).toBeDefined();
    expect(first.edges[2].markerEnd).toBeUndefined();

    const exported = toMermaid(first.nodes, first.edges, first.direction);
    expect(exported.startsWith('flowchart TB')).toBe(true);
    expect(exported).toContain('A -.->|"warmup"| B');
    expect(exported).toContain('B ==> C');
    expect(exported).toContain('C <-- D');

    const second = parseMermaidByType(exported);
    expect(second.error).toBeUndefined();
    expect(second.diagramType).toBe('flowchart');
    expect(second.nodes).toHaveLength(first.nodes.length);
    expect(second.edges).toHaveLength(first.edges.length);
    expect(second.edges[0].style?.strokeDasharray).toBeDefined();
    expect(second.edges[1].style?.strokeWidth).toBe(4);
    expect(second.edges[2].markerStart).toBeDefined();
    expect(second.edges[2].markerEnd).toBeUndefined();
  });

  it('preserves bidirectional flowchart arrows through parse/export/parse', () => {
    const source = `
      flowchart TD
      A <--> B
    `;

    const first = parseMermaidByType(source);
    expect(first.error).toBeUndefined();
    expect(first.diagramType).toBe('flowchart');
    expect(first.edges).toHaveLength(1);
    expect(first.edges[0].markerStart).toBeDefined();
    expect(first.edges[0].markerEnd).toBeDefined();

    const exported = toMermaid(first.nodes, first.edges);
    expect(exported).toContain('A <--> B');

    const second = parseMermaidByType(exported);
    expect(second.error).toBeUndefined();
    expect(second.diagramType).toBe('flowchart');
    expect(second.edges).toHaveLength(1);
    expect(second.edges[0].markerStart).toBeDefined();
    expect(second.edges[0].markerEnd).toBeDefined();
  });

  it('preserves direction through parse/export/parse', () => {
    const source = `
      flowchart LR
      A["Left"] --> B["Right"]
    `;

    const first = parseMermaidByType(source);
    expect(first.direction).toBe('LR');

    const exported = toMermaid(first.nodes, first.edges, first.direction);
    expect(exported).toContain('flowchart LR');

    const second = parseMermaidByType(exported);
    expect(second.direction).toBe('LR');
  });
});

import { describe, expect, it } from 'vitest';
import type { Edge, Node } from 'reactflow';
import {
  createDiagramDocument,
  DIAGRAM_DOCUMENT_VERSION,
  parseDiagramDocumentImport,
} from './diagramDocument';

function createNode(id: string): Node {
  return {
    id,
    type: 'process',
    position: { x: 0, y: 0 },
    data: { label: id },
  } as Node;
}

function createEdge(id: string, source: string, target: string): Edge {
  return { id, source, target } as Edge;
}

describe('diagramDocument', () => {
  it('creates export document with version metadata', () => {
    const doc = createDiagramDocument([createNode('n1')], [createEdge('e1', 'n1', 'n1')]);
    expect(doc.version).toBe(DIAGRAM_DOCUMENT_VERSION);
    expect(doc.name).toBe('FlowMind Diagram');
    expect(typeof doc.createdAt).toBe('string');
  });

  it('imports current major version without warnings', () => {
    const parsed = parseDiagramDocumentImport({
      version: '1.2',
      nodes: [createNode('n1')],
      edges: [createEdge('e1', 'n1', 'n1')],
    });
    expect(parsed.warnings).toEqual([]);
    expect(parsed.nodes).toHaveLength(1);
    expect(parsed.edges).toHaveLength(1);
  });

  it('imports legacy unversioned documents with warning', () => {
    const parsed = parseDiagramDocumentImport({
      nodes: [createNode('n1')],
      edges: [createEdge('e1', 'n1', 'n1')],
    });
    expect(parsed.warnings).toHaveLength(1);
    expect(parsed.warnings[0]).toContain('legacy JSON');
  });

  it('rejects unsupported future major versions', () => {
    expect(() =>
      parseDiagramDocumentImport({
        version: '2.0',
        nodes: [createNode('n1')],
        edges: [createEdge('e1', 'n1', 'n1')],
      })
    ).toThrow(/Unsupported flow file version/);
  });

  it('rejects malformed payloads', () => {
    expect(() => parseDiagramDocumentImport({ version: '1.0', nodes: [] })).toThrow(
      /missing nodes or edges arrays/
    );
  });
});

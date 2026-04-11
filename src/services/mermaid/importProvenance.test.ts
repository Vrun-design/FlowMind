import { describe, expect, it } from 'vitest';
import type { FlowEdge, FlowNode } from '@/lib/types';
import {
  attachMermaidImportedEdgeMetadata,
  attachMermaidImportedNodeMetadata,
  clearMermaidImportedEdgeMetadata,
  downgradeMermaidImportedEdgeMetadata,
  readMermaidImportedEdgeMetadata,
  readMermaidImportedNodeMetadataFromData,
  readMermaidImportedNodeMetadata,
} from './importProvenance';

describe('importProvenance', () => {
  it('attaches and reads imported Mermaid node metadata', () => {
    const node = attachMermaidImportedNodeMetadata(
      {
        id: 'n1',
        type: 'process',
        position: { x: 0, y: 0 },
        data: { label: 'Node' },
      } as FlowNode,
      {
        role: 'leaf',
        source: 'official-flowchart',
        fidelity: 'renderer-backed',
      }
    );

    expect(readMermaidImportedNodeMetadata(node)).toEqual({
      role: 'leaf',
      source: 'official-flowchart',
      fidelity: 'renderer-backed',
    });
    expect(readMermaidImportedNodeMetadataFromData(node.data)).toEqual({
      role: 'leaf',
      source: 'official-flowchart',
      fidelity: 'renderer-backed',
    });
  });

  it('attaches, reads, and clears imported Mermaid edge metadata', () => {
    const edge = attachMermaidImportedEdgeMetadata(
      {
        id: 'e1',
        source: 'a',
        target: 'b',
        sourceHandle: 'right',
        targetHandle: 'left',
        data: {},
      } as FlowEdge,
      {
        source: 'official-flowchart',
        fidelity: 'renderer-backed',
        hasFixedRoute: true,
      }
    );

    expect(readMermaidImportedEdgeMetadata(edge)).toEqual({
      source: 'official-flowchart',
      fidelity: 'renderer-backed',
      hasFixedRoute: true,
    });
    expect(readMermaidImportedEdgeMetadata({ ...edge, data: clearMermaidImportedEdgeMetadata(edge.data) } as FlowEdge)).toBeNull();
  });

  it('can downgrade imported Mermaid edge metadata while preserving provenance', () => {
    const edge = attachMermaidImportedEdgeMetadata(
      {
        id: 'e1',
        source: 'a',
        target: 'b',
        sourceHandle: 'right',
        targetHandle: 'left',
        data: {},
      } as FlowEdge,
      {
        source: 'official-flowchart',
        fidelity: 'renderer-backed',
        hasFixedRoute: true,
      }
    );

    expect(
      readMermaidImportedEdgeMetadata({
        ...edge,
        data: downgradeMermaidImportedEdgeMetadata(edge),
      } as FlowEdge)
    ).toEqual({
      source: 'official-flowchart',
      fidelity: 'renderer-backed',
      hasFixedRoute: false,
      preferredSourceHandle: 'right',
      preferredTargetHandle: 'left',
    });
  });
});

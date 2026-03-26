import { normalizeErFields } from './entityFields';
import { DEFAULT_CLASS_RELATION } from './relationSemantics';
import type { FlowEdge, FlowNode } from './types';

function toClassAttribute(field: ReturnType<typeof normalizeErFields>[number]): string {
  const segments = [field.name.trim() || 'field'];
  if (field.dataType.trim()) {
    segments.push(`: ${field.dataType.trim()}`);
  }
  if (field.isPrimaryKey) {
    segments.push(' {PK}');
  }
  if (field.isForeignKey) {
    segments.push(' {FK}');
  }
  return `+ ${segments.join('')}`.trim();
}

function describeERCardinality(token: string | undefined): string | null {
  switch (token) {
    case '||':
    case '}|':
      return '1';
    case 'o{':
    case '}o':
      return '0..*';
    case '|{':
      return '1..*';
    default:
      return null;
  }
}

function buildConvertedEdgeLabel(edge: FlowEdge): string | undefined {
  const explicitLabel = typeof edge.data?.erRelationLabel === 'string' && edge.data.erRelationLabel.trim().length > 0
    ? edge.data.erRelationLabel.trim()
    : typeof edge.label === 'string' && edge.label.trim().length > 0
      ? edge.label.trim()
      : '';
  const relation = typeof edge.data?.erRelation === 'string' ? edge.data.erRelation : '';
  const start = describeERCardinality(relation.slice(0, 2));
  const end = describeERCardinality(relation.slice(-2));
  const multiplicityLabel = start && end ? `${start} to ${end}` : '';

  if (explicitLabel && multiplicityLabel) {
    return `${explicitLabel} (${multiplicityLabel})`;
  }
  return explicitLabel || multiplicityLabel || undefined;
}

export interface ConvertErSelectionResult {
  changedNodeIds: string[];
  changedEdgeIds: string[];
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export function convertSelectedErNodesToClassDiagram(
  nodes: FlowNode[],
  edges: FlowEdge[],
): ConvertErSelectionResult {
  const selectedEntityIds = new Set(
    nodes
      .filter((node) => node.selected && node.type === 'er_entity')
      .map((node) => node.id),
  );

  if (selectedEntityIds.size === 0) {
    return {
      changedNodeIds: [],
      changedEdgeIds: [],
      nodes,
      edges,
    };
  }

  const changedNodeIds: string[] = [];
  const changedEdgeIds: string[] = [];

  const convertedNodes = nodes.map((node) => {
    if (!selectedEntityIds.has(node.id)) {
      return node;
    }

    changedNodeIds.push(node.id);
    const nextNode: FlowNode = {
      ...node,
      type: 'class',
      data: {
        ...node.data,
        classAttributes: normalizeErFields(node.data.erFields).map(toClassAttribute),
        classMethods: Array.isArray(node.data.classMethods) ? node.data.classMethods : [],
        erFields: undefined,
        color: node.data.color || 'white',
        shape: 'rectangle',
      },
    };
    return nextNode;
  });

  const convertedEdges = edges.map((edge) => {
    if (!selectedEntityIds.has(edge.source) || !selectedEntityIds.has(edge.target)) {
      return edge;
    }

    changedEdgeIds.push(edge.id);
    const nextEdge: FlowEdge = {
      ...edge,
      label: buildConvertedEdgeLabel(edge),
      data: {
        ...edge.data,
        classRelation: DEFAULT_CLASS_RELATION,
        classRelationLabel: buildConvertedEdgeLabel(edge),
        erRelation: undefined,
        erRelationLabel: undefined,
      },
    };
    return nextEdge;
  });

  return {
    changedNodeIds,
    changedEdgeIds,
    nodes: convertedNodes,
    edges: convertedEdges,
  };
}

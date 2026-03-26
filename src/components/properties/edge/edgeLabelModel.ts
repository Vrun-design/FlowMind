import type { FlowEdge } from '@/lib/types';

function trimToOptionalString(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getEditableEdgeLabel(edge: FlowEdge): string {
  if (typeof edge.data?.erRelationLabel === 'string') {
    return edge.data.erRelationLabel;
  }
  if (typeof edge.data?.classRelationLabel === 'string') {
    return edge.data.classRelationLabel;
  }
  return typeof edge.label === 'string' ? edge.label : '';
}

export function buildEdgeLabelUpdates(edge: FlowEdge, value: string): Partial<FlowEdge> {
  const trimmed = trimToOptionalString(value);

  if (typeof edge.data?.erRelation === 'string') {
    return {
      data: {
        ...edge.data,
        erRelationLabel: trimmed,
      },
      label: undefined,
    };
  }

  if (typeof edge.data?.classRelation === 'string') {
    return {
      data: {
        ...edge.data,
        classRelationLabel: trimmed,
      },
      label: undefined,
    };
  }

  return {
    label: trimmed,
  };
}

export function hasEditableEdgeLabel(edge: FlowEdge): boolean {
  return getEditableEdgeLabel(edge).trim().length > 0;
}

import type { FlowNode } from '@/lib/types';
import type { LayoutOptions } from '@/services/elk-layout/types';

export interface ImportLayoutMetadata {
  signature: string;
  direction: NonNullable<LayoutOptions['direction']>;
  spacing: NonNullable<LayoutOptions['spacing']>;
  contentDensity: NonNullable<LayoutOptions['contentDensity']>;
  diagramType?: string;
}

const IMPORT_PENDING_LAYOUT_KEY = '_importPendingLayout';
const IMPORT_LAYOUT_SIGNATURE_KEY = '_importLayoutSignature';
const IMPORT_LAYOUT_DIRECTION_KEY = '_importLayoutDirection';
const IMPORT_LAYOUT_SPACING_KEY = '_importLayoutSpacing';
const IMPORT_LAYOUT_CONTENT_DENSITY_KEY = '_importLayoutContentDensity';
const IMPORT_LAYOUT_DIAGRAM_TYPE_KEY = '_importLayoutDiagramType';

export function attachImportLayoutMetadata(
  nodes: FlowNode[],
  metadata: ImportLayoutMetadata
): FlowNode[] {
  return nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      [IMPORT_PENDING_LAYOUT_KEY]: true,
      [IMPORT_LAYOUT_SIGNATURE_KEY]: metadata.signature,
      [IMPORT_LAYOUT_DIRECTION_KEY]: metadata.direction,
      [IMPORT_LAYOUT_SPACING_KEY]: metadata.spacing,
      [IMPORT_LAYOUT_CONTENT_DENSITY_KEY]: metadata.contentDensity,
      [IMPORT_LAYOUT_DIAGRAM_TYPE_KEY]: metadata.diagramType,
    },
  }));
}

export function clearImportLayoutMetadata(nodes: FlowNode[]): FlowNode[] {
  return nodes.map((node) => {
    if (!isImportPendingLayoutNode(node)) {
      return node;
    }

    const data = { ...node.data };
    delete data[IMPORT_PENDING_LAYOUT_KEY];
    delete data[IMPORT_LAYOUT_SIGNATURE_KEY];
    delete data[IMPORT_LAYOUT_DIRECTION_KEY];
    delete data[IMPORT_LAYOUT_SPACING_KEY];
    delete data[IMPORT_LAYOUT_CONTENT_DENSITY_KEY];
    delete data[IMPORT_LAYOUT_DIAGRAM_TYPE_KEY];

    return {
      ...node,
      data,
    };
  });
}

export function isImportPendingLayoutNode(node: FlowNode): boolean {
  return node.data?.[IMPORT_PENDING_LAYOUT_KEY] === true;
}

export function readImportLayoutMetadata(nodes: FlowNode[]): ImportLayoutMetadata | null {
  const node = nodes.find(isImportPendingLayoutNode);
  if (!node) {
    return null;
  }

  const signature = node.data?.[IMPORT_LAYOUT_SIGNATURE_KEY];
  const direction = node.data?.[IMPORT_LAYOUT_DIRECTION_KEY];
  const spacing = node.data?.[IMPORT_LAYOUT_SPACING_KEY];
  const contentDensity = node.data?.[IMPORT_LAYOUT_CONTENT_DENSITY_KEY];

  if (
    typeof signature !== 'string'
    || (direction !== 'TB' && direction !== 'LR' && direction !== 'RL' && direction !== 'BT')
    || (spacing !== 'compact' && spacing !== 'normal' && spacing !== 'loose')
    || (contentDensity !== 'compact' && contentDensity !== 'balanced' && contentDensity !== 'verbose')
  ) {
    return null;
  }

  const diagramType =
    typeof node.data?.[IMPORT_LAYOUT_DIAGRAM_TYPE_KEY] === 'string'
      ? String(node.data?.[IMPORT_LAYOUT_DIAGRAM_TYPE_KEY])
      : undefined;

  return {
    signature,
    direction,
    spacing,
    contentDensity,
    diagramType,
  };
}

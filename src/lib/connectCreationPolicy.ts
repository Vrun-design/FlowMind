import type { NodeData } from '@/lib/types';
import { handleIdToSide } from '@/lib/nodeHandles';

export interface ConnectedNodeSpec {
  type: string;
  shape?: NodeData['shape'];
}

const SELF_PROPAGATING_TYPES: Record<string, ConnectedNodeSpec> = {
  annotation: { type: 'annotation' },
  architecture: { type: 'architecture' },
  class: { type: 'class' },
  er_entity: { type: 'er_entity' },
  journey: { type: 'journey' },
  start: { type: 'process', shape: 'rounded' },
  end: { type: 'process', shape: 'rounded' },
  decision: { type: 'process', shape: 'rounded' },
};

export function isMindmapConnectorSource(sourceNodeType?: string | null): boolean {
  return sourceNodeType === 'mindmap';
}

export function getDefaultConnectedNodeSpec(sourceNodeType?: string | null): ConnectedNodeSpec {
  if (isMindmapConnectorSource(sourceNodeType)) {
    return { type: 'mindmap' };
  }

  return SELF_PROPAGATING_TYPES[sourceNodeType ?? ''] ?? { type: 'process', shape: 'rounded' };
}

export function shouldBypassConnectMenu(sourceNodeType?: string | null): boolean {
  return isMindmapConnectorSource(sourceNodeType);
}

export function getMindmapChildSideFromSourceHandle(sourceHandle?: string | null): 'left' | 'right' | undefined {
  const side = handleIdToSide(sourceHandle);
  if (side === 'left' || side === 'right') {
    return side;
  }
  return undefined;
}

export function resolveMindmapChildSide(
  parentDepth: number,
  parentSide?: 'left' | 'right' | null,
  sourceHandle?: string | null
): 'left' | 'right' | undefined {
  if (parentDepth === 0) {
    return getMindmapChildSideFromSourceHandle(sourceHandle) ?? 'right';
  }
  return parentSide ?? undefined;
}

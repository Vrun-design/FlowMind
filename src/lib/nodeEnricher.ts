import type { FlowNode } from '@/lib/types';
import { classifyNode } from '@/lib/semanticClassifier';
import { matchIcon, type IconMatch } from '@/lib/iconMatcher';

export function enrichNodesWithIcons(nodes: FlowNode[]): FlowNode[] {
  return nodes.map(enrichSingleNode);
}

function enrichSingleNode(node: FlowNode): FlowNode {
  if (node.type === 'section' || node.type === 'group' || node.type === 'swimlane') {
    return node;
  }

  const label = node.data?.label ?? '';
  const nodeColor = node.data?.color;
  const isDefaultColor = !nodeColor || nodeColor === 'slate' || nodeColor === 'white';
  const hasExplicitColor = !isDefaultColor;
  const hasExplicitProviderIcon = Boolean(node.data?.archIconPackId);
  const hasAnyIcon = Boolean(node.data?.icon) || hasExplicitProviderIcon;

  if (hasExplicitColor && hasAnyIcon) {
    return node;
  }

  const hint = classifyNode({ id: node.id, label, shape: node.data?.shape });
  const dataUpdates: Record<string, unknown> = {};

  if (!hasExplicitColor) {
    applyColor(node, hint.color, dataUpdates);
  }

  if (!hasExplicitProviderIcon) {
    applyIcon(node, label, hint, dataUpdates);
  }

  if (Object.keys(dataUpdates).length === 0) {
    return node;
  }

  return {
    ...node,
    data: {
      ...node.data,
      ...dataUpdates,
    },
  };
}

function applyColor(
  node: FlowNode,
  classifierColor: string,
  updates: Record<string, unknown>
): void {
  if (node.type === 'start') {
    updates.color = 'emerald';
  } else if (node.type === 'end') {
    updates.color = 'red';
  } else if (node.type === 'decision') {
    updates.color = 'amber';
  } else {
    updates.color = classifierColor;
  }
}

function applyIcon(
  node: FlowNode,
  label: string,
  hint: { iconQuery: string; lucideFallback: string; category: string },
  updates: Record<string, unknown>
): void {
  const explicitIcon = node.data?.icon;
  const provider = node.data?.provider;
  const providerHint = typeof provider === 'string' ? provider : undefined;

  // Priority 1: Explicit icon attribute (e.g., icon: "redis")
  if (explicitIcon && typeof explicitIcon === 'string' && explicitIcon !== 'none') {
    const match = findBestMatch(explicitIcon, providerHint);
    if (match) {
      updates.archIconPackId = match.packId;
      updates.archIconShapeId = match.shapeId;
      updates.assetPresentation = 'icon';
    }
    return;
  }

  // Priority 2: Classifier icon query (e.g., label contains "PostgreSQL")
  if (hint.iconQuery) {
    const match = findBestMatch(hint.iconQuery, providerHint);
    if (match) {
      updates.archIconPackId = match.packId;
      updates.archIconShapeId = match.shapeId;
      updates.assetPresentation = 'icon';
      updates.icon = hint.lucideFallback;
      return;
    }
  }

  // Priority 3: Label-based fallback (icons: auto — match by node label)
  // Only when node has NO icon at all
  if (label && !node.data?.icon) {
    const match = findBestMatch(label, providerHint);
    if (match) {
      updates.archIconPackId = match.packId;
      updates.archIconShapeId = match.shapeId;
      updates.assetPresentation = 'icon';
    }
  }

  // Lucide icon fallback
  if (hint.lucideFallback && hint.lucideFallback !== 'box') {
    updates.icon = hint.lucideFallback;
  } else if (node.type === 'start') {
    updates.icon = 'play';
  } else if (node.type === 'end') {
    updates.icon = 'check-circle';
  } else if (node.type === 'decision') {
    updates.icon = 'help-circle';
  }
}

function findBestMatch(query: string, providerHint?: string): IconMatch | undefined {
  const matches = matchIcon(query, providerHint);
  const best = matches[0];
  return best && best.score >= 0.8 ? best : undefined;
}

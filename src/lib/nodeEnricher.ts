import type { FlowNode } from '@/lib/types';
import { classifyNode } from '@/lib/semanticClassifier';
import { resolveIconSync } from '@/lib/iconResolver';
import { loadDomainAssetSuggestions } from '@/services/assetCatalog';
import type { DomainLibraryCategory } from '@/services/domainLibrary';

export async function enrichNodesWithIcons(nodes: FlowNode[]): Promise<FlowNode[]> {
  const enriched = await Promise.all(nodes.map(enrichSingleNode));
  return enriched;
}

async function enrichSingleNode(node: FlowNode): Promise<FlowNode> {
  if (node.type === 'section' || node.type === 'group' || node.type === 'swimlane') {
    return node;
  }

  const label = node.data?.label ?? '';
  const hasExplicitColor = node.data?.color && node.data.color !== 'slate';
  const hasExplicitIcon = Boolean(node.data?.icon);

  if (hasExplicitColor && hasExplicitIcon) {
    return node;
  }

  const hint = classifyNode({ id: node.id, label, shape: node.data?.shape });
  const dataUpdates: Record<string, unknown> = {};

  if (!hasExplicitColor) {
    // Use parser-assigned node type to override classifier if it's more specific
    if (node.type === 'start') {
      dataUpdates.color = 'emerald';
    } else if (node.type === 'end') {
      dataUpdates.color = 'red';
    } else if (node.type === 'decision') {
      dataUpdates.color = 'amber';
    } else {
      dataUpdates.color = hint.color;
    }
  }

  if (!hasExplicitIcon) {
    const classifierIcon = hint.lucideFallback;

    if (hint.iconQuery) {
      const resolved = resolveIconSync(hint.iconQuery, hint.category);
      if (resolved.found && resolved.catalog && resolved.iconSearch) {
        const catalogResult = await searchCatalogForIcon(resolved.catalog, resolved.iconSearch);
        if (catalogResult?.archIconPackId && catalogResult.archIconShapeId) {
          dataUpdates.archIconPackId = catalogResult.archIconPackId;
          dataUpdates.archIconShapeId = catalogResult.archIconShapeId;
          dataUpdates.assetPresentation = 'icon';
        }
      }
    }

    // Use classifier icon if specific (not generic 'box'), otherwise use node type defaults
    if (classifierIcon && classifierIcon !== 'box') {
      dataUpdates.icon = classifierIcon;
    } else if (node.type === 'start') {
      dataUpdates.icon = 'play';
    } else if (node.type === 'end') {
      dataUpdates.icon = 'check-circle';
    } else if (node.type === 'decision') {
      dataUpdates.icon = 'help-circle';
    }
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

const catalogCache = new Map<
  string,
  { icon?: string; archIconPackId?: string; archIconShapeId?: string } | null
>();

async function searchCatalogForIcon(
  catalog: DomainLibraryCategory,
  query: string
): Promise<{ icon?: string; archIconPackId?: string; archIconShapeId?: string } | null> {
  const cacheKey = `${catalog}:${query}`;
  if (catalogCache.has(cacheKey)) {
    return catalogCache.get(cacheKey)!;
  }

  try {
    const results = await loadDomainAssetSuggestions(catalog, { query, limit: 1 });
    if (results.length > 0) {
      const best = results[0];
      const labelMatch = best.label.toLowerCase().includes(query.toLowerCase());
      const descMatch = best.description.toLowerCase().includes(query.toLowerCase());

      if (labelMatch || descMatch) {
        const match = {
          icon: best.icon,
          archIconPackId: best.archIconPackId,
          archIconShapeId: best.archIconShapeId,
        };
        catalogCache.set(cacheKey, match);
        return match;
      }
    }
  } catch {
    // Catalog search failed — fall back to Lucide
  }

  catalogCache.set(cacheKey, null);
  return null;
}

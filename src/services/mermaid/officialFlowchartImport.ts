import type { FlowEdge, FlowNode } from '@/lib/types';
import {
  extractRawMermaidGeometry,
  type ExtractedEdgeLayout,
  type ExtractedNodeLayout,
  type RawExtractedMermaidGeometry,
} from './extractLayoutFromSvg';
import {
  getMermaidImportCandidateIds,
  isMermaidImportPointInsideBounds,
  mermaidImportSetsAreEqual,
  normalizeMermaidImportIdentifier,
} from './importGeometryUtils';
import {
  projectMermaidImportScene,
  type MermaidImportScene,
  type MermaidImportSceneEdge,
  type MermaidImportSceneNode,
} from './importSceneProjection';

interface MermaidDiagramHandle {
  db?: OfficialFlowchartDb;
  getType?: () => string;
}

interface MermaidRuntime {
  initialize: (config: {
    startOnLoad: boolean;
    securityLevel: 'loose';
    suppressErrorRendering: boolean;
    htmlLabels?: boolean;
  }) => void;
  mermaidAPI?: {
    getDiagramFromText: (text: string) => Promise<MermaidDiagramHandle>;
  };
}

interface OfficialFlowchartEdge {
  start: string;
  end: string;
  text?: string;
  stroke?: string;
  id?: string;
}

interface OfficialFlowchartSubgraph {
  id: string;
  nodes: string[];
  title?: string;
}

interface OfficialFlowchartVertex {
  text?: string;
  type?: string; // Mermaid shape type: 'square', 'round', 'diamond', 'hexagon', etc.
}

// Mermaid v11 stores vertices as a Map<string, vertex>; older versions used a plain object.
// The DB may also expose a getVertices() accessor.
interface OfficialFlowchartDb {
  edges?: OfficialFlowchartEdge[];
  subGraphs?: OfficialFlowchartSubgraph[];
  // v10 plain object; v11+ Map
  vertices?: Map<string, OfficialFlowchartVertex> | Record<string, OfficialFlowchartVertex>;
  // v11 accessor method
  getVertices?: () => Map<string, OfficialFlowchartVertex>;
  getSubGraphs?: () => OfficialFlowchartSubgraph[];
  direction?: string; // e.g. 'LR', 'TB', 'RL', 'BT'
}

interface OfficialFlowchartDefinition {
  edges: OfficialFlowchartEdge[];
  subgraphs: OfficialFlowchartSubgraph[];
  // Normalised to a plain Map for efficient .get() access
  verticesMap: Map<string, OfficialFlowchartVertex>;
  direction?: string;
}

export interface OfficialFlowchartImportGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
  matchedLeafNodeCount: number;
  totalLeafNodeCount: number;
  matchedSectionCount: number;
  totalSectionCount: number;
  matchedEdgeGeometryCount: number;
  totalEdgeCount: number;
  direction?: string;
  reason?: string;
}

let runtimePromise: Promise<MermaidRuntime | null> | null = null;
let initialized = false;

function canUseOfficialRuntime(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

async function getOfficialRuntime(): Promise<MermaidRuntime | null> {
  if (!canUseOfficialRuntime()) {
    return null;
  }

  if (!runtimePromise) {
    runtimePromise = import('mermaid')
      .then((module) => {
        const runtime = module.default as MermaidRuntime;
        if (!initialized) {
          runtime.initialize({
            startOnLoad: false,
            securityLevel: 'loose',
            suppressErrorRendering: true,
            htmlLabels: false,
          });
          initialized = true;
        }
        return runtime;
      })
      .catch(() => null);
  }

  return runtimePromise;
}

async function extractOfficialFlowchartDefinition(
  mermaidSource: string
): Promise<OfficialFlowchartDefinition | null> {
  const runtime = await getOfficialRuntime();
  if (!runtime?.mermaidAPI?.getDiagramFromText) {
    return null;
  }

  const diagram = await runtime.mermaidAPI.getDiagramFromText(mermaidSource);
  const type = diagram.getType?.();
  if (typeof type !== 'string' || !type.startsWith('flowchart')) {
    return null;
  }

  const db = diagram.db as OfficialFlowchartDb | undefined;

  // Mermaid v11 stores vertices as a Map; older versions used a plain object.
  // Prefer getVertices() if available, then fall back to direct property access.
  let verticesMap: Map<string, OfficialFlowchartVertex>;
  const rawVertices = typeof db?.getVertices === 'function' ? db.getVertices() : db?.vertices;
  if (rawVertices instanceof Map) {
    verticesMap = rawVertices as Map<string, OfficialFlowchartVertex>;
  } else if (rawVertices && typeof rawVertices === 'object') {
    verticesMap = new Map(Object.entries(rawVertices as Record<string, OfficialFlowchartVertex>));
  } else {
    verticesMap = new Map();
  }

  // Mermaid v11 may expose getSubGraphs(); fall back to subGraphs property.
  const subgraphs = typeof db?.getSubGraphs === 'function'
    ? db.getSubGraphs()
    : Array.isArray(db?.subGraphs) ? db.subGraphs : [];

  return {
    edges: Array.isArray(db?.edges) ? db.edges as OfficialFlowchartEdge[] : [],
    subgraphs,
    verticesMap,
    direction: db?.direction ?? undefined,
  };
}

function getNodeCenter(node: ExtractedNodeLayout): { x: number; y: number } {
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
}

function getDistanceToNodeBounds(point: { x: number; y: number }, node: ExtractedNodeLayout): number {
  const clampedX = Math.min(Math.max(point.x, node.x), node.x + node.width);
  const clampedY = Math.min(Math.max(point.y, node.y), node.y + node.height);
  const outside = Math.hypot(point.x - clampedX, point.y - clampedY);

  if (outside > 0) {
    return outside;
  }

  return Math.min(
    Math.abs(point.x - node.x),
    Math.abs(node.x + node.width - point.x),
    Math.abs(point.y - node.y),
    Math.abs(node.y + node.height - point.y)
  );
}

function nearestNodeId(point: { x: number; y: number }, nodes: ExtractedNodeLayout[]): string | null {
  const containing = nodes.filter(
    (node) =>
      point.x >= node.x &&
      point.x <= node.x + node.width &&
      point.y >= node.y &&
      point.y <= node.y + node.height
  );

  if (containing.length > 0) {
    return containing.slice().sort((a, b) => a.width * a.height - b.width * b.height)[0].id;
  }

  let bestId: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestCenterDistance = Number.POSITIVE_INFINITY;

  for (const node of nodes) {
    const distance = getDistanceToNodeBounds(point, node);
    const center = getNodeCenter(node);
    const centerDistance = Math.hypot(center.x - point.x, center.y - point.y);

    if (distance < bestDistance || (distance === bestDistance && centerDistance < bestCenterDistance)) {
      bestDistance = distance;
      bestCenterDistance = centerDistance;
      bestId = node.id;
    }
  }

  return bestId;
}

function reconcileEdges(
  definition: OfficialFlowchartDefinition,
  rawGeometry: RawExtractedMermaidGeometry,
  leafLayouts: ExtractedNodeLayout[],
  clusterLayouts: ExtractedNodeLayout[],
  sectionIdBySubgraphId: Map<string, string>
): ExtractedEdgeLayout[] {
  const rawEdgeById = new Map<string, RawExtractedMermaidGeometry['edges'][number]>();
  for (const rawEdge of rawGeometry.edges) {
    if (!rawEdge.rawId) continue;
    rawEdgeById.set(rawEdge.rawId, rawEdge);
  }

  const directMatches = definition.edges.flatMap((edge) => {
    const rawEdge = edge.id ? rawEdgeById.get(edge.id) : undefined;
    if (!rawEdge) {
      return [];
    }

    return [{
      source: mapEdgeEndpoint(edge.start, sectionIdBySubgraphId),
      target: mapEdgeEndpoint(edge.end, sectionIdBySubgraphId),
      points: rawEdge.points,
      path: rawEdge.path,
    }];
  });

  if (directMatches.length > 0) {
    return directMatches;
  }

  const routingTargets = [...leafLayouts, ...clusterLayouts];
  return rawGeometry.edges.flatMap((rawEdge) => {
    const source = nearestNodeId(rawEdge.points[0], routingTargets);
    const target = nearestNodeId(rawEdge.points[rawEdge.points.length - 1], routingTargets);
    if (!source || !target) {
      return [];
    }

    return [{ source, target, points: rawEdge.points, path: rawEdge.path }];
  });
}

function createSyntheticSectionId(title: string, takenIds: Set<string>): string {
  const base = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
  let candidate = base;
  let counter = 1;
  while (takenIds.has(candidate)) {
    candidate = `${base}-${counter++}`;
  }
  takenIds.add(candidate);
  return candidate;
}

function collectParserSectionLeafSets(nodes: FlowNode[]): Map<string, Set<string>> {
  const childrenByParent = new Map<string, FlowNode[]>();
  for (const node of nodes) {
    if (!node.parentId) continue;
    const children = childrenByParent.get(node.parentId) ?? [];
    children.push(node);
    childrenByParent.set(node.parentId, children);
  }

  const cache = new Map<string, Set<string>>();

  function collect(sectionId: string): Set<string> {
    const cached = cache.get(sectionId);
    if (cached) return cached;

    const leafIds = new Set<string>();
    for (const child of childrenByParent.get(sectionId) ?? []) {
      if (child.type === 'section') {
        for (const id of collect(child.id)) {
          leafIds.add(id);
        }
      } else {
        leafIds.add(child.id);
      }
    }

    cache.set(sectionId, leafIds);
    return leafIds;
  }

  for (const node of nodes) {
    if (node.type === 'section') {
      collect(node.id);
    }
  }

  return cache;
}

function expandSubgraphLeafIds(
  subgraphId: string,
  subgraphsById: Map<string, OfficialFlowchartSubgraph>,
  visiting = new Set<string>()
): Set<string> {
  const subgraph = subgraphsById.get(subgraphId);
  if (!subgraph || visiting.has(subgraphId)) {
    return new Set();
  }

  visiting.add(subgraphId);
  const leafIds = new Set<string>();
  for (const nodeId of subgraph.nodes) {
    if (subgraphsById.has(nodeId)) {
      for (const nestedId of expandSubgraphLeafIds(nodeId, subgraphsById, visiting)) {
        leafIds.add(nestedId);
      }
    } else {
      leafIds.add(nodeId);
    }
  }
  visiting.delete(subgraphId);
  return leafIds;
}

function mapRawNodesByOfficialId(
  rawNodes: RawExtractedMermaidGeometry['nodes']
): Map<string, RawExtractedMermaidGeometry['nodes'][number]> {
  const mapped = new Map<string, RawExtractedMermaidGeometry['nodes'][number]>();

  for (const rawNode of rawNodes) {
    for (const candidate of getMermaidImportCandidateIds(rawNode.rawId)) {
      mapped.set(candidate, rawNode);
      const normalized = normalizeMermaidImportIdentifier(candidate);
      if (normalized) {
        mapped.set(normalized, rawNode);
      }
    }
  }

  return mapped;
}

function mapClusterLayouts(
  subgraphs: OfficialFlowchartSubgraph[],
  subgraphLeafSets: Map<string, Set<string>>,
  sectionIdBySubgraphId: Map<string, string>,
  rawGeometry: RawExtractedMermaidGeometry,
  leafLayouts: ExtractedNodeLayout[]
): Map<string, ExtractedNodeLayout> {
  const layoutBySectionId = new Map<string, ExtractedNodeLayout>();
  const usedClusters = new Set<number>();

  const rawClusterLeafSets = rawGeometry.clusters.map((cluster) => {
    const leafIds = new Set<string>();
    for (const leaf of leafLayouts) {
      const center = { x: leaf.x + leaf.width / 2, y: leaf.y + leaf.height / 2 };
      if (isMermaidImportPointInsideBounds(center, cluster)) {
        leafIds.add(leaf.id);
      }
    }
    return leafIds;
  });

  for (const subgraph of subgraphs) {
    const sectionId = sectionIdBySubgraphId.get(subgraph.id);
    if (!sectionId) continue;

    const normalizedTitle = normalizeMermaidImportIdentifier(subgraph.title);
    const normalizedSubgraphId = normalizeMermaidImportIdentifier(subgraph.id);
    let clusterIndex = rawGeometry.clusters.findIndex((cluster, index) => {
      if (usedClusters.has(index)) return false;
      const rawCandidates = getMermaidImportCandidateIds(cluster.rawId);
      if (rawCandidates.includes(subgraph.id)) return true;
      if (
        normalizedSubgraphId &&
        rawCandidates.some(
          (candidate) => normalizeMermaidImportIdentifier(candidate) === normalizedSubgraphId
        )
      ) {
        return true;
      }
      return normalizedTitle !== null && normalizeMermaidImportIdentifier(cluster.label) === normalizedTitle;
    });

    if (clusterIndex < 0) {
      const expectedLeafIds = subgraphLeafSets.get(subgraph.id);
      if (expectedLeafIds?.size) {
        clusterIndex = rawClusterLeafSets.findIndex(
          (leafIds, index) =>
            !usedClusters.has(index) && mermaidImportSetsAreEqual(leafIds, expectedLeafIds)
        );
      }
    }

    if (clusterIndex < 0) continue;

    usedClusters.add(clusterIndex);
    const cluster = rawGeometry.clusters[clusterIndex];
    layoutBySectionId.set(sectionId, {
      id: sectionId,
      rawId: cluster.rawId,
      label: cluster.label,
      x: cluster.x,
      y: cluster.y,
      width: cluster.width,
      height: cluster.height,
    });
  }

  return layoutBySectionId;
}

function mapEdgeEndpoint(endpointId: string, sectionIdBySubgraphId: Map<string, string>): string {
  return sectionIdBySubgraphId.get(endpointId) ?? endpointId;
}

function createLeafSceneNodes(
  leafIds: string[],
  parserNodesById: Map<string, FlowNode>,
  rawNodeByOfficialId: Map<string, RawExtractedMermaidGeometry['nodes'][number]>,
  definition: OfficialFlowchartDefinition,
  directParentSubgraphByLeafId: Map<string, string>,
  sectionIdBySubgraphId: Map<string, string>
): { sceneNodes: MermaidImportSceneNode[]; leafLayouts: ExtractedNodeLayout[] } {
  const sceneNodes: MermaidImportSceneNode[] = [];
  const leafLayouts: ExtractedNodeLayout[] = [];

  for (const leafId of leafIds) {
    const parserNode = parserNodesById.get(leafId);
    const rawNode =
      rawNodeByOfficialId.get(leafId) ??
      rawNodeByOfficialId.get(normalizeMermaidImportIdentifier(leafId) ?? '');
    const vertexText = definition.verticesMap.get(leafId)?.text;
    const parentSubgraphId = directParentSubgraphByLeafId.get(leafId);
    const parentId = parentSubgraphId ? sectionIdBySubgraphId.get(parentSubgraphId) : undefined;

    if (rawNode) {
      leafLayouts.push({
        id: leafId,
        rawId: rawNode.rawId,
        label: rawNode.label,
        x: rawNode.x,
        y: rawNode.y,
        width: rawNode.width,
        height: rawNode.height,
      });
    }

    sceneNodes.push({
      id: leafId,
      kind: 'leaf',
      label: rawNode?.label ?? vertexText ?? String(parserNode?.data?.label ?? leafId),
      parentId,
      position: { x: rawNode?.x ?? 0, y: rawNode?.y ?? 0 },
      width: rawNode?.width,
      height: rawNode?.height,
      sourceNode: parserNode,
      mermaidShapeType: definition.verticesMap.get(leafId)?.type,
    });
  }

  return { sceneNodes, leafLayouts };
}

function getDirectParentSubgraphBySubgraphId(
  definition: OfficialFlowchartDefinition
): Map<string, string> {
  const directParentBySubgraphId = new Map<string, string>();

  for (const subgraph of definition.subgraphs) {
    const parent = definition.subgraphs.find(
      (candidate) => candidate.id !== subgraph.id && candidate.nodes.includes(subgraph.id)
    );
    if (parent) {
      directParentBySubgraphId.set(subgraph.id, parent.id);
    }
  }

  return directParentBySubgraphId;
}

function getDirectParentSubgraphByLeafId(
  leafIds: string[],
  definition: OfficialFlowchartDefinition,
  subgraphLeafSets: Map<string, Set<string>>
): Map<string, string> {
  const directParentByLeafId = new Map<string, string>();

  for (const leafId of leafIds) {
    const directParent = definition.subgraphs.find((subgraph) => subgraph.nodes.includes(leafId));
    if (directParent) {
      directParentByLeafId.set(leafId, directParent.id);
      continue;
    }

    const fallbackParent = definition.subgraphs
      .filter((subgraph) => subgraphLeafSets.get(subgraph.id)?.has(leafId))
      .sort(
        (left, right) =>
          (subgraphLeafSets.get(left.id)?.size ?? Number.POSITIVE_INFINITY) -
          (subgraphLeafSets.get(right.id)?.size ?? Number.POSITIVE_INFINITY)
      )[0];
    if (fallbackParent) {
      directParentByLeafId.set(leafId, fallbackParent.id);
    }
  }

  return directParentByLeafId;
}

function createContainerSceneNodes(
  definition: OfficialFlowchartDefinition,
  parserNodesById: Map<string, FlowNode>,
  directParentSubgraphBySubgraphId: Map<string, string>,
  sectionIdBySubgraphId: Map<string, string>,
  clusterLayouts: Map<string, ExtractedNodeLayout>
): MermaidImportSceneNode[] {
  return definition.subgraphs.map((subgraph) => {
    const sectionId = sectionIdBySubgraphId.get(subgraph.id) as string;
    const cluster = clusterLayouts.get(sectionId);
    const parentSubgraphId = directParentSubgraphBySubgraphId.get(subgraph.id);
    const parentId = parentSubgraphId ? sectionIdBySubgraphId.get(parentSubgraphId) : undefined;
    const parserSection = parserNodesById.get(sectionId);

    return {
      id: sectionId,
      kind: 'container',
      label: subgraph.title || String(parserSection?.data?.label ?? sectionId),
      parentId,
      position: { x: cluster?.x ?? 0, y: cluster?.y ?? 0 },
      width: cluster?.width,
      height: cluster?.height,
      sourceNode: parserSection,
    };
  });
}

function createSceneEdges(
  definition: OfficialFlowchartDefinition,
  sectionIdBySubgraphId: Map<string, string>,
  reconciledEdges: ExtractedEdgeLayout[]
): {
  sceneEdges: MermaidImportSceneEdge[];
  matchedEdgeGeometryCount: number;
} {
  const reconciledEdgeBuckets = new Map<string, ExtractedEdgeLayout[]>();
  for (const edge of reconciledEdges) {
    const key = `${edge.source}::${edge.target}`;
    const bucket = reconciledEdgeBuckets.get(key) ?? [];
    bucket.push(edge);
    reconciledEdgeBuckets.set(key, bucket);
  }

  let matchedEdgeGeometryCount = 0;
  const sceneEdges = definition.edges.map((edge, index) => {
    const source = mapEdgeEndpoint(edge.start, sectionIdBySubgraphId);
    const target = mapEdgeEndpoint(edge.end, sectionIdBySubgraphId);
    const key = `${source}::${target}`;
    const matchedGeometry = reconciledEdgeBuckets.get(key)?.shift();
    if (matchedGeometry) {
      matchedEdgeGeometryCount += 1;
    }

    return {
      id: edge.id || `e-mermaid-${index}`,
      source,
      target,
      label: edge.text || undefined,
      stroke: (edge.stroke === 'thick' || edge.stroke === 'dotted' ? edge.stroke : 'normal') as 'normal' | 'thick' | 'dotted',
      routePath: matchedGeometry?.path,
      routePoints: matchedGeometry?.points,
    };
  });

  return { sceneEdges, matchedEdgeGeometryCount };
}

export async function buildOfficialFlowchartImportGraph(
  mermaidSource: string,
  parserNodes: FlowNode[]
): Promise<OfficialFlowchartImportGraph | null> {
  const [definition, rawGeometry] = await Promise.all([
    extractOfficialFlowchartDefinition(mermaidSource),
    extractRawMermaidGeometry(mermaidSource),
  ]);

  if (!definition) {
    return null;
  }

  const parserNodesById = new Map(parserNodes.map((node) => [node.id, node]));
  const parserSectionLeafSets = collectParserSectionLeafSets(parserNodes);
  const parserSections = parserNodes.filter((node) => node.type === 'section');
  const takenIds = new Set(parserNodes.map((node) => node.id));
  const subgraphsById = new Map(definition.subgraphs.map((subgraph) => [subgraph.id, subgraph]));
  const subgraphLeafSets = new Map(
    definition.subgraphs.map((subgraph) => [
      subgraph.id,
      expandSubgraphLeafIds(subgraph.id, subgraphsById),
    ])
  );

  const sectionIdBySubgraphId = new Map<string, string>();
  for (const subgraph of definition.subgraphs) {
    const normalizedSubgraphId = normalizeMermaidImportIdentifier(subgraph.id);
    const rawIdMatch = parserSections.filter((section) => {
      const parserRawId = normalizeMermaidImportIdentifier(
        typeof section.data?.sectionMermaidId === 'string' ? section.data.sectionMermaidId : undefined
      );
      return parserRawId && normalizedSubgraphId && parserRawId === normalizedSubgraphId;
    });
    if (rawIdMatch.length === 1) {
      sectionIdBySubgraphId.set(subgraph.id, rawIdMatch[0].id);
      continue;
    }

    const expectedLeafIds = subgraphLeafSets.get(subgraph.id) ?? new Set<string>();
    const exactLeafMatch = parserSections.filter((section) =>
      mermaidImportSetsAreEqual(parserSectionLeafSets.get(section.id) ?? new Set<string>(), expectedLeafIds)
    );

    if (exactLeafMatch.length === 1) {
      sectionIdBySubgraphId.set(subgraph.id, exactLeafMatch[0].id);
      continue;
    }

    const normalizedTitle = normalizeMermaidImportIdentifier(subgraph.title);
    const titleMatch = parserSections.filter(
      (section) =>
        normalizedTitle &&
        (
          normalizeMermaidImportIdentifier(
            typeof section.data?.sectionMermaidTitle === 'string'
              ? section.data.sectionMermaidTitle
              : undefined
          ) === normalizedTitle
          || normalizeMermaidImportIdentifier(String(section.data?.label ?? '')) === normalizedTitle
        )
    );
    if (titleMatch.length === 1) {
      sectionIdBySubgraphId.set(subgraph.id, titleMatch[0].id);
      continue;
    }

    sectionIdBySubgraphId.set(
      subgraph.id,
      createSyntheticSectionId(subgraph.title || subgraph.id || 'section', takenIds)
    );
  }

  const officialLeafIds = new Set<string>();
  definition.verticesMap.forEach((_, id) => officialLeafIds.add(id));
  definition.edges.forEach((edge) => {
    if (!subgraphsById.has(edge.start)) officialLeafIds.add(edge.start);
    if (!subgraphsById.has(edge.end)) officialLeafIds.add(edge.end);
  });
  for (const leafSet of subgraphLeafSets.values()) {
    for (const id of leafSet) officialLeafIds.add(id);
  }

  if (officialLeafIds.size === 0) {
    return null;
  }

  const leafIds = [...officialLeafIds];
  const directParentSubgraphByLeafId = getDirectParentSubgraphByLeafId(
    leafIds,
    definition,
    subgraphLeafSets
  );
  const directParentSubgraphBySubgraphId = getDirectParentSubgraphBySubgraphId(definition);

  const rawNodeByOfficialId = mapRawNodesByOfficialId(rawGeometry.nodes);
  const { sceneNodes: leafSceneNodes, leafLayouts } = createLeafSceneNodes(
    leafIds,
    parserNodesById,
    rawNodeByOfficialId,
    definition,
    directParentSubgraphByLeafId,
    sectionIdBySubgraphId
  );
  const clusterLayouts = mapClusterLayouts(
    definition.subgraphs,
    subgraphLeafSets,
    sectionIdBySubgraphId,
    rawGeometry,
    leafLayouts
  );
  const containerSceneNodes = createContainerSceneNodes(
    definition,
    parserNodesById,
    directParentSubgraphBySubgraphId,
    sectionIdBySubgraphId,
    clusterLayouts
  );
  const reconciledEdges = reconcileEdges(
    definition,
    rawGeometry,
    leafLayouts,
    [...clusterLayouts.values()],
    sectionIdBySubgraphId
  );
  const { sceneEdges, matchedEdgeGeometryCount } = createSceneEdges(
    definition,
    sectionIdBySubgraphId,
    reconciledEdges
  );

  const scene: MermaidImportScene = {
    nodes: [...leafSceneNodes, ...containerSceneNodes],
    edges: sceneEdges,
  };
  const projected = projectMermaidImportScene(scene);

  const issues: string[] = [];
  if (leafLayouts.length < leafIds.length) {
    issues.push(`matched ${leafLayouts.length}/${leafIds.length} official flowchart nodes`);
  }
  if (clusterLayouts.size < definition.subgraphs.length) {
    issues.push(`matched ${clusterLayouts.size}/${definition.subgraphs.length} official flowchart sections`);
  }
  if (matchedEdgeGeometryCount < projected.edges.length) {
    issues.push(`matched ${matchedEdgeGeometryCount}/${projected.edges.length} official flowchart edge routes`);
  }

  // Normalize direction: TD is an alias for TB
  const rawDir = definition.direction;
  const direction = rawDir === 'TD' ? 'TB' : rawDir;

  return {
    nodes: projected.nodes,
    edges: projected.edges,
    matchedLeafNodeCount: leafLayouts.length,
    totalLeafNodeCount: leafIds.length,
    matchedSectionCount: clusterLayouts.size,
    totalSectionCount: definition.subgraphs.length,
    matchedEdgeGeometryCount,
    totalEdgeCount: projected.edges.length,
    direction,
    reason: issues.length > 0 ? issues.join('; ') : undefined,
  };
}

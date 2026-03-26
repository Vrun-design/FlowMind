import type { FlowEdge, FlowNode } from '@/lib/types';

export interface RevealFrame {
  visibleNodeIds: ReadonlySet<string>;
  visibleEdgeIds: ReadonlySet<string>;
  holdMs: number;
}

interface BfsLevel {
  level: number;
  nodeId: string;
}

function assignBfsLevels(nodes: FlowNode[], edges: FlowEdge[]): BfsLevel[] {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const indegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const n of nodes) {
    indegree.set(n.id, 0);
    adj.set(n.id, []);
  }

  for (const e of edges) {
    if (!nodeIds.has(e.source) || !nodeIds.has(e.target) || e.source === e.target) continue;
    adj.get(e.source)!.push(e.target);
    indegree.set(e.target, (indegree.get(e.target) ?? 0) + 1);
  }

  const levelMap = new Map<string, number>();
  const queue: string[] = nodes
    .filter((n) => (indegree.get(n.id) ?? 0) === 0)
    .map((n) => n.id);

  for (const id of queue) levelMap.set(id, 0);

  let head = 0;
  while (head < queue.length) {
    const id = queue[head++];
    const nextLevel = (levelMap.get(id) ?? 0) + 1;
    for (const neighbor of (adj.get(id) ?? [])) {
      const prev = levelMap.get(neighbor) ?? -1;
      if (nextLevel > prev) levelMap.set(neighbor, nextLevel);
      const deg = (indegree.get(neighbor) ?? 1) - 1;
      indegree.set(neighbor, deg);
      if (deg === 0) queue.push(neighbor);
    }
  }

  // Fallback for nodes in cycles: assign max level + 1
  const maxLevel = levelMap.size > 0 ? Math.max(...levelMap.values()) : 0;
  for (const n of nodes) {
    if (!levelMap.has(n.id)) levelMap.set(n.id, maxLevel + 1);
  }

  return nodes.map((n) => ({ nodeId: n.id, level: levelMap.get(n.id)! }));
}

export function buildRevealFrames(
  nodes: FlowNode[],
  edges: FlowEdge[],
  opts?: { holdMs?: number }
): RevealFrame[] {
  if (nodes.length === 0) return [];

  const holdMs = opts?.holdMs ?? 500;
  const levels = assignBfsLevels(nodes, edges);

  const byLevel = new Map<number, string[]>();
  for (const { nodeId, level } of levels) {
    if (!byLevel.has(level)) byLevel.set(level, []);
    byLevel.get(level)!.push(nodeId);
  }

  const sortedLevels = [...byLevel.keys()].sort((a, b) => a - b);
  const frames: RevealFrame[] = [];
  const visibleNodes = new Set<string>();
  const visibleEdges = new Set<string>();

  for (const lv of sortedLevels) {
    for (const id of byLevel.get(lv)!) visibleNodes.add(id);

    for (const e of edges) {
      if (visibleNodes.has(e.source) && visibleNodes.has(e.target)) {
        visibleEdges.add(e.id);
      }
    }

    frames.push({
      visibleNodeIds: new Set(visibleNodes),
      visibleEdgeIds: new Set(visibleEdges),
      holdMs,
    });
  }

  return frames;
}

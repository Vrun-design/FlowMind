export function normalizeMermaidImportIdentifier(value: string | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
  return normalized || null;
}

export function getMermaidImportCandidateIds(rawId: string | undefined): string[] {
  if (!rawId) return [];

  const candidates = new Set<string>([rawId]);
  const trimmed = rawId.replace(/-\d+$/, '');
  candidates.add(trimmed);
  candidates.add(trimmed.replace(/\d+$/, ''));

  const familySuffixMatch = trimmed.match(
    /(?:^|.*[-_])(?:flowchart|classdiagram|erdiagram|statediagram|sequence|journey|mindmap|architecture)[-_](.+)$/i
  );
  const familySuffix = familySuffixMatch?.[1];
  if (familySuffix) {
    candidates.add(familySuffix);
    candidates.add(familySuffix.replace(/-\d+$/, ''));
    candidates.add(familySuffix.replace(/\d+$/, ''));
  }

  const withoutPrefix = trimmed.replace(
    /^(flowchart|classdiagram|erdiagram|statediagram|sequence|journey|mindmap|architecture)[-_]/i,
    ''
  );
  candidates.add(withoutPrefix);
  candidates.add(withoutPrefix.replace(/\d+$/, ''));

  const withoutClusterPrefix = trimmed.replace(/^cluster[_-]/i, '');
  candidates.add(withoutClusterPrefix);
  candidates.add(withoutClusterPrefix.replace(/^subgraph/i, ''));
  candidates.add(withoutClusterPrefix.replace(/^subgraph/i, '').replace(/\d+$/, ''));

  return [...candidates].filter(Boolean);
}

export function mermaidImportSetsAreEqual(left: Set<string>, right: Set<string>): boolean {
  if (left.size !== right.size) return false;
  for (const value of left) {
    if (!right.has(value)) return false;
  }
  return true;
}

export function isMermaidImportPointInsideBounds(
  point: { x: number; y: number },
  bounds: Pick<{ x: number; y: number; width: number; height: number }, 'x' | 'y' | 'width' | 'height'>
): boolean {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
}

import { Position } from '@/lib/reactflowCompat';
import type {
  EdgePathParams,
  EdgePathResult,
  LoopDirection,
  SelfLoopResult,
} from './pathUtilsTypes';

const POLYLINE_EPSILON = 0.5;

function isNearlySamePoint(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  return Math.abs(a.x - b.x) <= POLYLINE_EPSILON && Math.abs(a.y - b.y) <= POLYLINE_EPSILON;
}

export function normalizePolylinePoints(points: { x: number; y: number }[]): { x: number; y: number }[] {
  const deduped: { x: number; y: number }[] = [];

  for (const point of points) {
    if (deduped.length === 0 || !isNearlySamePoint(deduped[deduped.length - 1], point)) {
      deduped.push(point);
    }
  }

  if (deduped.length <= 2) {
    return deduped;
  }

  const normalized: { x: number; y: number }[] = [deduped[0]];
  for (let index = 1; index < deduped.length - 1; index += 1) {
    const previous = normalized[normalized.length - 1];
    const current = deduped[index];
    const next = deduped[index + 1];
    const sameX =
      Math.abs(previous.x - current.x) <= POLYLINE_EPSILON
      && Math.abs(current.x - next.x) <= POLYLINE_EPSILON;
    const sameY =
      Math.abs(previous.y - current.y) <= POLYLINE_EPSILON
      && Math.abs(current.y - next.y) <= POLYLINE_EPSILON;

    if (!sameX && !sameY) {
      normalized.push(current);
    }
  }
  normalized.push(deduped[deduped.length - 1]);

  return normalized;
}

export function applyAnchorClearance(
  point: { x: number; y: number },
  position: Position,
  clearance: number,
): { x: number; y: number } {
  if (clearance <= 0) {
    return point;
  }

  switch (position) {
    case Position.Top:
      return { x: point.x, y: point.y - clearance };
    case Position.Bottom:
      return { x: point.x, y: point.y + clearance };
    case Position.Left:
      return { x: point.x - clearance, y: point.y };
    case Position.Right:
      return { x: point.x + clearance, y: point.y };
    default:
      return point;
  }
}

export function getElkLabelPosition(
  sourceX: number,
  sourceY: number,
  points: { x: number; y: number }[],
): { x: number; y: number } {
  if (points.length === 0) {
    return { x: sourceX, y: sourceY };
  }

  if (points.length === 1) {
    return points[0];
  }

  const middleIndex = Math.floor(points.length / 2);
  if (points.length % 2 === 0) {
    const firstPoint = points[middleIndex - 1];
    const secondPoint = points[middleIndex];
    return {
      x: (firstPoint.x + secondPoint.x) / 2,
      y: (firstPoint.y + secondPoint.y) / 2,
    };
  }

  return points[middleIndex];
}

function nudgeLabelByBundleOffset(
  label: { x: number; y: number },
  params: Pick<EdgePathParams, 'sourcePosition' | 'targetPosition'>,
  bundleOffset: number,
): { x: number; y: number } {
  if (bundleOffset === 0) {
    return label;
  }

  const labelNudge = bundleOffset * 0.7;
  const usesVerticalSpread =
    params.sourcePosition === Position.Left
    || params.sourcePosition === Position.Right
    || params.targetPosition === Position.Left
    || params.targetPosition === Position.Right;

  return usesVerticalSpread
    ? { x: label.x, y: label.y + labelNudge }
    : { x: label.x + labelNudge, y: label.y };
}

export function withBundledLabelOffset(
  edgePath: string,
  labelX: number,
  labelY: number,
  params: Pick<EdgePathParams, 'sourcePosition' | 'targetPosition'>,
  bundleOffset: number,
): EdgePathResult {
  const nudgedLabel = nudgeLabelByBundleOffset({ x: labelX, y: labelY }, params, bundleOffset);
  return { edgePath, labelX: nudgedLabel.x, labelY: nudgedLabel.y };
}

export function getPathMidpoint(points: { x: number; y: number }[]): { x: number; y: number } {
  if (points.length <= 1) {
    return points[0] ?? { x: 0, y: 0 };
  }

  const segmentLengths = [];
  let totalLength = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const length = Math.hypot(end.x - start.x, end.y - start.y);
    segmentLengths.push(length);
    totalLength += length;
  }

  let remaining = totalLength / 2;
  for (let index = 0; index < segmentLengths.length; index += 1) {
    const length = segmentLengths[index];
    if (remaining <= length && length > 0) {
      const start = points[index];
      const end = points[index + 1];
      const ratio = remaining / length;
      return {
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      };
    }
    remaining -= length;
  }

  return points[Math.floor(points.length / 2)];
}

export function getSelfLoopPath(
  sourceX: number,
  sourceY: number,
  nodeWidth = 180,
  nodeHeight = 60,
  loopDirection: LoopDirection = 'right',
): SelfLoopResult {
  const size = Math.max(nodeWidth, nodeHeight) * 0.5;
  const offset = size * 0.8;

  switch (loopDirection) {
    case 'top':
      return {
        path: `M ${sourceX - 15} ${sourceY} C ${sourceX - offset} ${sourceY - size * 1.5}, ${sourceX + offset} ${sourceY - size * 1.5}, ${sourceX + 15} ${sourceY}`,
        labelX: sourceX,
        labelY: sourceY - size * 1.2,
      };
    case 'left':
      return {
        path: `M ${sourceX} ${sourceY - 15} C ${sourceX - size * 1.5} ${sourceY - offset}, ${sourceX - size * 1.5} ${sourceY + offset}, ${sourceX} ${sourceY + 15}`,
        labelX: sourceX - size * 1.2,
        labelY: sourceY,
      };
    case 'bottom':
      return {
        path: `M ${sourceX - 15} ${sourceY} C ${sourceX - offset} ${sourceY + size * 1.5}, ${sourceX + offset} ${sourceY + size * 1.5}, ${sourceX + 15} ${sourceY}`,
        labelX: sourceX,
        labelY: sourceY + size * 1.2,
      };
    case 'right':
    default:
      return {
        path: `M ${sourceX} ${sourceY - 15} C ${sourceX + size * 1.5} ${sourceY - offset}, ${sourceX + size * 1.5} ${sourceY + offset}, ${sourceX} ${sourceY + 15}`,
        labelX: sourceX + size * 1.2,
        labelY: sourceY,
      };
  }
}

export function getOffsetVector(position: Position, offset: number): { x: number; y: number } {
  switch (position) {
    case Position.Top:
    case Position.Bottom:
      return { x: offset, y: 0 };
    case Position.Left:
    case Position.Right:
      return { x: 0, y: offset };
    default:
      return { x: 0, y: 0 };
  }
}

export function getLoopDirection(position: Position): LoopDirection {
  switch (position) {
    case Position.Top:
      return 'top';
    case Position.Left:
      return 'left';
    case Position.Bottom:
      return 'bottom';
    case Position.Right:
    default:
      return 'right';
  }
}

export function buildMindmapRootBranchPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
): EdgePathResult {
  const direction = targetX >= sourceX ? 1 : -1;
  const horizontalDistance = Math.abs(targetX - sourceX);
  const trunkLength = Math.min(96, Math.max(56, horizontalDistance * 0.18));
  const sourceControlX = sourceX + direction * trunkLength * 0.5;
  const bundleX = sourceX + direction * trunkLength;
  const targetControlX = targetX - direction * Math.min(100, Math.max(60, horizontalDistance * 0.24));
  const edgePath = [
    `M ${sourceX} ${sourceY}`,
    `C ${sourceControlX} ${sourceY}, ${bundleX} ${sourceY}, ${bundleX} ${sourceY}`,
    `C ${bundleX + direction * 28} ${sourceY}, ${targetControlX} ${targetY}, ${targetX} ${targetY}`,
  ].join(' ');

  return {
    edgePath,
    labelX: (bundleX + targetX) / 2,
    labelY: (sourceY + targetY) / 2,
  };
}

export function buildMindmapTopicBranchPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
): EdgePathResult {
  const direction = targetX >= sourceX ? 1 : -1;
  const horizontalDistance = Math.abs(targetX - sourceX);
  const trunkLength = Math.min(68, Math.max(34, horizontalDistance * 0.16));
  const sourceControlX = sourceX + direction * trunkLength * 0.55;
  const bundleX = sourceX + direction * trunkLength;
  const targetControlX = targetX - direction * Math.min(72, Math.max(42, horizontalDistance * 0.2));
  const edgePath = [
    `M ${sourceX} ${sourceY}`,
    `C ${sourceControlX} ${sourceY}, ${bundleX} ${sourceY}, ${bundleX} ${sourceY}`,
    `C ${bundleX + direction * 18} ${sourceY}, ${targetControlX} ${targetY}, ${targetX} ${targetY}`,
  ].join(' ');

  return {
    edgePath,
    labelX: (bundleX + targetX) / 2,
    labelY: (sourceY + targetY) / 2,
  };
}

export function buildRoundedPolylinePath(points: { x: number; y: number }[], cornerRadius: number): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const next = points[index + 1];

    const toPrev = Math.hypot(current.x - previous.x, current.y - previous.y);
    const toNext = Math.hypot(next.x - current.x, next.y - current.y);
    const radius = Math.min(cornerRadius, toPrev / 2, toNext / 2);

    if (radius < 1) {
      path += ` L ${current.x} ${current.y}`;
      continue;
    }

    const entryX = current.x + ((previous.x - current.x) / toPrev) * radius;
    const entryY = current.y + ((previous.y - current.y) / toPrev) * radius;
    const exitX = current.x + ((next.x - current.x) / toNext) * radius;
    const exitY = current.y + ((next.y - current.y) / toNext) * radius;

    path += ` L ${entryX} ${entryY} Q ${current.x} ${current.y} ${exitX} ${exitY}`;
  }

  const last = points[points.length - 1];
  path += ` L ${last.x} ${last.y}`;

  return path;
}

export function enforceMinimumEndpointLead(
  points: { x: number; y: number }[],
  sourcePosition: Position,
  targetPosition: Position,
  minimumLead = 12,
): { x: number; y: number }[] {
  if (points.length < 3) {
    return points;
  }

  const nextPoints = points.map((point) => ({ ...point }));

  const shiftSourceLead = (): void => {
    const source = nextPoints[0];
    const first = nextPoints[1];

    if (sourcePosition === Position.Left || sourcePosition === Position.Right) {
      if (Math.abs(first.y - source.y) > 0.5) return;
      const delta = Math.abs(first.x - source.x);
      if (delta >= minimumLead) return;
      const desiredX = source.x + (sourcePosition === Position.Right ? minimumLead : -minimumLead);
      const sharedX = first.x;
      for (let index = 1; index < nextPoints.length; index += 1) {
        if (Math.abs(nextPoints[index].x - sharedX) > 0.5) break;
        nextPoints[index].x = desiredX;
      }
      return;
    }

    if (Math.abs(first.x - source.x) > 0.5) return;
    const delta = Math.abs(first.y - source.y);
    if (delta >= minimumLead) return;
    const desiredY = source.y + (sourcePosition === Position.Bottom ? minimumLead : -minimumLead);
    const sharedY = first.y;
    for (let index = 1; index < nextPoints.length; index += 1) {
      if (Math.abs(nextPoints[index].y - sharedY) > 0.5) break;
      nextPoints[index].y = desiredY;
    }
  };

  const shiftTargetLead = (): void => {
    const target = nextPoints[nextPoints.length - 1];
    const lastInterior = nextPoints[nextPoints.length - 2];

    if (targetPosition === Position.Left || targetPosition === Position.Right) {
      if (Math.abs(lastInterior.y - target.y) > 0.5) return;
      const delta = Math.abs(target.x - lastInterior.x);
      if (delta >= minimumLead) return;
      const desiredX = target.x + (targetPosition === Position.Right ? -minimumLead : minimumLead);
      const sharedX = lastInterior.x;
      for (let index = nextPoints.length - 2; index >= 0; index -= 1) {
        if (Math.abs(nextPoints[index].x - sharedX) > 0.5) break;
        nextPoints[index].x = desiredX;
      }
      return;
    }

    if (Math.abs(lastInterior.x - target.x) > 0.5) return;
    const delta = Math.abs(target.y - lastInterior.y);
    if (delta >= minimumLead) return;
    const desiredY = target.y + (targetPosition === Position.Bottom ? -minimumLead : minimumLead);
    const sharedY = lastInterior.y;
    for (let index = nextPoints.length - 2; index >= 0; index -= 1) {
      if (Math.abs(nextPoints[index].y - sharedY) > 0.5) break;
      nextPoints[index].y = desiredY;
    }
  };

  shiftSourceLead();
  shiftTargetLead();
  return normalizePolylinePoints(nextPoints);
}

export function buildElkEndpointBridge(
  anchor: { x: number; y: number },
  routePoint: { x: number; y: number } | undefined,
  position: Position,
  minimumLead = 12,
  direction: 'source' | 'target' = 'source',
): { x: number; y: number }[] {
  if (!routePoint) {
    return [];
  }

  const bridge: { x: number; y: number }[] = [];

  if (position === Position.Left || position === Position.Right) {
    const leadSign = position === Position.Right ? 1 : -1;
    const leadX = anchor.x + leadSign * minimumLead;

    if (direction === 'source') {
      bridge.push({ x: leadX, y: anchor.y });
      bridge.push({ x: leadX, y: routePoint.y });
    } else {
      bridge.push({ x: leadX, y: routePoint.y });
      bridge.push({ x: leadX, y: anchor.y });
    }
  } else {
    const leadSign = position === Position.Bottom ? 1 : -1;
    const leadY = anchor.y + leadSign * minimumLead;

    if (direction === 'source') {
      bridge.push({ x: anchor.x, y: leadY });
      bridge.push({ x: routePoint.x, y: leadY });
    } else {
      bridge.push({ x: routePoint.x, y: leadY });
      bridge.push({ x: anchor.x, y: leadY });
    }
  }

  return normalizePolylinePoints([anchor, ...bridge, routePoint]).slice(1, -1);
}

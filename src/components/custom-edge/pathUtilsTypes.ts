import type { Position } from '@/lib/reactflowCompat';

export interface MinimalEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface MinimalNode {
  id: string;
  position?: { x: number; y: number };
  positionAbsolute?: { x: number; y: number };
  width?: number;
  height?: number;
  data?: {
    shape?: string;
  };
}

export interface EdgePathParams {
  id: string;
  source: string;
  target: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  sourceHandleId?: string | null;
  targetHandleId?: string | null;
}

export type EdgeVariant = 'bezier' | 'smoothstep' | 'step' | 'straight';
export type LoopDirection = 'right' | 'top' | 'left' | 'bottom';

export interface EdgePathOptions {
  forceOrthogonal?: boolean;
  elkPoints?: { x: number; y: number }[];
  mindmapBranchKind?: 'root' | 'branch';
  routingMode?: 'auto' | 'elk' | 'manual';
  waypoints?: { x: number; y: number }[];
  waypoint?: {
    x: number;
    y: number;
  };
}

export interface SelfLoopResult {
  path: string;
  labelX: number;
  labelY: number;
}

export interface EdgePathResult {
  edgePath: string;
  labelX: number;
  labelY: number;
}

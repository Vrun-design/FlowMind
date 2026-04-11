import React, { memo } from 'react';
import type { LegacyEdgeProps } from '@/lib/reactflowCompat';
import type { EdgeData } from '@/lib/types';
import { useCinematicExportState } from '@/context/CinematicExportContext';
import {
  SEQ_BOX_H,
  SEQ_ACTOR_EXTRA_H,
  SEQ_MSG_OFFSET,
  SEQ_MSG_SPACING,
} from '@/services/sequence/layoutConstants';

// Resolved at edge render time from source node data (passed via edge data).
const SELF_LOOP_W = 56;
const SELF_LOOP_H = 28;
const LABEL_FONT_SIZE = 11;
const LABEL_OFFSET_Y = -5;
const CINEMATIC_EDGE_GLOW_COLOR = 'rgba(59,130,246,0.2)';
const CINEMATIC_EDGE_MARKER_THRESHOLD = 0.995;

function buildPathRevealProps(progress: number): { pathLength: number; strokeDasharray: number; strokeDashoffset: number } {
  return {
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: Math.max(0, 1 - progress),
  };
}

function arrowMarkerDef(id: string, color: string, open: boolean): React.ReactElement {
  return (
    <defs>
      <marker
        id={id}
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        {open ? (
          <polyline points="0,0 9,3.5 0,7" fill="none" stroke={color} strokeWidth="1.5" />
        ) : (
          <polygon points="0,0 9,3.5 0,7" fill={color} />
        )}
      </marker>
    </defs>
  );
}

function SequenceMessageEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  data,
  label,
  source,
  target,
}: LegacyEdgeProps<EdgeData>): React.ReactElement {
  const cinematicExportState = useCinematicExportState();
  const order = (data as { seqMessageOrder?: number })?.seqMessageOrder ?? 0;
  const kind = (data as { seqMessageKind?: string })?.seqMessageKind ?? 'sync';
  const sourceIsActor = Boolean((data as { sourceIsActor?: boolean })?.sourceIsActor);
  const targetIsActor = Boolean((data as { targetIsActor?: boolean })?.targetIsActor);

  // Y position for this message arrow, relative to top of source node
  const headerH = SEQ_BOX_H + (sourceIsActor ? SEQ_ACTOR_EXTRA_H : 0);
  const msgY = sourceY + headerH + SEQ_MSG_OFFSET + order * SEQ_MSG_SPACING;

  const isSelf = source === target;
  const isDashed = kind === 'return';
  const isOpen = kind === 'async' || kind === 'destroy';
  const strokeColor = '#64748b';
  const markerId = `seq-arrow-${id}`;
  const cinematicActive = cinematicExportState.active;
  const isBuiltCinematicEdge = cinematicExportState.builtEdgeIds.has(id);
  const isActiveCinematicEdge = cinematicExportState.activeEdgeId === id;
  const cinematicEdgeProgress = isActiveCinematicEdge ? cinematicExportState.activeEdgeProgress : 0;
  const showLabel = !cinematicActive || isBuiltCinematicEdge || (isActiveCinematicEdge && cinematicEdgeProgress >= 0.85);
  const showAnimatedMarker = cinematicEdgeProgress >= CINEMATIC_EDGE_MARKER_THRESHOLD;
  const pathRevealProps = cinematicActive && isActiveCinematicEdge
    ? buildPathRevealProps(cinematicEdgeProgress)
    : {};
  const glowPathProps = cinematicActive && isActiveCinematicEdge
    ? {
        ...pathRevealProps,
        stroke: CINEMATIC_EDGE_GLOW_COLOR,
        strokeWidth: 5,
      }
    : null;

  // Center X of source and target participants
  const sx = sourceX;
  const tx = isSelf ? sourceX : targetX;

  if (isSelf) {
    // Self-message: right-side loop
    const loopPath = [
      `M ${sx} ${msgY}`,
      `h ${SELF_LOOP_W}`,
      `v ${SELF_LOOP_H}`,
      `H ${sx}`,
    ].join(' ');
    const labelX = sx + SELF_LOOP_W + 4;
    const labelY = msgY + SELF_LOOP_H / 2;

    return (
      <g>
        {arrowMarkerDef(markerId, strokeColor, isOpen)}
        {!cinematicActive || isBuiltCinematicEdge ? (
          <path
            d={loopPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={1.5}
            strokeDasharray={isDashed ? '6 3' : undefined}
            markerEnd={`url(#${markerId})`}
          />
        ) : null}
        {cinematicActive && isActiveCinematicEdge ? (
          <>
            {glowPathProps ? (
              <path
                d={loopPath}
                fill="none"
                pointerEvents="none"
                {...glowPathProps}
              />
            ) : null}
            <path
              d={loopPath}
              fill="none"
              stroke={strokeColor}
              strokeWidth={1.5}
              markerEnd={showAnimatedMarker ? `url(#${markerId})` : undefined}
              {...pathRevealProps}
            />
          </>
        ) : null}
        {label && showLabel ? (
          <text
            x={labelX}
            y={labelY}
            fontSize={LABEL_FONT_SIZE}
            fill="#475569"
            dominantBaseline="middle"
          >
            {String(label)}
          </text>
        ) : null}
      </g>
    );
  }

  // Direction — arrow points from source toward target
  const goingRight = tx > sx;
  const arrowPath = `M ${sx} ${msgY} H ${tx}`;
  const labelX = (sx + tx) / 2;
  const labelY = msgY + LABEL_OFFSET_Y;
  const _ = targetIsActor; // consumed to avoid lint unused

  return (
    <g>
      {arrowMarkerDef(markerId, strokeColor, isOpen)}
      {!cinematicActive || isBuiltCinematicEdge ? (
        <path
          d={arrowPath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeDasharray={isDashed ? '6 3' : undefined}
          markerEnd={goingRight ? `url(#${markerId})` : undefined}
          markerStart={!goingRight ? `url(#${markerId})` : undefined}
        />
      ) : null}
      {cinematicActive && isActiveCinematicEdge ? (
        <>
          {glowPathProps ? (
            <path
              d={arrowPath}
              fill="none"
              pointerEvents="none"
              {...glowPathProps}
            />
          ) : null}
          <path
            d={arrowPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={1.5}
            markerEnd={goingRight && showAnimatedMarker ? `url(#${markerId})` : undefined}
            markerStart={!goingRight && showAnimatedMarker ? `url(#${markerId})` : undefined}
            {...pathRevealProps}
          />
        </>
      ) : null}
      {label && showLabel ? (
        <text
          x={labelX}
          y={labelY}
          fontSize={LABEL_FONT_SIZE}
          fill="#475569"
          textAnchor="middle"
          dominantBaseline="auto"
        >
          {String(label)}
        </text>
      ) : null}
    </g>
  );
}

export default memo(SequenceMessageEdge);

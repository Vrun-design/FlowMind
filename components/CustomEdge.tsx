import React, { useCallback, useRef } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, getSmoothStepPath, getStraightPath, useReactFlow, useViewport } from 'reactflow';
import { EdgeData } from '../types';

// Generic wrapper for custom edge logic (movable labels)
// Generic wrapper for custom edge logic (movable labels)
const CustomEdgeWrapper = ({
    id,
    path,
    labelX,
    labelY,
    markerEnd,
    style,
    data,
    label,
}: {
    id: string;
    path: string;
    labelX: number;
    labelY: number;
    markerEnd?: string;
    style?: React.CSSProperties;
    data?: EdgeData;
    label?: string | React.ReactNode;
}) => {
    const { setEdges, screenToFlowPosition } = useReactFlow();
    const { zoom } = useViewport();
    const pathRef = useRef<SVGPathElement>(null);

    // Calculate position along path if available
    let posX = labelX;
    let posY = labelY;

    // Use a layout effect to force update if pathRef becomes available? 
    // For now, we rely on the fact that pathRef is usually available on subsequent renders.
    // If labelPosition is 0.5 (default), labelX/Y (center) is correct.
    if (pathRef.current && typeof data?.labelPosition === 'number') {
        const len = pathRef.current.getTotalLength();
        const point = pathRef.current.getPointAtLength(len * data.labelPosition);
        posX = point.x;
        posY = point.y;
    }

    const onLabelPointerDown = (event: React.PointerEvent) => {
        event.stopPropagation();
        event.preventDefault();
        const pathNode = pathRef.current;
        if (!pathNode) return;

        const onPointerMove = (e: PointerEvent) => {
            e.preventDefault();
            // Get mouse in flow coords
            const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });

            // Find closest point on path
            const pathLen = pathNode.getTotalLength();
            let bestLen = 0;
            let bestDist = Infinity;

            // Precision scan (every 10px) - robust enough for UI
            for (let l = 0; l <= pathLen; l += 10) {
                const p = pathNode.getPointAtLength(l);
                const dx = p.x - flowPos.x;
                const dy = p.y - flowPos.y;
                const d = dx * dx + dy * dy;
                if (d < bestDist) {
                    bestDist = d;
                    bestLen = l;
                }
            }

            // Refine scan around bestLen
            for (let l = Math.max(0, bestLen - 10); l <= Math.min(pathLen, bestLen + 10); l += 1) {
                const p = pathNode.getPointAtLength(l);
                const dx = p.x - flowPos.x;
                const dy = p.y - flowPos.y;
                const d = dx * dx + dy * dy;
                if (d < bestDist) {
                    bestDist = d;
                    bestLen = l;
                }
            }

            // Update data
            const newPos = bestLen / pathLen;

            setEdges((edges) => edges.map((edge) => {
                if (edge.id === id) {
                    return {
                        ...edge,
                        data: {
                            ...edge.data,
                            labelPosition: newPos,
                            labelOffsetX: 0,
                            labelOffsetY: 0
                        }
                    };
                }
                return edge;
            }));
        };

        const onPointerUp = (e: PointerEvent) => {
            e.preventDefault();
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    return (
        <>
            <BaseEdge path={path} markerEnd={markerEnd} style={style} />
            <path ref={pathRef} d={path} style={{ display: 'none' }} fill="none" stroke="none" aria-hidden="true" />

            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${posX}px,${posY}px)`,
                            fontSize: 12,
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan"
                    >
                        <div
                            onPointerDown={onLabelPointerDown}
                            className="bg-white px-2 py-1 rounded border border-slate-200 shadow-sm text-xs font-medium text-slate-600 cursor-move hover:ring-2 hover:ring-indigo-500/20 active:ring-indigo-500 select-none"
                        >
                            {label}
                        </div>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export const CustomBezierEdge = (props: EdgeProps<EdgeData>) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX: props.sourceX,
        sourceY: props.sourceY,
        sourcePosition: props.sourcePosition,
        targetX: props.targetX,
        targetY: props.targetY,
        targetPosition: props.targetPosition,
    });

    return <CustomEdgeWrapper id={props.id} path={edgePath} labelX={labelX} labelY={labelY} {...props} />;
};

export const CustomSmoothStepEdge = (props: EdgeProps<EdgeData>) => {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX: props.sourceX,
        sourceY: props.sourceY,
        sourcePosition: props.sourcePosition,
        targetX: props.targetX,
        targetY: props.targetY,
        targetPosition: props.targetPosition,
    });

    return <CustomEdgeWrapper id={props.id} path={edgePath} labelX={labelX} labelY={labelY} {...props} />;
};

export const CustomStepEdge = (props: EdgeProps<EdgeData>) => {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX: props.sourceX,
        sourceY: props.sourceY,
        sourcePosition: props.sourcePosition,
        targetX: props.targetX,
        targetY: props.targetY,
        targetPosition: props.targetPosition,
        borderRadius: 0,
    });

    return <CustomEdgeWrapper id={props.id} path={edgePath} labelX={labelX} labelY={labelY} {...props} />;
};

// Default export for backward compatibility if needed, aliasing SmoothStep
export default CustomSmoothStepEdge;

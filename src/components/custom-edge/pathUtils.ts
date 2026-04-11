import { getBezierPath, getSmoothStepPath, getStraightPath, Position } from '@/lib/reactflowCompat';
import { isEdgeInteractionLowDetailModeActive } from './edgeRenderMode';
import { measureDevPerformance } from '@/lib/devPerformance';
import {
    applyAnchorClearance,
    buildMindmapRootBranchPath,
    buildMindmapTopicBranchPath,
    buildRoundedPolylinePath,
    enforceMinimumEndpointLead,
    getElkLabelPosition,
    getLoopDirection,
    getOffsetVector,
    getPathMidpoint,
    getSelfLoopPath,
    withBundledLabelOffset,
} from './pathUtilsGeometry';
import {
    getEndpointFanoutOffset,
    getEndpointSiblingCount,
    getNodeById,
    getParallelEdgeOffset,
    getShapeAwareElkAnchorClearance,
} from './pathUtilsSiblingRouting';
import type {
    EdgePathOptions,
    EdgePathParams,
    EdgePathResult,
    EdgeVariant,
    MinimalEdge,
    MinimalNode,
} from './pathUtilsTypes';

const EDGE_ROUTING_FAST_PATH_THRESHOLD = 600;

function isDecisionLikeShape(shape: string | undefined): boolean {
    return shape === 'diamond';
}

function shouldKeepMermaidBranchSpread(
    preserveMermaidEndpoints: boolean,
    shape: string | undefined
): boolean {
    return preserveMermaidEndpoints && isDecisionLikeShape(shape);
}

function getMermaidPreservedAnchorClearance(
    preserveMermaidEndpoints: boolean,
    isContainer: boolean | undefined,
    shape: string | undefined
): number {
    if (!preserveMermaidEndpoints) {
        return 0;
    }

    const containerClearance = isContainer ? 14 : 0;
    return Math.max(containerClearance, getShapeAwareElkAnchorClearance(shape));
}

export function buildEdgePath(
    params: EdgePathParams,
    allEdges: MinimalEdge[],
    allNodes: MinimalNode[],
    variant: EdgeVariant,
    options: EdgePathOptions = {}
): EdgePathResult {
    return measureDevPerformance('buildEdgePath', () => {
        const sourceNode = getNodeById(allNodes, params.source);
        const targetNode = getNodeById(allNodes, params.target);
        const useMermaidPreservedEndpointRouting = options.mermaidPreservedEndpoints === true;
        const effectiveForceOrthogonal = options.forceOrthogonal || useMermaidPreservedEndpointRouting;
        const keepMermaidSourceBranchSpread =
            shouldKeepMermaidBranchSpread(useMermaidPreservedEndpointRouting, sourceNode?.data?.shape);
        const keepMermaidTargetBranchSpread =
            shouldKeepMermaidBranchSpread(useMermaidPreservedEndpointRouting, targetNode?.data?.shape);
        const sourceMermaidAnchorClearance = getMermaidPreservedAnchorClearance(
            useMermaidPreservedEndpointRouting,
            options.mermaidSourceContainer,
            sourceNode?.data?.shape
        );
        const targetMermaidAnchorClearance = getMermaidPreservedAnchorClearance(
            useMermaidPreservedEndpointRouting,
            options.mermaidTargetContainer,
            targetNode?.data?.shape
        );
        const interactionLowDetailModeActive = isEdgeInteractionLowDetailModeActive();
        const graphRoutingFastPathActive = interactionLowDetailModeActive || allEdges.length >= EDGE_ROUTING_FAST_PATH_THRESHOLD;
        const pairOffset = graphRoutingFastPathActive || useMermaidPreservedEndpointRouting
            ? 0
            : getParallelEdgeOffset(params.id, params.source, params.target, allEdges);
        const sourceSiblingCount = graphRoutingFastPathActive || (useMermaidPreservedEndpointRouting && !keepMermaidSourceBranchSpread)
            ? 0
            : getEndpointSiblingCount(allEdges, allNodes, {
                nodeId: params.source,
                handleId: params.sourceHandleId,
                direction: 'source',
            });
        const sourceFanoutOffset = graphRoutingFastPathActive || (useMermaidPreservedEndpointRouting && !keepMermaidSourceBranchSpread)
            ? 0
            : getEndpointFanoutOffset(params.id, allEdges, allNodes, {
                nodeId: params.source,
                handleId: params.sourceHandleId,
                direction: 'source',
            }) * (useMermaidPreservedEndpointRouting ? 0.75 : 1);
        const targetFanoutOffset = graphRoutingFastPathActive || (useMermaidPreservedEndpointRouting && !keepMermaidTargetBranchSpread)
            ? 0
            : getEndpointFanoutOffset(params.id, allEdges, allNodes, {
                nodeId: params.target,
                handleId: params.targetHandleId,
                direction: 'target',
            }) * (useMermaidPreservedEndpointRouting ? 0.75 : 1);
        const labelBundleOffset = pairOffset + (sourceFanoutOffset + targetFanoutOffset) / 2;

        if (params.source === params.target) {
            const loop = getSelfLoopPath(
                params.sourceX,
                params.sourceY,
                sourceNode?.width ?? 180,
                sourceNode?.height ?? 60,
                getLoopDirection(params.sourcePosition)
            );
            return withBundledLabelOffset(
                loop.path,
                loop.labelX,
                loop.labelY,
                params,
                labelBundleOffset
            );
        }

        const shouldUseElkRoute =
            options.routingMode !== 'manual'
            && options.elkPoints
            && options.elkPoints.length > 0;

        const shouldUseImportedFixedRoute =
            options.routingMode === 'import-fixed'
            && (
                typeof options.importRoutePath === 'string'
                || (options.importRoutePoints?.length ?? 0) > 0
            );

        if (shouldUseImportedFixedRoute) {
            const importRoutePoints = options.importRoutePoints ?? [];
            const importRoutePath = options.importRoutePath;

            // Safety check: if the imported route's first point is more than 150px away from
            // the actual ReactFlow handle position, the coordinates are in a different space
            // (e.g. Mermaid SVG user-units vs ReactFlow canvas coordinates). In that case,
            // skip the fixed route and fall back to smoothstep so edges are never disconnected.
            const IMPORT_ROUTE_COORDINATE_MISMATCH_THRESHOLD = 150;
            const firstPoint = importRoutePoints[0];
            const coordinatesMismatch =
                firstPoint !== undefined &&
                Math.hypot(
                    firstPoint.x - params.sourceX,
                    firstPoint.y - params.sourceY
                ) > IMPORT_ROUTE_COORDINATE_MISMATCH_THRESHOLD;

            if (!coordinatesMismatch) {
                const labelPoint = importRoutePoints.length > 1
                    ? getPathMidpoint(importRoutePoints)
                    : importRoutePoints[0] ?? {
                        x: (params.sourceX + params.targetX) / 2,
                        y: (params.sourceY + params.targetY) / 2,
                    };
                const pathStr = typeof importRoutePath === 'string' && importRoutePath.trim().length > 0
                    ? importRoutePath
                    : buildRoundedPolylinePath(importRoutePoints, 12);

                return withBundledLabelOffset(pathStr, labelPoint.x, labelPoint.y, params, labelBundleOffset);
            }
            // Coordinate mismatch detected — fall through to smoothstep routing below.
        }

        if (shouldUseElkRoute) {
            const points = options.elkPoints;
            const adjustedSource = applyAnchorClearance(
                { x: params.sourceX, y: params.sourceY },
                params.sourcePosition,
                getShapeAwareElkAnchorClearance(sourceNode?.data?.shape)
            );
            const adjustedTarget = applyAnchorClearance(
                { x: params.targetX, y: params.targetY },
                params.targetPosition,
                getShapeAwareElkAnchorClearance(targetNode?.data?.shape)
            );
            const allPoints = enforceMinimumEndpointLead(
                [adjustedSource, ...points, adjustedTarget],
                params.sourcePosition,
                params.targetPosition
            );
            const pathStr = buildRoundedPolylinePath(allPoints, 20);
            const { x: labelX, y: labelY } = getElkLabelPosition(adjustedSource.x, adjustedSource.y, points);

            return withBundledLabelOffset(pathStr, labelX, labelY, params, labelBundleOffset);
        }

        const isMindmapBranch = Boolean(options.mindmapBranchKind) && variant === 'bezier' && !effectiveForceOrthogonal;
        const isMindmapRootBranch = options.mindmapBranchKind === 'root' && isMindmapBranch;
        const shouldUseSharedSourceTrunk =
            !isMindmapBranch
            && (variant === 'smoothstep' || variant === 'step' || effectiveForceOrthogonal)
            && sourceSiblingCount >= 3
            && (
                params.sourcePosition === Position.Left
                || params.sourcePosition === Position.Right
                || params.sourcePosition === Position.Top
                || params.sourcePosition === Position.Bottom
            )
            && (
                params.targetPosition === Position.Left
                || params.targetPosition === Position.Right
                || params.targetPosition === Position.Top
                || params.targetPosition === Position.Bottom
            );
        const sourceOffset = getOffsetVector(
            params.sourcePosition,
            pairOffset + ((isMindmapBranch || shouldUseSharedSourceTrunk) ? 0 : sourceFanoutOffset)
        );
        const targetOffset = getOffsetVector(params.targetPosition, pairOffset + targetFanoutOffset);
        const sourcePoint = applyAnchorClearance(
            { x: params.sourceX + sourceOffset.x, y: params.sourceY + sourceOffset.y },
            params.sourcePosition,
            sourceMermaidAnchorClearance
        );
        const targetPoint = applyAnchorClearance(
            { x: params.targetX + targetOffset.x, y: params.targetY + targetOffset.y },
            params.targetPosition,
            targetMermaidAnchorClearance
        );
        const sourceX = sourcePoint.x;
        const sourceY = sourcePoint.y;
        const targetX = targetPoint.x;
        const targetY = targetPoint.y;

        const manualWaypoints = options.waypoints && options.waypoints.length > 0
            ? options.waypoints
            : options.waypoint
                ? [options.waypoint]
                : [];

        if (manualWaypoints.length > 0) {
            const pathPoints = [{ x: sourceX, y: sourceY }, ...manualWaypoints, { x: targetX, y: targetY }];
            const midpoint = getPathMidpoint(pathPoints);
            return withBundledLabelOffset(
                buildRoundedPolylinePath(pathPoints, 20),
                midpoint.x,
                midpoint.y,
                params,
                labelBundleOffset
            );
        }

        if (variant === 'bezier' && !effectiveForceOrthogonal) {
            if (isMindmapBranch) {
                return withBundledLabelOffset(
                    ...(() => {
                        const result = isMindmapRootBranch
                            ? buildMindmapRootBranchPath(sourceX, sourceY, targetX, targetY)
                            : buildMindmapTopicBranchPath(sourceX, sourceY, targetX, targetY);
                        return [result.edgePath, result.labelX, result.labelY] as const;
                    })(),
                    params,
                    labelBundleOffset
                );
            }
            const [edgePath, labelX, labelY] = getBezierPath({
                sourceX,
                sourceY,
                sourcePosition: params.sourcePosition,
                targetX,
                targetY,
                targetPosition: params.targetPosition,
                curvature: 0.25,
            });
            return withBundledLabelOffset(edgePath, labelX, labelY, params, labelBundleOffset);
        }

        if (variant === 'step') {
            const [edgePath, labelX, labelY] = getSmoothStepPath({
                sourceX,
                sourceY,
                sourcePosition: params.sourcePosition,
                targetX,
                targetY,
                targetPosition: params.targetPosition,
                borderRadius: 0,
                offset: 20,
            });
            return withBundledLabelOffset(edgePath, labelX, labelY, params, labelBundleOffset);
        }

        if (variant === 'straight') {
            const [edgePath, labelX, labelY] = getStraightPath({
                sourceX,
                sourceY,
                targetX,
                targetY,
            });
            return withBundledLabelOffset(edgePath, labelX, labelY, params, labelBundleOffset);
        }

        if (effectiveForceOrthogonal) {
            const [edgePath, labelX, labelY] = getSmoothStepPath({
                sourceX,
                sourceY,
                sourcePosition: params.sourcePosition,
                targetX,
                targetY,
                targetPosition: params.targetPosition,
                borderRadius: 0,
                offset: 20,
            });
            return withBundledLabelOffset(edgePath, labelX, labelY, params, labelBundleOffset);
        }

        const [edgePath, labelX, labelY] = getSmoothStepPath({
            sourceX,
            sourceY,
            sourcePosition: params.sourcePosition,
            targetX,
            targetY,
            targetPosition: params.targetPosition,
            offset: 20,
        });
        return withBundledLabelOffset(edgePath, labelX, labelY, params, labelBundleOffset);
    });
}

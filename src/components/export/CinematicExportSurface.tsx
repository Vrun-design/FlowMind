import React, { forwardRef } from 'react';
import { Background, BackgroundVariant, ReactFlow, ReactFlowProvider } from '@/lib/reactflowCompat';
import type { FlowEdge, FlowNode } from '@/lib/types';
import { useCinematicExportSurfaceConfig } from '@/context/CinematicExportContext';
import { flowCanvasEdgeTypes, flowCanvasNodeTypes } from '@/components/flow-canvas/flowCanvasTypes';

const CINEMATIC_EXPORT_SURFACE_BACKGROUND =
  'radial-gradient(circle at top, rgba(59,130,246,0.14), transparent 42%), linear-gradient(180deg, #f8fbff 0%, #eef5ff 52%, #f8fafc 100%)';
const CINEMATIC_EXPORT_SURFACE_STYLE = {
  position: 'fixed',
  top: 0,
  left: 0,
  transform: 'translate(-20000px, 0)',
  overflow: 'hidden',
  pointerEvents: 'none',
  zIndex: -1,
  background: CINEMATIC_EXPORT_SURFACE_BACKGROUND,
} as const;

interface CinematicExportSurfaceProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

function CinematicExportSurfaceInner(
  { nodes, edges }: CinematicExportSurfaceProps,
  ref: React.ForwardedRef<HTMLDivElement>,
): React.ReactElement | null {
  const surfaceConfig = useCinematicExportSurfaceConfig();

  if (!surfaceConfig) {
    return null;
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        ...CINEMATIC_EXPORT_SURFACE_STYLE,
        width: surfaceConfig.width,
        height: surfaceConfig.height,
      }}
    >
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={flowCanvasNodeTypes}
          edgeTypes={flowCanvasEdgeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          preventScrolling={false}
          fitView
          fitViewOptions={{ padding: 0.14 }}
          className="bg-transparent"
          minZoom={0.05}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.5}
            color="rgba(148,163,184,0.38)"
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

export const CinematicExportSurface = forwardRef<HTMLDivElement, CinematicExportSurfaceProps>(CinematicExportSurfaceInner);
CinematicExportSurface.displayName = 'CinematicExportSurface';

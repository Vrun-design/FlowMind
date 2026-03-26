import React from 'react';
import type { FlowEdge } from '@/lib/types';
import {
  applyArchitectureDirection,
  architectureSideToHandleId,
  buildArchitectureEdgeLabel,
  getDirectionFromMarkers,
  handleIdToArchitectureSide,
  normalizeArchitectureEdgeDirection,
  normalizeArchitectureEdgeSide,
} from './architectureSemantics';
import {
  INSPECTOR_INPUT_COMPACT_CLASSNAME,
  InspectorField,
} from '@/components/properties/InspectorPrimitives';

interface ArchitectureEdgeSemanticsSectionProps {
  selectedEdge: FlowEdge;
  onChange: (id: string, updates: Partial<FlowEdge>) => void;
}

export function ArchitectureEdgeSemanticsSection({
  selectedEdge,
  onChange,
}: ArchitectureEdgeSemanticsSectionProps): React.ReactElement {
  const currentProtocol = typeof selectedEdge.data?.archProtocol === 'string' ? selectedEdge.data.archProtocol : '';
  const currentPort = typeof selectedEdge.data?.archPort === 'string' ? selectedEdge.data.archPort : '';
  const currentSourceSide = normalizeArchitectureEdgeSide(
    selectedEdge.data?.archSourceSide || handleIdToArchitectureSide(selectedEdge.sourceHandle || undefined)
  );
  const currentTargetSide = normalizeArchitectureEdgeSide(
    selectedEdge.data?.archTargetSide || handleIdToArchitectureSide(selectedEdge.targetHandle || undefined)
  );
  const currentDirection = normalizeArchitectureEdgeDirection(
    selectedEdge.data?.archDirection || getDirectionFromMarkers(selectedEdge)
  );

  const updateSemantics = (updates: Partial<NonNullable<FlowEdge['data']>>): void => {
    const nextData = {
      ...selectedEdge.data,
      ...updates,
    };
    const direction = normalizeArchitectureEdgeDirection(nextData.archDirection);
    const markers = applyArchitectureDirection(
      { ...selectedEdge, data: nextData },
      direction
    );
    onChange(selectedEdge.id, {
      data: nextData,
      ...markers,
    });
  };

  const updateProtocol = (protocol: string): void => {
    const nextLabel = buildArchitectureEdgeLabel(protocol, currentPort);
    updateSemantics({
      archProtocol: protocol || undefined,
    });
    onChange(selectedEdge.id, {
      label: nextLabel || undefined,
    });
  };

  const updatePort = (port: string): void => {
    const nextLabel = buildArchitectureEdgeLabel(currentProtocol, port);
    updateSemantics({
      archPort: port || undefined,
    });
    onChange(selectedEdge.id, {
      label: nextLabel || undefined,
    });
  };

  const updateDirection = (direction: string): void => {
    updateSemantics({
      archDirection: normalizeArchitectureEdgeDirection(direction),
    });
  };

  const updateSourceSide = (side: string): void => {
    const normalizedSide = normalizeArchitectureEdgeSide(side);
    const nextData = {
      ...selectedEdge.data,
      archSourceSide: normalizedSide,
    };
    const direction = normalizeArchitectureEdgeDirection(nextData.archDirection);
    const markers = applyArchitectureDirection(
      { ...selectedEdge, data: nextData },
      direction
    );
    onChange(selectedEdge.id, {
      data: nextData,
      sourceHandle: architectureSideToHandleId(normalizedSide),
      ...markers,
    });
  };

  const updateTargetSide = (side: string): void => {
    const normalizedSide = normalizeArchitectureEdgeSide(side);
    const nextData = {
      ...selectedEdge.data,
      archTargetSide: normalizedSide,
    };
    const direction = normalizeArchitectureEdgeDirection(nextData.archDirection);
    const markers = applyArchitectureDirection(
      { ...selectedEdge, data: nextData },
      direction
    );
    onChange(selectedEdge.id, {
      data: nextData,
      targetHandle: architectureSideToHandleId(normalizedSide),
      ...markers,
    });
  };

  const sideOptions = (
    <>
      <option value="">Auto</option>
      <option value="L">Left</option>
      <option value="R">Right</option>
      <option value="T">Top</option>
      <option value="B">Bottom</option>
    </>
  );

  return (
    <div className="space-y-3">
      <InspectorField label="Direction">
        <select
          value={currentDirection}
          onChange={(event) => updateDirection(event.target.value)}
          className={INSPECTOR_INPUT_COMPACT_CLASSNAME}
        >
          <option value="-->">Forward (--&gt;)</option>
          <option value="<--">Reverse (&lt;--)</option>
          <option value="<-->">Bidirectional (&lt;--&gt;)</option>
        </select>
      </InspectorField>

      <div className="grid grid-cols-2 gap-2">
        <InspectorField label="Source Side">
          <select
            value={currentSourceSide || ''}
            onChange={(event) => updateSourceSide(event.target.value)}
            className={INSPECTOR_INPUT_COMPACT_CLASSNAME}
          >
            {sideOptions}
          </select>
        </InspectorField>
        <InspectorField label="Target Side">
          <select
            value={currentTargetSide || ''}
            onChange={(event) => updateTargetSide(event.target.value)}
            className={INSPECTOR_INPUT_COMPACT_CLASSNAME}
          >
            {sideOptions}
          </select>
        </InspectorField>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <InspectorField label="Protocol">
          <input
            value={currentProtocol}
            onChange={(event) => updateProtocol(event.target.value)}
            placeholder="HTTPS"
            className={INSPECTOR_INPUT_COMPACT_CLASSNAME}
          />
        </InspectorField>
        <InspectorField label="Port">
          <input
            value={currentPort}
            onChange={(event) => updatePort(event.target.value)}
            placeholder="443"
            className={INSPECTOR_INPUT_COMPACT_CLASSNAME}
          />
        </InspectorField>
      </div>
    </div>
  );
}

import React from 'react';
import { Handle, Position } from '@/lib/reactflowCompat';
import { getConnectorHandleStyle, getHandlePointerEvents, getV2HandleVisibilityClass } from '@/components/handleInteraction';

interface StructuredNodeHandlesProps {
  isActiveSelected: boolean;
}

const HANDLE_POSITIONS = [
  { id: 'top', position: Position.Top },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left', position: Position.Left },
  { id: 'right', position: Position.Right },
] as const;

export function StructuredNodeHandles({ isActiveSelected }: StructuredNodeHandlesProps): React.ReactElement {
  const visualQualityV2Enabled = true;
  const handlePointerEvents = getHandlePointerEvents(visualQualityV2Enabled, isActiveSelected);
  const handleVisibilityClass = visualQualityV2Enabled
    ? getV2HandleVisibilityClass(isActiveSelected)
    : isActiveSelected
      ? 'opacity-100'
      : 'opacity-0 group-hover:opacity-100 [.is-connecting_&]:opacity-100';

  return (
    <>
      {HANDLE_POSITIONS.map(({ id, position }) => (
        <Handle
          key={id}
          type="source"
          position={position}
          id={id}
          isConnectableStart
          isConnectableEnd
          className={`!w-3 !h-3 !border-2 !border-white transition-all duration-150 hover:scale-125 ${handleVisibilityClass}`}
          style={getConnectorHandleStyle(id, isActiveSelected, handlePointerEvents)}
        />
      ))}
    </>
  );
}

import React from 'react';
import { Handle, Position } from '@/lib/reactflowCompat';
import { ROLLOUT_FLAGS } from '@/config/rolloutFlags';
import { getConnectorHandleStyle, getHandlePointerEvents, getV2HandleVisibilityClass } from './handleInteraction';
import { NodeTransformControls } from './NodeTransformControls';

type HandleSide = 'top' | 'right' | 'bottom' | 'left';

type HandleConfig = {
  id: string;
  position: Position;
  side: HandleSide;
};

type NodeChromeProps = {
  selected: boolean;
  minWidth: number;
  minHeight: number;
  keepAspectRatio?: boolean;
  handleClassName: string;
  handleVisibilityOptions?: {
    includeConnectingState?: boolean;
    includeScale?: boolean;
  };
  handleStyleExtras?: Partial<Record<HandleSide, React.CSSProperties>>;
  handles?: HandleConfig[];
  children: React.ReactNode;
};

const DEFAULT_HANDLES: HandleConfig[] = [
  { id: 'top', position: Position.Top, side: 'top' },
  { id: 'right', position: Position.Right, side: 'right' },
  { id: 'bottom', position: Position.Bottom, side: 'bottom' },
  { id: 'left', position: Position.Left, side: 'left' },
];

export function NodeChrome({
  selected,
  minWidth,
  minHeight,
  keepAspectRatio = false,
  handleClassName,
  handleVisibilityOptions,
  handleStyleExtras,
  handles = DEFAULT_HANDLES,
  children,
}: NodeChromeProps): React.ReactElement {
  const visualQualityV2Enabled = ROLLOUT_FLAGS.visualQualityV2;
  const handlePointerEvents = getHandlePointerEvents(visualQualityV2Enabled, selected);
  const handleVisibilityClass = visualQualityV2Enabled
    ? getV2HandleVisibilityClass(selected, handleVisibilityOptions)
    : selected
      ? 'opacity-100'
      : 'opacity-0 group-hover:opacity-100 [.is-connecting_&]:opacity-100';

  return (
    <>
      <NodeTransformControls
        isVisible={selected}
        minWidth={minWidth}
        minHeight={minHeight}
        keepAspectRatio={keepAspectRatio}
      />
      {children}
      {handles.map(({ id, position, side }) => (
        <Handle
          key={id}
          type="source"
          id={id}
          position={position}
          isConnectableStart
          isConnectableEnd
          className={`${handleClassName} ${handleVisibilityClass}`}
          style={getConnectorHandleStyle(side, selected, handlePointerEvents, handleStyleExtras?.[side])}
        />
      ))}
    </>
  );
}

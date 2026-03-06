import React, { memo } from 'react';
import { Position } from '@/lib/reactflowCompat';
import type { LegacyNodeProps } from '@/lib/reactflowCompat';
import type { NodeData } from '@/lib/types';
import { useInlineNodeTextEdit } from '@/hooks/useInlineNodeTextEdit';
import { InlineTextEditSurface } from '@/components/InlineTextEditSurface';
import { NodeChrome } from '@/components/NodeChrome';

function MindmapNode({ id, data, selected }: LegacyNodeProps<NodeData>): React.ReactElement {
  const labelEdit = useInlineNodeTextEdit(id, 'label', data.label || '');
  const depth = typeof (data as NodeData & { mindmapDepth?: number }).mindmapDepth === 'number'
    ? (data as NodeData & { mindmapDepth?: number }).mindmapDepth!
    : 0;

  const isRoot = depth === 0;
  const surfaceClass = isRoot
    ? 'bg-slate-900 text-white border-slate-900'
    : 'bg-white text-slate-800 border-slate-200';

  return (
    <NodeChrome
      selected={Boolean(selected)}
      minWidth={120}
      minHeight={44}
      handleClassName="!w-3 !h-3 !bg-slate-400 !border-2 !border-white transition-all duration-150 hover:scale-125"
      handles={[
        { id: 'top', position: Position.Top, side: 'top' },
        { id: 'right-source', position: Position.Right, side: 'right' },
        { id: 'bottom', position: Position.Bottom, side: 'bottom' },
        { id: 'left-target', position: Position.Left, side: 'left' },
      ]}
    >
      <div
        className={`min-w-[120px] max-w-[260px] rounded-xl border px-3 py-2 shadow-sm transition-all ${surfaceClass} ${
          selected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
        }`}
      >
        <InlineTextEditSurface
          isEditing={labelEdit.isEditing}
          draft={labelEdit.draft}
          displayValue={data.label || 'Topic'}
          onBeginEdit={labelEdit.beginEdit}
          onDraftChange={labelEdit.setDraft}
          onCommit={labelEdit.commit}
          onKeyDown={labelEdit.handleKeyDown}
          className={`text-sm leading-snug break-words ${isRoot ? 'font-semibold' : 'font-medium'}`}
          inputClassName={isRoot ? 'font-semibold' : 'font-medium'}
          isSelected={Boolean(selected)}
        />
      </div>
    </NodeChrome>
  );
}

export default memo(MindmapNode);

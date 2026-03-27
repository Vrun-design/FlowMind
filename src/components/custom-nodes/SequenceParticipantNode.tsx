import React, { memo } from 'react';
import { User } from 'lucide-react';
import { Position, type LegacyNodeProps } from '@/lib/reactflowCompat';
import type { NodeData } from '@/lib/types';
import { useInlineNodeTextEdit } from '@/hooks/useInlineNodeTextEdit';
import { InlineTextEditSurface } from '@/components/InlineTextEditSurface';
import { NodeChrome } from '@/components/NodeChrome';
import { getTransformDiagnosticsAttrs } from '@/components/transformDiagnostics';

// These constants are used by SequenceMessageEdge to position arrows correctly.
export const SEQ_BOX_H = 48;
export const SEQ_ACTOR_EXTRA_H = 40;
export const SEQ_LIFELINE_H = 500;
export const SEQ_MSG_OFFSET = 20; // gap between box bottom and first message
export const SEQ_MSG_SPACING = 52;

const SEQ_NODE_W = 140;

// Single invisible handle at top-center — used by SequenceMessageEdge
const TOP_HANDLE_ONLY = [{ id: 'top', position: Position.Top, side: 'top' as const }];

function SequenceParticipantNode({ id, data, selected }: LegacyNodeProps<NodeData>): React.ReactElement {
  const labelEdit = useInlineNodeTextEdit(id, 'label', data.label || '');
  const isActor = data.seqParticipantKind === 'actor';
  const totalH = (isActor ? SEQ_ACTOR_EXTRA_H : 0) + SEQ_BOX_H + SEQ_LIFELINE_H;

  return (
    <NodeChrome
      nodeId={id}
      selected={Boolean(selected)}
      minWidth={SEQ_NODE_W}
      minHeight={totalH}
      handles={TOP_HANDLE_ONLY}
      handleClassName="!w-2 !h-2 !border !border-white !bg-slate-400 transition-all duration-150 hover:scale-125 opacity-0 group-hover:opacity-100 [.is-connecting_&]:opacity-100"
      {...getTransformDiagnosticsAttrs({ nodeFamily: 'sequence', selected: Boolean(selected), minHeight: totalH })}
    >
      <div
        className="relative flex select-none flex-col items-center"
        style={{ width: SEQ_NODE_W, height: totalH }}
      >
        {/* Actor stick figure */}
        {isActor && (
          <div className="flex flex-col items-center pb-1 pt-1">
            <User className="h-7 w-7 text-slate-500" strokeWidth={1.5} />
          </div>
        )}

        {/* Participant box */}
        <div
          className="flex w-full items-center justify-center rounded border border-slate-300 bg-white px-3 shadow-sm"
          style={{ height: SEQ_BOX_H }}
        >
          <InlineTextEditSurface
            isEditing={labelEdit.isEditing}
            draft={labelEdit.draft}
            displayValue={data.label || 'Participant'}
            onBeginEdit={labelEdit.beginEdit}
            onDraftChange={labelEdit.setDraft}
            onCommit={labelEdit.commit}
            onKeyDown={labelEdit.handleKeyDown}
            className="w-full truncate text-center text-[12px] font-semibold text-slate-700"
            inputClassName="text-center text-[12px]"
            isSelected={Boolean(selected)}
          />
        </div>

        {/* Dashed lifeline */}
        <div
          className="mt-0"
          style={{
            width: 1.5,
            height: SEQ_LIFELINE_H,
            background: 'repeating-linear-gradient(to bottom, #94a3b8 0px, #94a3b8 6px, transparent 6px, transparent 12px)',
          }}
        />
      </div>
    </NodeChrome>
  );
}

export default memo(SequenceParticipantNode);

import { useCallback, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useFlowStore } from '@/store';
import type { NodeData } from '@/lib/types';
import { ROLLOUT_FLAGS } from '@/config/rolloutFlags';
import { createConnectedSibling } from './node-operations/createConnectedSibling';
import { useNodeLabelEditRequest } from './nodeLabelEditRequest';

type EditableField = 'label' | 'subLabel' | 'classStereotype';
type BeginEditOptions = {
  seedText?: string;
  replaceExisting?: boolean;
};
type InlineNodeTextEditOptions = {
  multiline?: boolean;
  allowTabCreateSibling?: boolean;
};

export function useInlineNodeTextEdit(
  nodeId: string,
  field: EditableField,
  initialValue: string,
  options: InlineNodeTextEditOptions = {}
): {
  isEditing: boolean;
  draft: string;
  beginEdit: (options?: BeginEditOptions) => void;
  setDraft: (value: string) => void;
  commit: () => void;
  cancel: () => void;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
} {
  const { setNodes } = useFlowStore();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraftState] = useState(initialValue ?? '');
  const multiline = options.multiline ?? false;
  const allowTabCreateSibling = options.allowTabCreateSibling ?? field === 'label';

  const beginEdit = useCallback((options?: BeginEditOptions) => {
    const nextDraft = options?.replaceExisting
      ? (options.seedText ?? '')
      : (options?.seedText ?? initialValue ?? '');
    setDraftState(nextDraft);
    setIsEditing(true);
  }, [initialValue]);

  useNodeLabelEditRequest(nodeId, beginEdit);

  const setDraft = useCallback((value: string) => {
    setDraftState(value);
  }, []);

  const commit = useCallback(() => {
    const nextValue = draft.trim();
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                [field]: nextValue,
              } as NodeData,
            }
          : node
      )
    );
    setIsEditing(false);
  }, [draft, field, nodeId, setNodes]);

  const cancel = useCallback(() => {
    setDraftState(initialValue ?? '');
    setIsEditing(false);
  }, [initialValue]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      event.stopPropagation();
      if (event.key === 'Escape') {
        event.preventDefault();
        cancel();
        return;
      }
      if (event.key === 'Enter' && !multiline) {
        event.preventDefault();
        commit();
        return;
      }
      if (event.key === 'Enter' && multiline && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        commit();
        return;
      }
      if (event.key === 'Tab' && !event.shiftKey && allowTabCreateSibling) {
        event.preventDefault();
        commit();
        if (ROLLOUT_FLAGS.canvasInteractionsV1) {
          createConnectedSibling(nodeId);
        }
      }
    },
    [allowTabCreateSibling, cancel, commit, multiline, nodeId]
  );

  return { isEditing, draft, beginEdit, setDraft, commit, cancel, handleKeyDown };
}

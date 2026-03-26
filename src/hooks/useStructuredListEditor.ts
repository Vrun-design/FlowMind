import React from 'react';
import { useFlowStore } from '@/store';
import { getStructuredListNavigationAction } from '@/components/custom-nodes/structuredListNavigation';

export interface StructuredListEditor {
  editingIndex: number | null;
  draft: string;
  setDraft: (value: string) => void;
  beginEdit: (index: number, value: string) => void;
  commitEdit: () => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
}

/**
 * Shared hook for editing a list of strings stored in node data (e.g. erFields).
 *
 * @param nodeId     — the node being edited
 * @param items      — the current list of display strings (from component props/data)
 * @param applyPatch — returns a partial NodeData patch from the updated string list
 */
export function useStructuredListEditor(
  nodeId: string,
  items: string[],
  applyPatch: (items: string[]) => Record<string, unknown>,
): StructuredListEditor {
  const { setNodes } = useFlowStore();

  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [draft, setDraft] = React.useState('');

  const beginEdit = React.useCallback((index: number, value: string) => {
    setEditingIndex(index);
    setDraft(value);
  }, []);

  const mutateList = React.useCallback(
    (updater: (current: string[]) => string[]) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id !== nodeId) return node;
          return { ...node, data: { ...node.data, ...applyPatch(updater([...items])) } };
        }),
      );
    },
    [applyPatch, items, nodeId, setNodes],
  );

  const commitEdit = React.useCallback(() => {
    if (editingIndex === null) return;
    const trimmed = draft.trim();
    if (trimmed) {
      mutateList((list) => {
        if (editingIndex >= list.length) list.push(trimmed);
        else list[editingIndex] = trimmed;
        return list;
      });
    } else if (editingIndex < items.length) {
      mutateList((list) => { list.splice(editingIndex, 1); return list; });
    }
    setEditingIndex(null);
  }, [draft, editingIndex, items.length, mutateList]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      event.stopPropagation();
      const action = getStructuredListNavigationAction(
        event.key,
        { ctrlKey: event.ctrlKey, metaKey: event.metaKey, shiftKey: event.shiftKey },
        index,
        items.length,
      );

      if (!action) return;
      event.preventDefault();

      if (action.type === 'cancel') {
        setEditingIndex(null);
        return;
      }

      // Persist current value without removing empty rows during navigation
      const trimmed = draft.trim();
      if (trimmed) {
        mutateList((list) => {
          if (index >= list.length) list.push(trimmed);
          else list[index] = trimmed;
          return list;
        });
      }

      if (action.type === 'insertBelow') {
        mutateList((list) => { list.splice(action.targetIndex, 0, ''); return list; });
        setEditingIndex(action.targetIndex);
        setDraft('');
        return;
      }

      const nextValue = items[action.targetIndex] ?? '';
      setEditingIndex(action.targetIndex);
      setDraft(nextValue);
    },
    [draft, items, mutateList],
  );

  return { editingIndex, draft, setDraft, beginEdit, commitEdit, handleKeyDown };
}

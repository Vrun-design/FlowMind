import { act, renderHook } from '@testing-library/react';
import type { KeyboardEvent } from 'react';
import { createId } from '@/lib/id';
import { useFlowStore } from '@/store';
import { describe, expect, it, vi } from 'vitest';
import { useInlineNodeTextEdit } from './useInlineNodeTextEdit';
import { requestNodeLabelEdit } from './nodeLabelEditRequest';

describe('useInlineNodeTextEdit', () => {
  it('creates connected sibling when Tab is pressed while editing', () => {
    const nodeId = createId('node');
    useFlowStore.setState((state) => ({
      ...state,
      nodes: [{
        id: nodeId,
        type: 'process',
        position: { x: 100, y: 120 },
        data: { label: 'Source', shape: 'rounded', color: 'slate' },
      }],
      edges: [],
      selectedNodeId: nodeId,
    }));

    const { result } = renderHook(() => useInlineNodeTextEdit(nodeId, 'label', 'Source'));
    act(() => {
      result.current.beginEdit();
    });

    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();
    const tabEvent = {
      key: 'Tab',
      shiftKey: false,
      preventDefault,
      stopPropagation,
    } as unknown as KeyboardEvent<HTMLInputElement>;

    act(() => {
      result.current.handleKeyDown(tabEvent);
    });

    const state = useFlowStore.getState();
    expect(preventDefault).toHaveBeenCalled();
    expect(state.nodes.length).toBe(2);
    expect(state.edges.length).toBe(1);
    expect(state.edges[0].source).toBe(nodeId);
  });

  it('enters edit mode when matching node label edit request is dispatched', () => {
    const { result } = renderHook(() => useInlineNodeTextEdit('node-1', 'label', 'Original'));

    expect(result.current.isEditing).toBe(false);

    act(() => {
      requestNodeLabelEdit('node-1');
    });

    expect(result.current.isEditing).toBe(true);
    expect(result.current.draft).toBe('Original');
  });

  it('replaces the draft with the first typed character when requested', () => {
    const { result } = renderHook(() => useInlineNodeTextEdit('node-1', 'label', 'Original'));

    act(() => {
      requestNodeLabelEdit('node-1', {
        seedText: 'A',
        replaceExisting: true,
      });
    });

    expect(result.current.isEditing).toBe(true);
    expect(result.current.draft).toBe('A');
  });

  it('allows newline entry in multiline mode and commits on Cmd/Ctrl+Enter', () => {
    const nodeId = createId('node');
    useFlowStore.setState((state) => ({
      ...state,
      nodes: [{
        id: nodeId,
        type: 'text',
        position: { x: 0, y: 0 },
        data: { label: 'Line 1', shape: 'rounded', color: 'slate' },
      }],
      edges: [],
    }));

    const { result } = renderHook(() =>
      useInlineNodeTextEdit(nodeId, 'label', 'Line 1', { multiline: true })
    );

    act(() => {
      result.current.beginEdit();
      result.current.setDraft('Line 1\nLine 2');
    });

    const newlineEvent = {
      key: 'Enter',
      metaKey: false,
      ctrlKey: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.handleKeyDown(newlineEvent);
    });

    expect(newlineEvent.preventDefault).not.toHaveBeenCalled();
    expect(result.current.isEditing).toBe(true);

    const commitEvent = {
      key: 'Enter',
      metaKey: true,
      ctrlKey: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.handleKeyDown(commitEvent);
    });

    expect(commitEvent.preventDefault).toHaveBeenCalled();
    expect(useFlowStore.getState().nodes[0].data.label).toBe('Line 1\nLine 2');
    expect(result.current.isEditing).toBe(false);
  });
});

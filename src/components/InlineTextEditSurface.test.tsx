import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InlineTextEditSurface } from './InlineTextEditSurface';

describe('InlineTextEditSurface', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('begins edit mode from display surface double clicks', () => {
    const onBeginEdit = vi.fn();

    render(
      <InlineTextEditSurface
        isEditing={false}
        draft=""
        displayValue="Node"
        onBeginEdit={onBeginEdit}
        onDraftChange={vi.fn()}
        onCommit={vi.fn()}
        onKeyDown={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Node'));

    expect(onBeginEdit).not.toHaveBeenCalled();

    fireEvent.doubleClick(screen.getByText('Node'));

    expect(onBeginEdit).toHaveBeenCalledTimes(1);
  });

  it('renders a low-chrome input while editing and forwards input events', () => {
    vi.useFakeTimers();
    const onDraftChange = vi.fn();
    const onCommit = vi.fn();
    const onKeyDown = vi.fn();

    render(
      <div>
        <InlineTextEditSurface
          isEditing
          draft="Draft"
          displayValue="Node"
          onBeginEdit={vi.fn()}
          onDraftChange={onDraftChange}
          onCommit={onCommit}
          onKeyDown={onKeyDown}
        />
        <button type="button">Outside</button>
      </div>
    );

    const input = screen.getByDisplayValue('Draft');
    const button = screen.getByText('Outside');
    fireEvent.change(input, { target: { value: 'Updated' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.blur(input);
    button.focus();
    vi.runAllTimers();

    expect(input.className).toContain('border-transparent');
    expect(input.className).toContain('bg-transparent');
    expect(onDraftChange).toHaveBeenCalledWith('Updated');
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it('renders an auto-sizing textarea in multiline mode', () => {
    render(
      <InlineTextEditSurface
        isEditing
        draft={'Line 1\nLine 2'}
        displayValue="Node"
        onBeginEdit={vi.fn()}
        onDraftChange={vi.fn()}
        onCommit={vi.fn()}
        onKeyDown={vi.fn()}
        inputMode="multiline"
      />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea.className).toContain('resize-none');
  });

  it('does not commit when focus settles back inside the editor surface', () => {
    vi.useFakeTimers();
    const onCommit = vi.fn();

    render(
      <InlineTextEditSurface
        isEditing
        draft="Draft"
        displayValue="Node"
        onBeginEdit={vi.fn()}
        onDraftChange={vi.fn()}
        onCommit={onCommit}
        onKeyDown={vi.fn()}
      />
    );

    const input = screen.getByDisplayValue('Draft');
    fireEvent.blur(input);
    input.focus();
    vi.runAllTimers();

    expect(onCommit).not.toHaveBeenCalled();
  });

  it('commits when focus leaves the editor surface', () => {
    vi.useFakeTimers();
    const onCommit = vi.fn();

    render(
      <div>
        <InlineTextEditSurface
          isEditing
          draft="Draft"
          displayValue="Node"
          onBeginEdit={vi.fn()}
          onDraftChange={vi.fn()}
          onCommit={onCommit}
          onKeyDown={vi.fn()}
        />
        <button type="button">Outside</button>
      </div>
    );

    const input = screen.getByDisplayValue('Draft');
    const button = screen.getByText('Outside');
    fireEvent.blur(input);
    button.focus();
    vi.runAllTimers();

    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it('adds a subtle editable affordance when selected', () => {
    render(
      <InlineTextEditSurface
        isEditing={false}
        draft=""
        displayValue="Node"
        onBeginEdit={vi.fn()}
        onDraftChange={vi.fn()}
        onCommit={vi.fn()}
        onKeyDown={vi.fn()}
        isSelected
      />
    );

    const surface = screen.getByText('Node').closest('div');
    expect(surface?.className).toContain('cursor-text');
    expect(surface?.className).toContain('decoration-dotted');
  });

  it('does not begin editing when the pointer gesture indicates drag intent', () => {
    const onBeginEdit = vi.fn();

    render(
      <InlineTextEditSurface
        isEditing={false}
        draft=""
        displayValue="Node"
        onBeginEdit={onBeginEdit}
        onDraftChange={vi.fn()}
        onCommit={vi.fn()}
        onKeyDown={vi.fn()}
      />
    );

    const surface = screen.getByText('Node');
    fireEvent.pointerDown(surface, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(surface, { clientX: 24, clientY: 10 });
    fireEvent.doubleClick(surface);

    expect(onBeginEdit).not.toHaveBeenCalled();
  });
});

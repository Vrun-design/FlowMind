import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { handlePropertyInputKeyDown } from './propertyInputBehavior';

function createKeyboardEvent(overrides: Partial<React.KeyboardEvent<HTMLElement>> = {}): React.KeyboardEvent<HTMLElement> {
  return {
    key: 'a',
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    stopPropagation: vi.fn(),
    preventDefault: vi.fn(),
    currentTarget: {
      blur: vi.fn(),
    } as unknown as HTMLElement,
    ...overrides,
  } as React.KeyboardEvent<HTMLElement>;
}

describe('propertyInputBehavior', () => {
  it('stops propagation for select-all shortcuts without preventing the native selection', () => {
    const event = createKeyboardEvent({ key: 'a', metaKey: true });

    handlePropertyInputKeyDown(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('blurs on Cmd/Ctrl+Enter when configured', () => {
    const event = createKeyboardEvent({ key: 'Enter', ctrlKey: true });

    handlePropertyInputKeyDown(event, { blurOnModifiedEnter: true });

    expect(event.preventDefault).toHaveBeenCalled();
    expect((event.currentTarget as HTMLElement).blur).toHaveBeenCalled();
  });

  it('blurs on plain Enter for single-line inspector inputs when configured', () => {
    const event = createKeyboardEvent({ key: 'Enter' });

    handlePropertyInputKeyDown(event, { blurOnEnter: true });

    expect(event.preventDefault).toHaveBeenCalled();
    expect((event.currentTarget as HTMLElement).blur).toHaveBeenCalled();
  });
});

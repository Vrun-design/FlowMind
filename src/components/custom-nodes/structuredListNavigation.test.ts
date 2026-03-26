import { describe, expect, it } from 'vitest';
import { getStructuredListNavigationAction } from './structuredListNavigation';

describe('structuredListNavigation', () => {
  it('moves forward on Enter and Tab', () => {
    expect(getStructuredListNavigationAction('Enter', { ctrlKey: false, metaKey: false, shiftKey: false }, 1, 3)).toEqual({
      type: 'move',
      targetIndex: 2,
    });

    expect(getStructuredListNavigationAction('Tab', { ctrlKey: false, metaKey: false, shiftKey: false }, 2, 3)).toEqual({
      type: 'move',
      targetIndex: 3,
    });
  });

  it('wraps backward on Shift+Tab', () => {
    expect(getStructuredListNavigationAction('Tab', { ctrlKey: false, metaKey: false, shiftKey: true }, 0, 3)).toEqual({
      type: 'move',
      targetIndex: 2,
    });
  });

  it('inserts below on Cmd/Ctrl+Enter', () => {
    expect(getStructuredListNavigationAction('Enter', { ctrlKey: true, metaKey: false, shiftKey: false }, 1, 3)).toEqual({
      type: 'insertBelow',
      targetIndex: 2,
    });
  });
});

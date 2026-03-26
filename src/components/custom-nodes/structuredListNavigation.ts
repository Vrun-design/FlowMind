export type StructuredListNavigationAction =
  | { type: 'cancel' }
  | { type: 'insertBelow'; targetIndex: number }
  | { type: 'move'; targetIndex: number };

export function getStructuredListNavigationAction(
  key: string,
  modifiers: {
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
  },
  currentIndex: number,
  listLength: number
): StructuredListNavigationAction | null {
  if (key === 'Escape') {
    return { type: 'cancel' };
  }

  if (key === 'Enter' && (modifiers.ctrlKey || modifiers.metaKey)) {
    return {
      type: 'insertBelow',
      targetIndex: Math.min(currentIndex + 1, listLength),
    };
  }

  if (key === 'Tab' && modifiers.shiftKey) {
    return {
      type: 'move',
      targetIndex: listLength === 0 ? 0 : currentIndex <= 0 ? listLength - 1 : currentIndex - 1,
    };
  }

  if (key === 'Tab' || key === 'Enter') {
    return {
      type: 'move',
      targetIndex: Math.min(currentIndex + 1, listLength),
    };
  }

  return null;
}

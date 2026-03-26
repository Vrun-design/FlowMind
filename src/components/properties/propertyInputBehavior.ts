import type React from 'react';

interface PropertyInputKeyDownOptions {
  blurOnEnter?: boolean;
  blurOnModifiedEnter?: boolean;
}

function isSelectAllShortcut(event: React.KeyboardEvent<HTMLElement>): boolean {
  return (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a';
}

export function handlePropertyInputKeyDown(
  event: React.KeyboardEvent<HTMLElement>,
  options: PropertyInputKeyDownOptions = {}
): void {
  event.stopPropagation();

  if (isSelectAllShortcut(event)) {
    return;
  }

  const target = event.currentTarget as HTMLElement;

  if (options.blurOnModifiedEnter && (event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault();
    target.blur();
    return;
  }

  if (
    options.blurOnEnter
    && event.key === 'Enter'
    && !event.metaKey
    && !event.ctrlKey
    && !event.altKey
    && !event.shiftKey
  ) {
    event.preventDefault();
    target.blur();
  }
}

export function createPropertyInputKeyDownHandler(
  options: PropertyInputKeyDownOptions = {}
): (event: React.KeyboardEvent<HTMLElement>) => void {
  return (event) => {
    handlePropertyInputKeyDown(event, options);
  };
}

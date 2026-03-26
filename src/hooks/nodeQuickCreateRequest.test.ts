import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { requestNodeQuickCreate, useNodeQuickCreateRequest } from './nodeQuickCreateRequest';

describe('nodeQuickCreateRequest', () => {
  it('dispatches quick create requests to listeners', () => {
    const onRequest = vi.fn();
    renderHook(() => useNodeQuickCreateRequest(onRequest));

    requestNodeQuickCreate('node-1', 'right');

    expect(onRequest).toHaveBeenCalledWith('node-1', 'right');
  });
});

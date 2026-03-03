import { describe, expect, it } from 'vitest';
import { getDragStopReconcileDelayMs } from './dragStopReconcilePolicy';

describe('getDragStopReconcileDelayMs', () => {
  it('returns immediate reconcile for smaller graphs', () => {
    expect(getDragStopReconcileDelayMs(400, 700)).toBe(0);
    expect(getDragStopReconcileDelayMs(100, 100)).toBe(0);
  });

  it('returns debounce delay for very large graphs', () => {
    expect(getDragStopReconcileDelayMs(500, 700)).toBe(80);
    expect(getDragStopReconcileDelayMs(1000, 1500)).toBe(80);
  });
});

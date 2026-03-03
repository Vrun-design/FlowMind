import { describe, expect, it } from 'vitest';
import {
  OPENFLOWKIT_STORAGE_KEY,
  SNAPSHOTS_STORAGE_KEY,
  estimateTrackedLocalStorageUsageBytes,
  estimateTrackedLocalStorageUsageRatio,
} from './storagePressure';

function createStorage(entries: Record<string, string>): Storage {
  return {
    length: Object.keys(entries).length,
    clear: () => {},
    getItem: (key: string) => entries[key] ?? null,
    key: (index: number) => Object.keys(entries)[index] ?? null,
    removeItem: () => {},
    setItem: () => {},
  };
}

describe('storagePressure', () => {
  it('counts only tracked keys', () => {
    const storage = createStorage({
      [OPENFLOWKIT_STORAGE_KEY]: 'abc',
      [SNAPSHOTS_STORAGE_KEY]: 'defg',
      unrelated: 'should-not-count',
    });

    const usage = estimateTrackedLocalStorageUsageBytes(storage);
    const expected =
      (OPENFLOWKIT_STORAGE_KEY.length + 3) * 2 +
      (SNAPSHOTS_STORAGE_KEY.length + 4) * 2;

    expect(usage).toBe(expected);
  });

  it('computes ratio against provided quota', () => {
    const storage = createStorage({
      [OPENFLOWKIT_STORAGE_KEY]: '12345',
    });
    const usage = estimateTrackedLocalStorageUsageBytes(storage);

    expect(estimateTrackedLocalStorageUsageRatio(storage, usage * 2)).toBeCloseTo(0.5, 5);
  });
});

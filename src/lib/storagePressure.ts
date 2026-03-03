const DEFAULT_LOCAL_STORAGE_QUOTA_BYTES = 5 * 1024 * 1024;
const OPENFLOWKIT_STORAGE_KEY = 'openflowkit-storage';
const SNAPSHOTS_STORAGE_KEY = 'flowmind_snapshots';

function bytesForLocalStorageEntry(key: string, value: string): number {
  // localStorage values are UTF-16 strings; 2 bytes per code unit is a practical estimate.
  return (key.length + value.length) * 2;
}

export function estimateTrackedLocalStorageUsageBytes(storage: Storage): number {
  let total = 0;
  const trackedKeys = [OPENFLOWKIT_STORAGE_KEY, SNAPSHOTS_STORAGE_KEY];

  for (const key of trackedKeys) {
    const value = storage.getItem(key);
    if (!value) continue;
    total += bytesForLocalStorageEntry(key, value);
  }

  return total;
}

export function estimateTrackedLocalStorageUsageRatio(
  storage: Storage,
  quotaBytes = DEFAULT_LOCAL_STORAGE_QUOTA_BYTES
): number {
  if (quotaBytes <= 0) return 0;
  const usageBytes = estimateTrackedLocalStorageUsageBytes(storage);
  return usageBytes / quotaBytes;
}

export {
  DEFAULT_LOCAL_STORAGE_QUOTA_BYTES,
  OPENFLOWKIT_STORAGE_KEY,
  SNAPSHOTS_STORAGE_KEY,
};

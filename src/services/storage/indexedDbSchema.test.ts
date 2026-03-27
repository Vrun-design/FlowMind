import { describe, expect, it, vi } from 'vitest';
import {
  AI_SETTINGS_PERSISTENT_STORE_NAME,
  ASSETS_STORE_NAME,
  CHAT_MESSAGES_STORE_NAME,
  CHAT_THREADS_STORE_NAME,
  DOCUMENT_SESSIONS_STORE_NAME,
  FLOW_DOCUMENT_STORE_NAME,
  FLOW_METADATA_STORE_NAME,
  PERSISTED_DOCUMENTS_STORE_NAME,
  PREFERENCES_STORE_NAME,
  WORKSPACE_META_STORE_NAME,
  ensureFlowPersistenceSchema,
} from './indexedDbSchema';

function createMockIndexedDbFactory(storeNames: string[] = []): {
  factory: IDBFactory;
  createObjectStore: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
} {
  const existingStores = new Set(storeNames);
  const createObjectStore = vi.fn((name: string) => {
    existingStores.add(name);
    return {} as IDBObjectStore;
  });
  const close = vi.fn();

  const database = {
    objectStoreNames: {
      contains: (name: string) => existingStores.has(name),
    },
    createObjectStore,
    close,
  } as unknown as IDBDatabase;

  const request = {
    result: database,
    error: null,
    onerror: null,
    onsuccess: null,
    onupgradeneeded: null,
  } as unknown as IDBOpenDBRequest;

  const open = vi.fn(() => {
    queueMicrotask(() => {
      if (typeof request.onupgradeneeded === 'function') {
        request.onupgradeneeded(new Event('upgradeneeded') as IDBVersionChangeEvent);
      }
      if (typeof request.onsuccess === 'function') {
        request.onsuccess(new Event('success') as Event);
      }
    });
    return request;
  });

  return {
    factory: { open } as unknown as IDBFactory,
    createObjectStore,
    close,
  };
}

describe('indexedDbSchema', () => {
  it('creates missing object stores during schema bootstrap', async () => {
    const mock = createMockIndexedDbFactory();

    await ensureFlowPersistenceSchema(mock.factory);

    expect(mock.createObjectStore).toHaveBeenCalledWith(FLOW_DOCUMENT_STORE_NAME, { keyPath: 'id' });
    expect(mock.createObjectStore).toHaveBeenCalledWith(FLOW_METADATA_STORE_NAME, { keyPath: 'id' });
    expect(mock.createObjectStore).toHaveBeenCalledWith(PERSISTED_DOCUMENTS_STORE_NAME, { keyPath: 'id' });
    expect(mock.createObjectStore).toHaveBeenCalledWith(DOCUMENT_SESSIONS_STORE_NAME, { keyPath: 'id' });
    expect(mock.createObjectStore).toHaveBeenCalledWith(CHAT_THREADS_STORE_NAME, { keyPath: 'id' });
    expect(mock.createObjectStore).toHaveBeenCalledWith(CHAT_MESSAGES_STORE_NAME, { keyPath: 'id' });
    expect(mock.createObjectStore).toHaveBeenCalledWith(WORKSPACE_META_STORE_NAME, { keyPath: 'id' });
    expect(mock.createObjectStore).toHaveBeenCalledWith(AI_SETTINGS_PERSISTENT_STORE_NAME, { keyPath: 'id' });
    expect(mock.createObjectStore).toHaveBeenCalledWith(PREFERENCES_STORE_NAME, { keyPath: 'id' });
    expect(mock.createObjectStore).toHaveBeenCalledWith(ASSETS_STORE_NAME, { keyPath: 'id' });
    expect(mock.close).toHaveBeenCalledTimes(1);
  });

  it('does not recreate stores that already exist', async () => {
    const mock = createMockIndexedDbFactory([
      FLOW_DOCUMENT_STORE_NAME,
      FLOW_METADATA_STORE_NAME,
      PERSISTED_DOCUMENTS_STORE_NAME,
      DOCUMENT_SESSIONS_STORE_NAME,
      CHAT_THREADS_STORE_NAME,
      CHAT_MESSAGES_STORE_NAME,
      WORKSPACE_META_STORE_NAME,
      AI_SETTINGS_PERSISTENT_STORE_NAME,
      PREFERENCES_STORE_NAME,
      ASSETS_STORE_NAME,
    ]);

    await ensureFlowPersistenceSchema(mock.factory);

    expect(mock.createObjectStore).not.toHaveBeenCalled();
    expect(mock.close).toHaveBeenCalledTimes(1);
  });
});

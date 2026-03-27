export const FLOW_PERSISTENCE_DB_NAME = 'openflowkit-persistence';
export const FLOW_PERSISTENCE_DB_VERSION = 2;
export const FLOW_DOCUMENT_STORE_NAME = 'flowDocuments';
export const FLOW_METADATA_STORE_NAME = 'flowMetadata';
export const PERSISTED_DOCUMENTS_STORE_NAME = 'documents';
export const DOCUMENT_SESSIONS_STORE_NAME = 'documentSessions';
export const CHAT_THREADS_STORE_NAME = 'chatThreads';
export const CHAT_MESSAGES_STORE_NAME = 'chatMessages';
export const WORKSPACE_META_STORE_NAME = 'workspaceMeta';
export const AI_SETTINGS_PERSISTENT_STORE_NAME = 'aiSettingsPersistent';
export const PREFERENCES_STORE_NAME = 'preferences';
export const ASSETS_STORE_NAME = 'assets';

function ensureObjectStore(database: IDBDatabase, storeName: string): void {
  if (!database.objectStoreNames.contains(storeName)) {
    database.createObjectStore(storeName, { keyPath: 'id' });
  }
}

export function openFlowPersistenceDatabase(indexedDbFactory: IDBFactory): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDbFactory.open(FLOW_PERSISTENCE_DB_NAME, FLOW_PERSISTENCE_DB_VERSION);

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open IndexedDB persistence database.'));
    };

    request.onupgradeneeded = () => {
      const database = request.result;
      ensureObjectStore(database, FLOW_DOCUMENT_STORE_NAME);
      ensureObjectStore(database, FLOW_METADATA_STORE_NAME);
      ensureObjectStore(database, PERSISTED_DOCUMENTS_STORE_NAME);
      ensureObjectStore(database, DOCUMENT_SESSIONS_STORE_NAME);
      ensureObjectStore(database, CHAT_THREADS_STORE_NAME);
      ensureObjectStore(database, CHAT_MESSAGES_STORE_NAME);
      ensureObjectStore(database, WORKSPACE_META_STORE_NAME);
      ensureObjectStore(database, AI_SETTINGS_PERSISTENT_STORE_NAME);
      ensureObjectStore(database, PREFERENCES_STORE_NAME);
      ensureObjectStore(database, ASSETS_STORE_NAME);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

export async function ensureFlowPersistenceSchema(indexedDbFactory: IDBFactory): Promise<void> {
  const database = await openFlowPersistenceDatabase(indexedDbFactory);
  database.close();
}

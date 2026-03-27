import { DEFAULT_AI_SETTINGS } from '@/store';
import { sanitizeAISettings } from '@/store/aiSettings';
import { clearPersistedAISettings, loadPersistedAISettings } from '@/store/aiSettingsPersistence';
import { sanitizePersistedTab } from '@/store/persistence';
import type { FlowStoreState } from '@/store';
import { useFlowStore } from '@/store';
import { convertPersistedDocumentsToTabs, localFirstRepository, type PersistedChatMessage } from './localFirstRepository';

const STORE_SUBSCRIPTION_DEBOUNCE_MS = 250;

type StoreWithPersist = typeof useFlowStore & {
  persist?: {
    hasHydrated: () => boolean;
    rehydrate: () => Promise<void>;
    onFinishHydration: (listener: () => void) => () => void;
  };
};

async function waitForStoreHydration(): Promise<void> {
  const persistedStore = useFlowStore as StoreWithPersist;
  const persistApi = persistedStore.persist;

  if (!persistApi) {
    return;
  }

  await persistApi.rehydrate();
  if (persistApi.hasHydrated()) {
    return;
  }

  await new Promise<void>((resolve) => {
    const unsubscribe = persistApi.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
}

function buildChatMessageId(documentId: string, index: number): string {
  return `${documentId}:${index}`;
}

function toPersistedChatMessages(documentId: string, serialized: string | null): PersistedChatMessage[] {
  if (!serialized) {
    return [];
  }

  try {
    const parsed = JSON.parse(serialized) as Array<{ role: PersistedChatMessage['role']; parts: PersistedChatMessage['parts'] }>;
    const startedAt = Date.now();
    return parsed.map((message, index) => ({
      id: buildChatMessageId(documentId, index),
      documentId,
      role: message.role,
      parts: message.parts,
      createdAt: new Date(startedAt + index).toISOString(),
    }));
  } catch {
    return [];
  }
}

async function migrateLegacyStoreIntoRepositoryIfNeeded(): Promise<void> {
  const currentState = useFlowStore.getState();
  const loaded = await localFirstRepository.loadActiveDocument();
  if (loaded.documents.length > 0) {
    return;
  }

  const tabs = currentState.tabs.map(sanitizePersistedTab);
  if (tabs.length === 0) {
    return;
  }

  await localFirstRepository.saveWorkspace(tabs, currentState.activeTabId);

  await Promise.all(
    tabs.map(async (tab) => {
      const legacyChatRaw = localStorage.getItem(`ofk_chat_history_${tab.id}`);
      const persistedMessages = toPersistedChatMessages(tab.id, legacyChatRaw);
      if (persistedMessages.length > 0) {
        await localFirstRepository.replaceChatThread(tab.id, persistedMessages);
      }
    })
  );

  const persistedAiSettings = loadPersistedAISettings();
  if (persistedAiSettings.storageMode === 'local') {
    await localFirstRepository.savePersistentAISettings(JSON.stringify(persistedAiSettings));
    clearPersistedAISettings();
  }
}

async function hydrateStoreFromRepository(): Promise<void> {
  const loaded = await localFirstRepository.loadActiveDocument();
  const tabs = convertPersistedDocumentsToTabs(loaded.documents);
  if (tabs.length === 0) {
    return;
  }

  const activeTabId = loaded.document?.id ?? loaded.workspaceMeta.activeDocumentId ?? tabs[0].id;
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const persistentAiSettings = await localFirstRepository.loadPersistentAISettings();
  const aiSettings = persistentAiSettings
    ? sanitizeAISettings(JSON.parse(persistentAiSettings) as Partial<FlowStoreState['aiSettings']>, DEFAULT_AI_SETTINGS)
    : loadPersistedAISettings();

  useFlowStore.setState((currentState) => ({
    ...currentState,
    tabs,
    activeTabId: activeTab.id,
    nodes: activeTab.nodes,
    edges: activeTab.edges,
    aiSettings,
  }));
}

function persistStoreSnapshot(): void {
  const nextState = useFlowStore.getState();

  void localFirstRepository.saveWorkspace(nextState.tabs.map(sanitizePersistedTab), nextState.activeTabId);

  if (nextState.aiSettings.storageMode === 'local') {
    void localFirstRepository.savePersistentAISettings(JSON.stringify(nextState.aiSettings));
  }
}

let syncStopper: (() => void) | null = null;
let initializationPromise: Promise<void> | null = null;

export async function initializeLocalFirstPersistence(): Promise<void> {
  await waitForStoreHydration();
  await migrateLegacyStoreIntoRepositoryIfNeeded();
  await hydrateStoreFromRepository();

  if (syncStopper) {
    return;
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  syncStopper = useFlowStore.subscribe((state, previousState) => {
    const tabsChanged = state.tabs !== previousState.tabs;
    const activeDocumentChanged = state.activeTabId !== previousState.activeTabId;
    const aiSettingsChanged = state.aiSettings !== previousState.aiSettings;

    if (!tabsChanged && !activeDocumentChanged && !aiSettingsChanged) {
      return;
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      persistStoreSnapshot();
    }, STORE_SUBSCRIPTION_DEBOUNCE_MS);
  });
}

export function ensureLocalFirstPersistenceReady(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = initializeLocalFirstPersistence().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}

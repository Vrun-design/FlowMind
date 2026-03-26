import { DEFAULT_AI_SETTINGS } from './defaults';
import { sanitizeAISettings } from './aiSettings';
import type { AISettings } from './types';

const AI_SETTINGS_STORAGE_KEY = 'openflowkit-ai-settings';

function getStorageSafe(storageType: 'local' | 'session'): Storage | null {
    if (typeof window === 'undefined') {
        return null;
    }

    return storageType === 'local' ? window.localStorage : window.sessionStorage;
}

function removeStoredAISettings(storageType: 'local' | 'session'): void {
    const storage = getStorageSafe(storageType);
    if (!storage) {
        return;
    }

    try {
        storage.removeItem(AI_SETTINGS_STORAGE_KEY);
    } catch {
        // Ignore storage cleanup failures so editor state remains usable.
    }
}

function readStoredAISettings(storageType: 'local' | 'session'): AISettings | null {
    const storage = getStorageSafe(storageType);
    if (!storage) {
        return null;
    }

    try {
        const rawValue = storage.getItem(AI_SETTINGS_STORAGE_KEY);
        if (!rawValue) {
            return null;
        }

        const parsed = JSON.parse(rawValue) as Partial<AISettings>;
        return sanitizeAISettings(parsed, {
            ...DEFAULT_AI_SETTINGS,
            storageMode: storageType,
        });
    } catch {
        return null;
    }
}

export function loadPersistedAISettings(): AISettings {
    const sessionSettings = readStoredAISettings('session');
    if (sessionSettings) {
        return sessionSettings;
    }

    return readStoredAISettings('local') ?? DEFAULT_AI_SETTINGS;
}

export function persistAISettings(settings: AISettings): void {
    const sanitizedSettings = sanitizeAISettings(settings, DEFAULT_AI_SETTINGS);
    const storage = getStorageSafe(sanitizedSettings.storageMode);
    if (!storage) {
        return;
    }

    try {
        storage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(sanitizedSettings));
        removeStoredAISettings(sanitizedSettings.storageMode === 'local' ? 'session' : 'local');
    } catch {
        // Ignore settings persistence failures so editor state remains usable.
    }
}

export function clearPersistedAISettings(): void {
    removeStoredAISettings('local');
    removeStoredAISettings('session');
}

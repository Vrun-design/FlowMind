const ANALYTICS_PREFERENCE_STORAGE_KEY = 'openflowkit-analytics-enabled';

type AnalyticsPreferenceListener = (enabled: boolean) => void;

const listeners = new Set<AnalyticsPreferenceListener>();

function readStoredPreference(): boolean | null {
  if (typeof window === 'undefined') return null;

  try {
    const rawValue = window.localStorage.getItem(ANALYTICS_PREFERENCE_STORAGE_KEY);
    if (rawValue === 'true') return true;
    if (rawValue === 'false') return false;
  } catch {
    // Ignore local preference read failures and fall back to defaults.
  }

  return null;
}

export function getAnalyticsPreference(): boolean {
  return readStoredPreference() ?? true;
}

export function setAnalyticsPreference(enabled: boolean): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(ANALYTICS_PREFERENCE_STORAGE_KEY, String(enabled));
    } catch {
      // Ignore local preference write failures and still notify listeners.
    }
  }

  listeners.forEach((listener) => {
    try {
      listener(enabled);
    } catch {
      // Analytics preference listeners are best-effort only.
    }
  });
}

export function subscribeToAnalyticsPreference(
  listener: AnalyticsPreferenceListener
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export type OnboardingEventName =
  | 'welcome_template_selected'
  | 'welcome_import_selected'
  | 'welcome_blank_selected'
  | 'welcome_prompt_selected'
  | 'template_inserted'
  | 'ai_key_saved'
  | 'first_export_completed'
  | 'first_share_opened';

export interface OnboardingEvent {
  name: OnboardingEventName;
  at: string;
  first: boolean;
  detail?: Record<string, string | number | boolean>;
}

const EVENT_LOG_STORAGE_KEY = 'openflowkit_onboarding_events';
const EVENT_FIRST_SEEN_STORAGE_KEY = 'openflowkit_onboarding_event_firsts';
const MAX_STORED_EVENTS = 100;

function readStorageValue(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorageValue(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore local-only instrumentation failures.
  }
}

function readEventLog(): OnboardingEvent[] {
  const raw = readStorageValue(EVENT_LOG_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OnboardingEvent[]) : [];
  } catch {
    return [];
  }
}

function readFirstSeenMap(): Partial<Record<OnboardingEventName, true>> {
  const raw = readStorageValue(EVENT_FIRST_SEEN_STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object'
      ? (parsed as Partial<Record<OnboardingEventName, true>>)
      : {};
  } catch {
    return {};
  }
}

export function recordOnboardingEvent(
  name: OnboardingEventName,
  detail?: Record<string, string | number | boolean>
): OnboardingEvent {
  const firstSeen = readFirstSeenMap();
  const event: OnboardingEvent = {
    name,
    at: new Date().toISOString(),
    first: firstSeen[name] !== true,
    detail,
  };

  const events = readEventLog();
  const nextEvents = [...events, event].slice(-MAX_STORED_EVENTS);
  writeStorageValue(EVENT_LOG_STORAGE_KEY, JSON.stringify(nextEvents));

  if (event.first) {
    writeStorageValue(
      EVENT_FIRST_SEEN_STORAGE_KEY,
      JSON.stringify({
        ...firstSeen,
        [name]: true,
      })
    );
  }

  return event;
}

export function getOnboardingEvents(): OnboardingEvent[] {
  return readEventLog();
}

export function clearOnboardingEvents(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(EVENT_LOG_STORAGE_KEY);
    window.localStorage.removeItem(EVENT_FIRST_SEEN_STORAGE_KEY);
  } catch {
    // Ignore cleanup failures in local-only instrumentation.
  }
}

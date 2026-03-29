import posthog from 'posthog-js';
import {
  getAnalyticsPreference,
  subscribeToAnalyticsPreference,
} from './analyticsSettings';
import { initializeSurfaceAnalytics } from './surfaceAnalyticsClient';

export type AnalyticsPropertyValue = string | number | boolean | null | undefined;
export type AnalyticsProperties = Record<string, AnalyticsPropertyValue>;

const POSTHOG_API_KEY = import.meta.env.VITE_POSTHOG_KEY?.trim();
const POSTHOG_API_HOST = import.meta.env.VITE_POSTHOG_HOST?.trim() || 'https://us.i.posthog.com';
const ANALYTICS_FEATURE_FLAG = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
const SESSION_MARKER_KEY = 'openflowkit.analytics.session-started';

let analyticsInitialized = false;
let analyticsPreferenceSyncInstalled = false;
let appSurfaceAnalytics = initializeSurfaceAnalytics({
  surface: 'app',
  apiKey: POSTHOG_API_KEY,
  apiHost: POSTHOG_API_HOST,
  enabled: false,
});

function isAnalyticsConfigured(): boolean {
  return ANALYTICS_FEATURE_FLAG && Boolean(POSTHOG_API_KEY) && typeof window !== 'undefined';
}

function sanitizeString(value: string): string {
  return value.trim().slice(0, 200);
}

function sanitizeProperties(properties?: AnalyticsProperties): Record<string, string | number | boolean | null> {
  if (!properties) return {};

  return Object.fromEntries(
    Object.entries(properties)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, typeof value === 'string' ? sanitizeString(value) : value ?? null])
  );
}

function syncPostHogPreference(enabled: boolean): void {
  if (!analyticsInitialized || !isAnalyticsConfigured()) {
    return;
  }

  if (enabled) {
    posthog.opt_in_capturing();
    return;
  }

  posthog.opt_out_capturing();
}

function ensurePreferenceSyncInstalled(): void {
  if (analyticsPreferenceSyncInstalled) {
    return;
  }

  subscribeToAnalyticsPreference(syncPostHogPreference);
  analyticsPreferenceSyncInstalled = true;
}

export function isAnalyticsEnabled(): boolean {
  return isAnalyticsConfigured() && getAnalyticsPreference();
}

export function initializeAnalytics(): void {
  if (!isAnalyticsConfigured() || analyticsInitialized || !POSTHOG_API_KEY) {
    return;
  }

  appSurfaceAnalytics = initializeSurfaceAnalytics({
    surface: 'app',
    apiKey: POSTHOG_API_KEY,
    apiHost: POSTHOG_API_HOST,
    enabled: true,
  });

  analyticsInitialized = true;
  ensurePreferenceSyncInstalled();

  if (!getAnalyticsPreference()) {
    posthog.opt_out_capturing();
  }
}

export function captureAnalyticsEvent(
  eventName: string,
  properties?: AnalyticsProperties
): void {
  if (!isAnalyticsEnabled()) {
    return;
  }

  initializeAnalytics();
  appSurfaceAnalytics.capture(eventName, sanitizeProperties(properties));
}

export function captureAnalyticsException(
  error: unknown,
  properties?: AnalyticsProperties
): void {
  captureAnalyticsEvent('unhandled_error', {
    error_name: error instanceof Error ? error.name : 'UnknownError',
    ...properties,
  });
}

function getReferrerHost(): string | null {
  if (typeof document === 'undefined' || !document.referrer) {
    return null;
  }

  try {
    return new URL(document.referrer).host;
  } catch {
    return 'invalid';
  }
}

function getLocationProperties(): AnalyticsProperties {
  if (typeof window === 'undefined') {
    return {};
  }

  const searchParams = new URLSearchParams(window.location.search);

  return {
    path: window.location.pathname,
    hash_path: window.location.hash || null,
    referrer_host: getReferrerHost(),
    utm_source: searchParams.get('utm_source'),
    utm_medium: searchParams.get('utm_medium'),
    utm_campaign: searchParams.get('utm_campaign'),
    utm_term: searchParams.get('utm_term'),
    utm_content: searchParams.get('utm_content'),
  };
}

export function captureAppOpened(): void {
  captureAnalyticsEvent('app_opened', getLocationProperties());
}

export function captureSessionStarted(): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.sessionStorage.getItem(SESSION_MARKER_KEY) === 'true') {
    return;
  }

  window.sessionStorage.setItem(SESSION_MARKER_KEY, 'true');
  captureAnalyticsEvent('session_started', getLocationProperties());
}

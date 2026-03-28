import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getAnalyticsPreference,
  setAnalyticsPreference,
  subscribeToAnalyticsPreference,
} from './analyticsSettings';

describe('analyticsSettings', () => {
  afterEach(() => {
    window.localStorage.removeItem('openflowkit-analytics-enabled');
  });

  it('defaults analytics preference to enabled', () => {
    expect(getAnalyticsPreference()).toBe(true);
  });

  it('persists analytics preference updates', () => {
    setAnalyticsPreference(false);

    expect(getAnalyticsPreference()).toBe(false);
    expect(window.localStorage.getItem('openflowkit-analytics-enabled')).toBe('false');
  });

  it('notifies subscribers when preference changes', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToAnalyticsPreference(listener);

    setAnalyticsPreference(false);

    expect(listener).toHaveBeenCalledWith(false);
    unsubscribe();
  });
});

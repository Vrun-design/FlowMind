import { beforeEach, describe, expect, it } from 'vitest';
import { clearOnboardingEvents, getOnboardingEvents, recordOnboardingEvent } from './events';

describe('onboarding events', () => {
  beforeEach(() => {
    localStorage.clear();
    clearOnboardingEvents();
  });

  it('marks the first occurrence of an event type', () => {
    const first = recordOnboardingEvent('welcome_template_selected', { source: 'welcome-modal' });
    const second = recordOnboardingEvent('welcome_template_selected', { source: 'home-empty' });

    expect(first.first).toBe(true);
    expect(second.first).toBe(false);
    expect(getOnboardingEvents()).toHaveLength(2);
  });

  it('stores event detail for lightweight local instrumentation', () => {
    recordOnboardingEvent('first_export_completed', { format: 'cinematic-video' });

    expect(getOnboardingEvents()[0]).toMatchObject({
      name: 'first_export_completed',
      first: true,
      detail: { format: 'cinematic-video' },
    });
  });
});

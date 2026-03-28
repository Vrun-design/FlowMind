import { afterEach, describe, expect, it, vi } from 'vitest';
import { captureAnalyticsEvent } from '@/services/analytics/analytics';
import {
  reportStorageTelemetry,
  setStorageTelemetryHandler,
  type StorageTelemetryEvent,
} from './storageTelemetry';

vi.mock('@/services/analytics/analytics', () => ({
  captureAnalyticsEvent: vi.fn(),
}));

describe('storageTelemetry', () => {
  afterEach(() => {
    setStorageTelemetryHandler(null);
    vi.mocked(captureAnalyticsEvent).mockClear();
  });

  it('forwards events to registered handler', () => {
    const handler = vi.fn();
    setStorageTelemetryHandler(handler);

    const event: StorageTelemetryEvent = {
      area: 'persist',
      code: 'TEST',
      severity: 'info',
      message: 'test message',
    };
    reportStorageTelemetry(event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  it('never throws when handler throws', () => {
    setStorageTelemetryHandler(() => {
      throw new Error('telemetry boom');
    });

    expect(() => {
      reportStorageTelemetry({
        area: 'schema',
        code: 'THROW',
        severity: 'warning',
        message: 'throw test',
      });
    }).not.toThrow();
  });

  it('forwards warning and error events to analytics capture', () => {
    setStorageTelemetryHandler(null);

    reportStorageTelemetry({
      area: 'snapshot',
      code: 'SNAPSHOT_SAVE_FALLBACK_LOCAL',
      severity: 'warning',
      message: 'warning test',
    });

    expect(captureAnalyticsEvent).toHaveBeenLastCalledWith('storage_issue_reported', {
      area: 'snapshot',
      code: 'SNAPSHOT_SAVE_FALLBACK_LOCAL',
      severity: 'warning',
    });
  });
});

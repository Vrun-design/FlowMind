import { useEffect, useState } from 'react';
import {
  getAnalyticsPreference,
  setAnalyticsPreference,
  subscribeToAnalyticsPreference,
} from '@/services/analytics/analyticsSettings';

export function useAnalyticsPreference(): [boolean, (enabled: boolean) => void] {
  const [enabled, setEnabled] = useState(() => getAnalyticsPreference());

  useEffect(() => {
    return subscribeToAnalyticsPreference(setEnabled);
  }, []);

  return [enabled, setAnalyticsPreference];
}

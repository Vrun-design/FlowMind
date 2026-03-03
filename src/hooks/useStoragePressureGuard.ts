import { useEffect, useRef } from 'react';
import { estimateTrackedLocalStorageUsageRatio } from '@/lib/storagePressure';
import { useToast } from '@/components/ui/ToastContext';

const WARN_RATIO = 0.7;
const RESET_RATIO = 0.6;

interface UseStoragePressureGuardOptions {
  trigger: unknown;
  onExportJSON: () => void;
}

export function useStoragePressureGuard({ trigger, onExportJSON }: UseStoragePressureGuardOptions): void {
  const { addToast } = useToast();
  const warnedRef = useRef(false);
  const confirmingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof localStorage === 'undefined') return;

    const ratio = estimateTrackedLocalStorageUsageRatio(localStorage);

    if (ratio < RESET_RATIO) {
      warnedRef.current = false;
    }

    if (ratio < WARN_RATIO || warnedRef.current || confirmingRef.current) {
      return;
    }

    warnedRef.current = true;
    const usagePercent = Math.round(ratio * 100);
    addToast(
      `Storage warning: local save usage is ~${usagePercent}%. Export a backup now to avoid data-loss risk.`,
      'warning',
      7000
    );

    confirmingRef.current = true;
    const shouldExport = window.confirm(
      `Local storage usage is about ${usagePercent}%. Download a JSON backup now?`
    );
    confirmingRef.current = false;

    if (shouldExport) {
      onExportJSON();
      addToast('Backup JSON downloaded.', 'success');
    }
  }, [trigger, addToast, onExportJSON]);
}

import { describe, expect, it } from 'vitest';
import { offlineRegistrationInternals } from './registerAppShellServiceWorker';

describe('registerAppShellServiceWorker', () => {
  it('resolves the service worker path from the Vite base URL', () => {
    expect(offlineRegistrationInternals.resolveServiceWorkerUrl('/')).toBe('/sw.js');
    expect(offlineRegistrationInternals.resolveServiceWorkerUrl('./')).toBe('./sw.js');
    expect(offlineRegistrationInternals.resolveServiceWorkerUrl('/app')).toBe('/app/sw.js');
  });
});

function resolveServiceWorkerUrl(baseUrl: string): string {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBaseUrl}sw.js`;
}

function shouldRegisterServiceWorker(): boolean {
  return typeof window !== 'undefined'
    && typeof navigator !== 'undefined'
    && 'serviceWorker' in navigator
    && import.meta.env.PROD;
}

export function registerAppShellServiceWorker(): void {
  if (!shouldRegisterServiceWorker()) {
    return;
  }

  const serviceWorkerUrl = resolveServiceWorkerUrl(import.meta.env.BASE_URL);
  const register = (): void => {
    void navigator.serviceWorker.register(serviceWorkerUrl, {
      scope: import.meta.env.BASE_URL,
    });
  };

  if (document.readyState === 'complete') {
    register();
    return;
  }

  window.addEventListener('load', register, { once: true });
}

export const offlineRegistrationInternals = {
  resolveServiceWorkerUrl,
};

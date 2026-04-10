'use client';

import { useEffect } from 'react';

const HOTFIX_VERSION = '2026-04-10-auth-me-loop-fix';
const HOTFIX_STORAGE_KEY = 'ayahay-sw-hotfix-version';

export default function DevServiceWorkerReset() {
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        if (!('serviceWorker' in navigator)) return;

        const registrations = await navigator.serviceWorker.getRegistrations();

        if (process.env.NODE_ENV === 'development') {
          await Promise.all(registrations.map((reg) => reg.unregister()));

          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((key) => caches.delete(key)));
          }

          if (!cancelled) {
            console.info('[dev] Service workers unregistered and caches cleared.');
          }
          return;
        }

        if (localStorage.getItem(HOTFIX_STORAGE_KEY) === HOTFIX_VERSION) {
          return;
        }

        await Promise.all(registrations.map((reg) => reg.update()));

        if ('caches' in window) {
          const keys = await caches.keys();
          const pwaKeys = keys.filter((key) => /offlinecache|workbox|start-url/i.test(key));
          await Promise.all(pwaKeys.map((key) => caches.delete(key)));
        }

        localStorage.setItem(HOTFIX_STORAGE_KEY, HOTFIX_VERSION);

        if (!cancelled) {
          console.info('[pwa-hotfix] Service worker updated and auth-sensitive caches cleared.');
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('[pwa-hotfix] Failed to reset service worker/caches:', error);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

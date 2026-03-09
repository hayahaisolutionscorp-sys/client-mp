'use client';

import { useEffect } from 'react';

export default function DevServiceWorkerReset() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    let cancelled = false;

    const run = async () => {
      try {
        if (!('serviceWorker' in navigator)) return;

        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));

        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        }

        if (!cancelled) {
          console.info('[dev] Service workers unregistered and caches cleared.');
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('[dev] Failed to reset service worker/caches:', error);
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

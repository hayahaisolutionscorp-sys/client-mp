'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistry() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            if (process.env.NODE_ENV === 'development') {
                // In development, unregister any active service workers to avoid caching issues
                // and 404 errors for build manifests.
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (const registration of registrations) {
                        registration.unregister();
                    }
                });
                return;
            }

            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }, []);

    return null;
}

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
                        console.log('Service Worker unregistered in development mode');
                    }
                });
                return;
            }

            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }, []);

    return null;
}

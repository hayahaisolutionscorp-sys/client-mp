'use client';

import { useEffect, useRef } from 'react';

type AuthMeta = {
  access_token_expires_at?: string;
};

const REFRESH_SKEW_MS = 60 * 1000;
const MIN_DELAY_MS = 5 * 1000;

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}

function readAuthMeta(): AuthMeta | null {
  const raw = getCookie('auth_meta');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthMeta;
  } catch {
    return null;
  }
}

export function ProactiveRefreshScheduler() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const clearTimer = () => {
      if (!timerRef.current) {
        return;
      }

      clearTimeout(timerRef.current);
      timerRef.current = null;
    };

    const refreshSession = async () => {
      if (refreshPromiseRef.current) {
        return refreshPromiseRef.current;
      }

      refreshPromiseRef.current = fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })
        .then(() => undefined)
        .finally(() => {
          refreshPromiseRef.current = null;
        });

      return refreshPromiseRef.current;
    };

    const schedule = () => {
      clearTimer();

      const meta = readAuthMeta();
      if (!meta?.access_token_expires_at) {
        return;
      }

      const expiresAtMs = new Date(meta.access_token_expires_at).getTime();
      if (Number.isNaN(expiresAtMs)) {
        return;
      }

      const delayMs = Math.max(expiresAtMs - Date.now() - REFRESH_SKEW_MS, MIN_DELAY_MS);

      timerRef.current = setTimeout(async () => {
        await refreshSession();
        schedule();
      }, delayMs);
    };

    const handleVisibilityOrFocus = async () => {
      const meta = readAuthMeta();
      if (!meta?.access_token_expires_at) {
        schedule();
        return;
      }

      const expiresAtMs = new Date(meta.access_token_expires_at).getTime();
      if (Number.isNaN(expiresAtMs)) {
        schedule();
        return;
      }

      if (expiresAtMs - Date.now() <= REFRESH_SKEW_MS) {
        await refreshSession();
      }

      schedule();
    };

    schedule();

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      clearTimer();
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, []);

  return null;
}
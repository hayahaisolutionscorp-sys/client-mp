import axios from 'axios';
import { fetchItem } from 'helpers/cache.helpers';

const instance = axios.create({
  withCredentials: true
});

// Note: We no longer manually decode tokens or check expiration on the frontend.
// The backend handles session state via HTTP-Only cookies.

// Track if we're currently refreshing to avoid duplicate refresh calls
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;
const pendingRequests: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

function resolvePendingRequests() {
  while (pendingRequests.length > 0) {
    const subscriber = pendingRequests.shift();
    subscriber?.resolve();
  }
}

function rejectPendingRequests(error: unknown) {
  while (pendingRequests.length > 0) {
    const subscriber = pendingRequests.shift();
    subscriber?.reject(error);
  }
}

function waitForRefresh(): Promise<void> {
  return new Promise((resolve, reject) => {
    pendingRequests.push({ resolve, reject });
  });
}

const normalizeErrorText = (value: unknown): string => {
  if (typeof value === 'string') return value.toLowerCase();
  if (value && typeof value === 'object') {
    try {
      return JSON.stringify(value).toLowerCase();
    } catch {
      return '';
    }
  }
  return '';
};

/**
 * Shared function to handle token refresh.
 * Ensures only one refresh call is made even if multiple requests trigger it.
 */
const handleTokenRefresh = async () => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
      resolvePendingRequests();
      return response.data;
    } catch (error: any) {
      // If refresh fails (especially 401), the refresh token is invalid.
      // We must perform a thorough cleanup to stop further refresh attempts and ensure a clean state.
      const { invalidateItem } = await import('helpers/cache.helpers');
      const { eraseCookie } = await import('helpers/cookie.helpers');
      const { accountRelatedCacheKeys } = await import('constants/cache');

      // Clear authentication cookies
      eraseCookie('user');
      eraseCookie('access_token');
      eraseCookie('refresh_token');
      eraseCookie('auth_meta');

      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store',
        });
      } catch {
        // Ignore logout transport errors and continue local cleanup.
      }

      // Clear all account-related cache items
      accountRelatedCacheKeys.forEach((key) => invalidateItem(key as any));

      // Specifically ensure jwt is cleared (though it's in accountRelatedCacheKeys)
      invalidateItem('jwt');

      // If refresh fails, dispatch session expired event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('session-expired'));
      }

      rejectPendingRequests(error);
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

instance.interceptors.request.use(
  async (config) => {
    // Read access_token from document.cookie (non-httpOnly) and attach as Authorization header.
    // This is required for cross-origin requests to api.hayahai.com since browser cookies
    // are scoped to client-mp.hayahai.com and cannot be sent cross-subdomain.
    if (typeof document !== 'undefined') {
      const match = document.cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('access_token='));
      if (match) {
        const accessToken = decodeURIComponent(match.split('=')[1]);
        config.headers = config.headers || {};
        (config.headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const errorMessage = normalizeErrorText(error.response?.data?.message);
    const errorText = normalizeErrorText(error.response?.data?.error);

    // Handle 401 Unauthorized errors and "invalid token" messages
    const isUnauthorized = error.response?.status === 401;
    const isInvalidToken = errorMessage.includes('invalid token') || errorText.includes('invalid token');

    if ((isUnauthorized || isInvalidToken) && !originalRequest._retry) {
      // Use logged-in-account as the indicator for authenticated sessions.
      // This is set in AuthContext and persistent in cache.
      const isLoggedIn = !!fetchItem<any>('logged-in-account');
      if (!isLoggedIn) {
        return Promise.reject(error);
      }

      // Avoid infinite loops: never retry /auth/me or /auth/refresh themselves,
      // and don't attempt refresh on login/register pages.
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register' &&
        !originalRequest.url?.includes('/api/auth/refresh') &&
        !originalRequest.url?.includes('/auth/me')
      ) {
        originalRequest._retry = true;

        try {
          if (!isRefreshing) {
            await handleTokenRefresh();
          } else {
            await waitForRefresh();
          }

          return instance(originalRequest);
        } catch (refreshError: any) {
          const refreshMessage = normalizeErrorText(refreshError.response?.data?.message);

          // If refresh itself fails with 401 or invalid token, we're done
          const isRefreshAuthError = refreshError.response?.status === 401 || 
                                     refreshMessage.includes('invalid token');
          
          if (isRefreshAuthError) {
            return Promise.reject({ ...refreshError, _silent: true });
          }
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default instance;

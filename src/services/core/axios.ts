import axios from 'axios';
import { fetchItem } from 'helpers/cache.helpers';

const instance = axios.create({
  withCredentials: true,
});

// Note: We no longer manually decode tokens or check expiration on the frontend.
// The backend handles session state via HTTP-Only cookies.

// Track if we're currently refreshing to avoid duplicate refresh calls
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

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
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const response = await axios.post(`${apiBaseUrl}/auth/refresh`, {}, { withCredentials: true });
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

      // Clear all account-related cache items
      accountRelatedCacheKeys.forEach(key => invalidateItem(key as any));

      // Specifically ensure jwt is cleared (though it's in accountRelatedCacheKeys)
      invalidateItem('jwt');

      // If refresh fails, dispatch session expired event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('session-expired'));
      }
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
    // Note: The system now relies on httpOnly cookies for authentication.
    // withCredentials: true ensures cookies are sent automatically.
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

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If the user was never authenticated (no JWT), skip refresh entirely.
      // This allows unauthenticated users to make API calls without
      // triggering the "Session Expired" modal.
      const existingToken = fetchItem<string>('jwt');
      if (!existingToken) {
        return Promise.reject(error);
      }

      // Avoid infinite loops and don't try to refresh if already on login/register
      if (typeof window !== 'undefined' &&
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register' &&
        !originalRequest.url?.includes('/auth/refresh')) {

        originalRequest._retry = true;

        try {
          // Attempt to refresh the token using the shared logic
          await handleTokenRefresh();

          return instance(originalRequest);
        } catch (refreshError: any) {
          // Only throw if not a 401, as 401 is handled by logout/redirect logic elsewhere
          if (refreshError.response?.status === 401) {
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
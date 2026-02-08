import axios from 'axios';
import { fetchItem } from 'helpers/cache.helpers';

const instance = axios.create({
  withCredentials: true,
});

// Utility function to decode JWT and check expiration
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    // Check if token is expired or will expire in the next 60 seconds
    return expirationTime < currentTime + 60000;
  } catch (error) {
    // If we can't decode the token, consider it expired
    return true;
  }
};

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
    const authToken = fetchItem<string>('jwt');
    
    // Skip token refresh for the refresh endpoint itself
    if (config.url?.includes('/auth/refresh')) {
      return config;
    }
    
    if (authToken) {
      // Check if access token has expired
      if (isTokenExpired(authToken)) {
        try {
          await handleTokenRefresh();
          
          // Get the new token after refresh
          const newToken = fetchItem<string>('jwt');
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
        } catch (refreshError) {
          // If refresh fails, we still let the request proceed? 
          // Usually better to fail here or let it fall through to 401 handling
          console.warn('Preemptive refresh failed, proceeding with expired token');
        }
      } else {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
    }
    
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
      // Avoid infinite loops and don't try to refresh if already on login/register
      if (typeof window !== 'undefined' && 
          window.location.pathname !== '/login' && 
          window.location.pathname !== '/register' &&
          !originalRequest.url?.includes('/auth/refresh')) {
        
        originalRequest._retry = true;
        
        try {
          // Attempt to refresh the token using the shared logic
          await handleTokenRefresh();
          
          // If refresh succeeds, update headers and retry the original request
          const newToken = fetchItem<string>('jwt');
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
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
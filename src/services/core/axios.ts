import axios from 'axios';
import { fetchItem } from 'helpers/cache.helpers';

const instance = axios.create({
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const authToken = fetchItem<string>('jwt');
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
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
          // Attempt to refresh the token
          // The backend expects the refresh_token in a cookie (handled by withCredentials: true)
          // We use the same environment variable as defined in constants/api.ts
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
          await instance.post(`${apiBaseUrl}/auth/refresh`);
          
          // If refresh succeeds, retry the original request
          return instance(originalRequest);
        } catch (refreshError) {
          // If refresh fails, the session is truly expired
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('session-expired'));
          }
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
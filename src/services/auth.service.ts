import axios from '@/services/core/axios';
import { AUTH_API } from 'constants/api';
import { RegisterForm, LoginForm } from '@/models';

export const AuthService = {
  register: async (data: RegisterForm) => {
    const response = await axios.post(`${AUTH_API}/register`, data);
    return response.data;
  },

  login: async (data: LoginForm) => {
    const response = await axios.post(`${AUTH_API}/login`, data);
    return response.data;
  },

  lookupEmail: async (email: string) => {
    return await axios.post(`${AUTH_API}/lookup`, { email });
  },

  logout: async () => {
    const response = await axios.post(`${AUTH_API}/logout`);
    return response.data;
  },

  getProfile: async () => {
    try {
      const response = await axios.get(`${AUTH_API}/me`);
      return response.data;
    } catch (error: any) {
      // Silently handle 401 (no session) and 403 (session exists but no role yet)
      // as both mean the user is effectively not usable in the current state.
      if (error.response?.status === 401 || error.response?.status === 403) {
        return null;
      }
      throw error;
    }
  },

  updateProfile: async (data: any) => {
    const response = await axios.patch(`${AUTH_API}/me`, data);
    return response.data;
  },

  verifyToken: async () => {
    const response = await axios.get(`${AUTH_API}/verify-token`);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await axios.post(`${AUTH_API}/forgot-password`, { email });
    return response.data;
  },

  verifyResetCode: async (email: string, code: string) => {
    const response = await axios.post(`${AUTH_API}/verify-reset-code`, { email, code });
    return response.data;
  },

  resetPassword: async (data: any) => {
    const response = await axios.post(`${AUTH_API}/reset-password`, data);
    return response.data;
  },

  changePassword: async (data: any) => {
    const response = await axios.post(`${AUTH_API}/change-password`, data);
    return response.data;
  },

  refreshToken: async () => {
    const response = await axios.post(`${AUTH_API}/refresh`);
    return response.data;
  },

  signInWithGoogle: () => {
    return new Promise((resolve, reject) => {
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        `${AUTH_API}/google`,
        'Google Sign In',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );

      // Listen for message from popup
      const handleMessage = (event: MessageEvent) => {
        // Verify the origin for security
        const apiOrigin = new URL(AUTH_API).origin;

        // Allow exact match or mismatch log for debugging
        if (event.origin !== apiOrigin) {
          console.warn('OAuth Origin Warning:', { expected: apiOrigin, received: event.origin });
          // If the origin is very different, we ignore.
          // But often it's just a trailing slash issue.
          if (!apiOrigin.includes(event.origin) && !event.origin.includes(apiOrigin)) {
            return;
          }
        }

        if (event.data && (event.data.type === 'oauth-success' || event.data.type === 'oauth-error')) {
          window.removeEventListener('message', handleMessage);
          popup?.close();

          if (event.data.type === 'oauth-success') {
            resolve(event.data);
          } else {
            reject(new Error(event.data.error || 'OAuth failed'));
          }
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was blocked
      if (!popup) {
        window.removeEventListener('message', handleMessage);
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }

      // Clean up if popup is closed manually
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // Give handleMessage a tiny bit of time to catch the last message if any
          setTimeout(() => {
            window.removeEventListener('message', handleMessage);
            reject(new Error('Authentication cancelled'));
          }, 500);
        }
      }, 1000);
    });
  },

  signInWithFacebook: () => {
    return new Promise((resolve, reject) => {
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        `${AUTH_API}/facebook`,
        'Facebook Sign In',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );

      // Listen for message from popup
      const handleMessage = (event: MessageEvent) => {
        // Verify the origin for security
        const apiOrigin = new URL(AUTH_API).origin;

        if (event.origin !== apiOrigin) {
          console.warn('Facebook OAuth Origin Warning:', { expected: apiOrigin, received: event.origin });
          if (!apiOrigin.includes(event.origin) && !event.origin.includes(apiOrigin)) {
            return;
          }
        }

        if (event.data && (event.data.type === 'oauth-success' || event.data.type === 'oauth-error')) {
          window.removeEventListener('message', handleMessage);
          popup?.close();

          if (event.data.type === 'oauth-success') {
            resolve(event.data);
          } else {
            reject(new Error(event.data.error || 'OAuth failed'));
          }
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was blocked
      if (!popup) {
        window.removeEventListener('message', handleMessage);
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }

      // Clean up if popup is closed manually
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setTimeout(() => {
            window.removeEventListener('message', handleMessage);
            reject(new Error('Authentication cancelled'));
          }, 500);
        }
      }, 1000);
    });
  },

  disconnectSocialProvider: async (provider: 'google' | 'facebook') => {
    const response = await axios.delete(`${AUTH_API}/disconnect/${provider}`);
    return response.data;
  }
};

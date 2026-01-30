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

    logout: async () => {
        const response = await axios.post(`${AUTH_API}/logout`);
        return response.data;
    },

    getProfile: async () => {
        try {
            const response = await axios.get(`${AUTH_API}/me`);
            const { cacheItem } = await import('helpers/cache.helpers');
            cacheItem('logged-in-user-profile', response.data.data || response.data);
            return response.data;
        } catch (error: any) {
            // Silently handle 401 as it's expected for unauthenticated users
            if (error.response?.status === 401) {
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
                const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
                if (event.origin !== apiUrl) return;

                if (event.data.type === 'oauth-success') {
                    window.removeEventListener('message', handleMessage);
                    popup?.close();
                    resolve(event.data);
                } else if (event.data.type === 'oauth-error') {
                    window.removeEventListener('message', handleMessage);
                    popup?.close();
                    reject(new Error(event.data.error || 'OAuth failed'));
                }
            };

            window.addEventListener('message', handleMessage);

            // Check if popup was blocked
            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                window.removeEventListener('message', handleMessage);
                reject(new Error('Popup blocked. Please allow popups for this site.'));
            }

            // Clean up if popup is closed manually
            const checkClosed = setInterval(() => {
                if (popup?.closed) {
                    clearInterval(checkClosed);
                    window.removeEventListener('message', handleMessage);
                    reject(new Error('Authentication cancelled'));
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
                const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
                if (event.origin !== apiUrl) return;

                if (event.data.type === 'oauth-success') {
                    window.removeEventListener('message', handleMessage);
                    popup?.close();
                    resolve(event.data);
                } else if (event.data.type === 'oauth-error') {
                    window.removeEventListener('message', handleMessage);
                    popup?.close();
                    reject(new Error(event.data.error || 'OAuth failed'));
                }
            };

            window.addEventListener('message', handleMessage);

            // Check if popup was blocked
            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                window.removeEventListener('message', handleMessage);
                reject(new Error('Popup blocked. Please allow popups for this site.'));
            }

            // Clean up if popup is closed manually
            const checkClosed = setInterval(() => {
                if (popup?.closed) {
                    clearInterval(checkClosed);
                    window.removeEventListener('message', handleMessage);
                    reject(new Error('Authentication cancelled'));
                }
            }, 1000);
        });
    },

    disconnectSocialProvider: async (provider: 'google' | 'facebook') => {
        const response = await axios.delete(`${AUTH_API}/disconnect/${provider}`);
        return response.data;
    }
};

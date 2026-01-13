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
        const response = await axios.get(`${AUTH_API}/me`);
        const { cacheItem } = await import('helpers/cache.helpers');
        cacheItem('logged-in-user-profile', response.data.data || response.data);
        return response.data;
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
    }
};

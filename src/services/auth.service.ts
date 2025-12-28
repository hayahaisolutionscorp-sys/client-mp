import axios from '@/services/core/axios';
import { AUTH_API } from 'constants/api';
// Types are handled via Any or local interfaces for now until centralized types are compatible
// import { LoginDto, RegisterDto, ... } from '@/types/auth.types';

// We need to define these types since we can't import DTOs effectively from the client-api directly
// or we should use the models. 
// However, the models in marketplace might not match exactly the DTOs expected by the API.
// Let's rely on the interfaces we will define or import.
// For now, I will define the interaction types here or use 'any' if strictly necessary, 
// but better to allow the caller to pass usage-specific types.
// Actually, looking at AuthContext, it imports RegisterForm.

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

    resetPassword: async (data: any) => {
        const response = await axios.post(`${AUTH_API}/reset-password`, data);
        return response.data;
    },

    changePassword: async (data: any) => {
        const response = await axios.post(`${AUTH_API}/change-password`, data);
        return response.data;
    }
};

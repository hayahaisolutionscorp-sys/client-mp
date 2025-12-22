'use client';

import { createContext, useContext, useState } from 'react';
import { IAccount, RegisterForm } from '@/models';

interface AuthContextType {
    currentUser: any | null; // Keeping loose type for compatibility
    loggedInAccount: IAccount | undefined | null;
    hasPrivilegedAccess: boolean;
    loading: boolean;
    register: (email: string, password: string, values: RegisterForm) => Promise<string>;
    signIn: (email: string, password: string) => Promise<string>;
    signInWithGoogle: () => Promise<any | null>;
    signInWithFacebook: () => Promise<any | null>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<boolean>;
    sendEmailVerification: (user: any) => Promise<void>;
    notification: {
        type: 'success' | 'error' | null;
        message: string;
    } | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthContextProvider');
    }
    return context;
};

export default function AuthContextProvider({ children }: { children: React.ReactNode }) {
    // Dummy state - no session persistence
    const [loading] = useState(false);
    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    } | null>(null);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    // Mock functions
    const register = async (email: string, password: string, values: RegisterForm) => {
        console.log('Dummy Register:', email);
        showNotification('success', 'Dummy Registration successful!');
        return 'dummy-uid';
    };

    const signIn = async (email: string, password: string): Promise<string> => {
        console.log('Dummy SignIn:', email);
        showNotification('success', 'Dummy Login successful!');
        return 'dummy-uid';
    };

    const signInWithGoogle = async () => {
        console.log('Dummy SignInWithGoogle');
        showNotification('success', 'Dummy Google Login successful!');
        return { user: { uid: 'dummy-google-uid', email: 'test@example.com' } };
    };

    const signInWithFacebook = async () => {
        console.log('Dummy SignInWithFacebook');
        showNotification('success', 'Dummy Facebook Login successful!');
        return { user: { uid: 'dummy-facebook-uid', email: 'test@example.com' } };
    };

    const resetPassword = async (email: string): Promise<boolean> => {
        console.log('Dummy ResetPassword:', email);
        showNotification('success', 'Dummy Password reset email sent successfully!');
        return true;
    };

    const sendEmailVerification = async (user: any) => {
        console.log('Dummy SendEmailVerification');
    };

    const logout = async (): Promise<void> => {
        console.log('Dummy Logout');
        showNotification('success', 'Logged out successfully');
    };

    const value: AuthContextType = {
        currentUser: null,
        loggedInAccount: null,
        hasPrivilegedAccess: false,
        loading,
        register,
        signIn,
        logout,
        signInWithGoogle,
        signInWithFacebook,
        resetPassword,
        sendEmailVerification,
        notification
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            {notification && (
                <div
                    className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-opacity duration-300 ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                >
                    {notification.message}
                </div>
            )}
        </AuthContext.Provider>
    );
}


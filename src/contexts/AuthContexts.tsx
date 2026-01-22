'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IAccount, RegisterForm } from '@/models';
import { AuthService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { getCookie, eraseCookie } from 'helpers/cookie.helpers';
import { invalidateItem } from 'helpers/cache.helpers';
import { accountRelatedCacheKeys } from 'constants/cache';

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
    forgotPassword: (email: string) => Promise<boolean>;
    verifyResetCode: (email: string, code: string) => Promise<boolean>;
    confirmResetPassword: (data: any) => Promise<boolean>;
    sendEmailVerification: (user: any) => Promise<void>;
    notification: {
        type: 'success' | 'error' | null;
        message: string;
    } | null;
    refreshProfile: () => Promise<void>;
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
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    // Initial state hydration from non-httpOnly 'user' cookie
    const [currentUser, setCurrentUser] = useState<any | null>(() => {
        if (typeof window === 'undefined') return null;
        const userJson = getCookie('user');
        if (userJson) {
            try {
                // Decode and parse the JSON user object from cookie
                return JSON.parse(decodeURIComponent(userJson));
            } catch (e) {
                console.error('Failed to parse user cookie', e);
                return null;
            }
        }
        return null;
    });

    const [loggedInAccount, setLoggedInAccount] = useState<IAccount | null>(() => {
        if (typeof window === 'undefined') return null;
        const userJson = getCookie('user');
        if (userJson) {
            try {
                const user = JSON.parse(decodeURIComponent(userJson));
                return {
                    id: user.id || user.accountId,
                    email: user.email,
                    role: user.role || 'Passenger',
                    emailConsent: false,
                } as IAccount;
            } catch (e) {
                return null;
            }
        }
        return null;
    });

    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    } | null>(null);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    // Load user profile on mount
    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            const result = await AuthService.getProfile();
            // result is { message: string, data: UserResponseDto }
            const user = result.data || result;

            setCurrentUser(user);

            // Mapping from UserResponseDto (which has passenger object) to IAccount
            const account: IAccount = {
                id: user.id || user.accountId,
                email: user.email,
                role: user.role || (user.roles?.[0]?.name) || 'Passenger',
                emailConsent: false,
                passenger: user.passenger || undefined,
                verification: Array.isArray(user.verificationDetails) ? user.verificationDetails[0] : (user.verificationDetails || user.verification || undefined),
                verificationDetails: Array.isArray(user.verificationDetails) 
                    ? user.verificationDetails 
                    : (user.verificationDetails ? [user.verificationDetails] : undefined)
            };
            setLoggedInAccount(account);

        } catch (error: any) {
            console.log('Failed to load profile', error);
            // Only clear session if it's a 401 Unauthorized error
            // This prevents logging out on network errors or server downtime
            if (error.response?.status === 401) {
                setCurrentUser(null);
                setLoggedInAccount(null);
                eraseCookie('user');
                accountRelatedCacheKeys.forEach(key => invalidateItem(key as any));
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const register = async (email: string, password: string, values: RegisterForm) => {
        try {
            setLoading(true);
            // Map values to API DTO (BaseUserDto: name, email, password)
            // Destructure to remove fields that shouldn't be sent to API
            const { confirm, agreement, ...cleanValues } = values;

            const payload = {
                name: `${values.firstName} ${values.lastName}`.trim(),
                ...cleanValues,
                email, // Ensure email from argument is used
                password, // Ensure password from argument is used
            };

            await AuthService.register(payload as any);
            // 'as any' because AuthService register expects RegisterForm but API expects RegisterDto logic. 
            // Wait, I defined AuthService.register to take RegisterForm.
            // But the API call uses that object.
            // The API will strip extra fields.
            // Ideally I should construct the object that matches the API expectation.

            showNotification('success', 'Registration successful!');

            // Auto login? The API register does NOT automatically login usually, 
            // but the controller implementation sets cookies?
            // Controller register: sets cookies.
            // So we ARE logged in.

            await loadProfile();

            return 'success';
        } catch (error: any) {
            console.error('Registration error:', error);
            const msg = error.response?.data?.message || 'Registration failed';
            // showNotification('error', msg); // Handled by component
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string, password: string): Promise<string> => {
        try {
            setLoading(true);
            await AuthService.login({ email, password });
            showNotification('success', 'Login successful!');
            await loadProfile();
            return 'success';
        } catch (error: any) {
            console.error('Login error:', error);
            const msg = error.response?.data?.message || 'Login failed';
            showNotification('error', msg);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        try {
            setLoading(true);
            await AuthService.signInWithGoogle();
            showNotification('success', 'Welcome to Ayahay!');
            await loadProfile();
            return 'success';
        } catch (error: any) {
            console.error('Google sign-in error:', error);
            const msg = error.message || 'Google sign-in failed';
            showNotification('error', msg);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signInWithFacebook = async () => {
        try {
            setLoading(true);
            await AuthService.signInWithFacebook();
            showNotification('success', 'Welcome to Ayahay!');
            await loadProfile();
            return 'success';
        } catch (error: any) {
            console.error('Facebook sign-in error:', error);
            const msg = error.message || 'Facebook sign-in failed';
            showNotification('error', msg);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const forgotPassword = async (email: string): Promise<boolean> => {
        try {
            setLoading(true);
            await AuthService.forgotPassword(email);
            showNotification('success', 'Password reset email sent (if account exists)');
            return true;
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to request password reset';
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    const verifyResetCode = async (email: string, code: string): Promise<boolean> => {
        try {
            setLoading(true);
            await AuthService.verifyResetCode(email, code);
            showNotification('success', 'Password reset code verified successfully!');
            return true;
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to verify password reset code';
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    const sendEmailVerification = async (user: any) => {
        // No endpoint for this in current API
        console.warn('sendEmailVerification not supported by API');
    };

    const confirmResetPassword = async (data: any): Promise<boolean> => {
        try {
            setLoading(true);
            await AuthService.resetPassword(data);
            showNotification('success', 'Password reset successful!');
            return true;
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to reset password';
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            setLoading(true);
            await AuthService.logout();
            setCurrentUser(null);
            setLoggedInAccount(null);
            eraseCookie('user');
            // Clear account related cache
            accountRelatedCacheKeys.forEach(key => invalidateItem(key as any));
            router.push('/');
        } catch (error) {
            console.error('Logout error', error);
            // Clear local state anyway on failure
            setCurrentUser(null);
            setLoggedInAccount(null);
            eraseCookie('user');
            accountRelatedCacheKeys.forEach(key => invalidateItem(key as any));
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const value: AuthContextType = {
        currentUser,
        loggedInAccount,
        hasPrivilegedAccess: loggedInAccount?.role === 'SuperAdmin' || loggedInAccount?.role === 'ShippingLineAdmin' || loggedInAccount?.role === 'TravelAgencyAdmin' || loggedInAccount?.role === 'ClientAdmin',
        loading,
        register,
        signIn,
        logout,
        signInWithGoogle,
        signInWithFacebook,
        forgotPassword,
        verifyResetCode,
        confirmResetPassword,
        sendEmailVerification,
        notification,
        refreshProfile: loadProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            {notification && (
                <div
                    className="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-opacity duration-300 text-white"
                    style={{
                        backgroundColor: notification.type === 'success' ? '#22c55e' : '#ef4444'
                    }}
                >
                    {notification?.message}
                </div>
            )}
        </AuthContext.Provider>
    );


}


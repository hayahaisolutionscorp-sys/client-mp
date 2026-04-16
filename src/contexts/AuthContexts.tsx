'use client';

import { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from 'react';
import { IAccount, RegisterForm } from '@/models';
import { AuthService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { cacheItem, fetchItem, invalidateItem } from 'helpers/cache.helpers';
import { accountRelatedCacheKeys } from 'constants/cache';
import { useTheme } from "@/components/ThemeProvider";
import { mapApiUserToAccount } from '@/lib/auth/map-api-user-to-account';

interface AuthContextType {
    currentUser: IAccount | undefined | null;
    hasPrivilegedAccess: boolean;
    loading: boolean;
    register: (email: string, password: string, values: RegisterForm) => Promise<string>;
    signIn: (email: string, password: string) => Promise<string>;
    signInWithGoogle: () => Promise<any | null>;
    signInWithFacebook: () => Promise<any | null>;
    signInWithHayahai: () => Promise<any | null>;
    logout: () => Promise<void>;
    forgotPassword: (email: string) => Promise<boolean>;
    verifyResetCode: (email: string, code: string) => Promise<boolean>;
    confirmResetPassword: (data: any) => Promise<boolean>;
    sendEmailVerification: (user: any) => Promise<void>;
    notification: {
        type: 'success' | 'error' | null;
        message: string;
    } | null;
    branding: any;
    theme: any;
    refreshProfile: (force?: boolean) => Promise<void>;
    clearSession: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthContextProvider');
    }
    return context;
};

export default function AuthContextProvider({
    children,
    initialUser = null,
    hasSessionCookies = false,
}: {
    children: React.ReactNode;
    /** From server cookies â€” matches client first paint so navbar auth chrome is immediate */
    initialUser?: IAccount | null;
    /** From server: access/refresh token present (run /me on client even if user cookie missing) */
    hasSessionCookies?: boolean;
}) {
    const router = useRouter();
    // Read branding/theme directly from ThemeProvider to avoid the extra local-state
    // layer that useBranding()/useThemeSettings() maintain.  Those hooks each call
    // setBranding/setThemeSettings on every navigation which caused AuthContextProvider
    // to re-render twice per navigation for no benefit (auth state never changes).
    const { branding: themeBranding, themeSettings } = useTheme();

    // Read cached account only once on mount to avoid creating new object references
    // that would trigger the loadProfile useEffect on every render.
    const [cachedAccount] = useState<IAccount | null>(
        () => fetchItem<IAccount>('logged-in-account') || null
    );

    // When `initialUser` is set from root layout (session cookies), first paint matches SSR and
    // navbar shows My Bookings / notifications immediately; loadProfile still refreshes from /me.
    const [currentUser, setCurrentUser] = useState<IAccount | null>(() => initialUser ?? null);
    const [loading, setLoading] = useState(false);

    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    } | null>(null);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const clearSession = useCallback(() => {
        AuthService.clearProfileCache();
        setCurrentUser(null);
        accountRelatedCacheKeys.forEach(key => invalidateItem(key as any));
    }, []);

    const loadingRef = useRef(false);

    const loadProfile = useCallback(async (
        _force: boolean = false,
        options?: { skipLoadingSpinner?: boolean }
    ) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        const showSpinner = !options?.skipLoadingSpinner;
        try {
            if (showSpinner) {
                setLoading(true);
            }
            const result = await AuthService.getProfile(_force);
            if (!result) {
                setCurrentUser(null);
                return null;
            }

            const user = result.data || result;

            if (!user || typeof user !== 'object' || Object.keys(user).length === 0) {
                console.warn('Profile fetch returned invalid user data', result);
                setCurrentUser(null);
                return null;
            }

            const account = mapApiUserToAccount(user);
            if (!account) {
                setCurrentUser(null);
                return null;
            }

            setCurrentUser(account);
            cacheItem('logged-in-account', account);

            return user;
        } catch (error: any) {
            if (error.response?.status === 401) {
                clearSession();
                accountRelatedCacheKeys.forEach(key => invalidateItem(key as any));
            }
            return null;
        } finally {
            loadingRef.current = false;
            if (showSpinner) {
                setLoading(false);
            }
        }
    }, [clearSession]);

    // Match pre-change behavior: skeleton only when localStorage says we were logged in (cachedAccount).
    // Do not tie loading to hasSessionCookies alone â€” stale/orphan token cookies would hide the Login
    // button behind a non-clickable skeleton (UserDropdown treats loading as avatar placeholder).
    useLayoutEffect(() => {
        if (initialUser) {
            setLoading(false);
        } else if (cachedAccount) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [initialUser, cachedAccount]);

    // Refresh from API once; skip spinner when we already show the user (initialUser) or when we only
    // have token cookies (keep Login/Create Account visible until /me resolves).
    useEffect(() => {
        if (initialUser) {
            void loadProfile(false, { skipLoadingSpinner: true });
            return;
        }
        if (cachedAccount) {
            void loadProfile();
            return;
        }
        if (hasSessionCookies) {
            void loadProfile(false, { skipLoadingSpinner: true });
            return;
        }
        setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const register = async (email: string, password: string, values: RegisterForm) => {
        try {
            const { confirm, agreement, ...cleanValues } = values;

            const payload = {
                ...cleanValues,
                email,
                password,
            };

            await AuthService.register(payload as any);

            showNotification('success', `Welcome to ${themeBranding?.brand_name || 'Ayahay'}! Registration successful!`);

            // Await profile load so currentUser is set before caller redirects
            await loadProfile();

            return 'success';
        } catch (error: any) {
            console.error('Registration error:', error);
            const msg = error.response?.data?.message || 'Registration failed';
            throw new Error(msg);
        }
    };

    const signIn = async (email: string, password: string): Promise<any> => {
        try {
            await AuthService.login({ email, password });
            showNotification('success', `Welcome back to ${themeBranding?.brand_name || 'Ayahay'}!`);
            // Await profile load so currentUser is set before caller redirects
            await loadProfile();
            return 'success';
        } catch (error: any) {
            console.error('Login error:', error);
            const msg = error.response?.data?.message || 'Login failed';
            showNotification('error', msg);
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        try {
            await AuthService.signInWithGoogle();
            showNotification('success', `Welcome to ${themeBranding?.brand_name || 'Ayahay'}!`);
            // Load profile in background â€” caller will redirect immediately
            loadProfile(true);
            return 'success';
        } catch (error: any) {
            console.error('Google sign-in error:', error);
            const msg = error.message || 'Google sign-in failed';
            showNotification('error', msg);
            throw error;
        }
    };

    const signInWithFacebook = async () => {
        try {
            await AuthService.signInWithFacebook();
            showNotification('success', `Welcome to ${themeBranding?.brand_name || 'Ayahay'}!`);
            // Load profile in background â€” caller will redirect immediately
            loadProfile(true);
            return 'success';
        } catch (error: any) {
            console.error('Facebook sign-in error:', error);
            const msg = error.message || 'Facebook sign-in failed';
            showNotification('error', msg);
            throw error;
        }
    };

    const signInWithHayahai = async () => {
        try {
            await AuthService.signInWithHayahai();
            showNotification('success', `Welcome back to ${themeBranding?.brand_name || 'Ayahay'}!`);
            // Load profile in background â€” caller will redirect immediately
            loadProfile(true);
            return 'success';
        } catch (error: any) {
            console.error('Hayahai sign-in error:', error);
            const msg = error.message || 'Hayahai sign-in failed';
            showNotification('error', msg);
            throw error;
        }
    };

    const forgotPassword = async (email: string): Promise<boolean> => {
        try {
            setLoading(true);
            await AuthService.forgotPassword(email);
            showNotification('success', 'Password reset email sent (if account exists)');
            return true;
        } catch (error: any) {
            const retryAfter = error.response?.data?.retryAfter;
            if (retryAfter) {
                sessionStorage.setItem('resend_otp', retryAfter.toString());
            }
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

    const sendEmailVerification = async (_user: any) => {
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
            clearSession();
            router.push('/');
        } catch (error) {
            console.error('Logout error', error);
            // Clear local state anyway on failure
            clearSession();
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    // branding and theme are stored in refs so they can be accessed by consumers
    // without causing re-renders of all auth consumers when theme/branding changes.
    const brandingRef = useRef(themeBranding);
    brandingRef.current = themeBranding;
    const themeRef = useRef(themeSettings);
    themeRef.current = themeSettings;

    const value: AuthContextType = useMemo(() => ({
        currentUser,
        hasPrivilegedAccess: currentUser?.role === 'SuperAdmin' || currentUser?.role === 'ShippingLineAdmin' || currentUser?.role === 'TravelAgencyAdmin' || currentUser?.role === 'ClientAdmin',
        loading,
        register,
        signIn,
        logout,
        signInWithGoogle,
        signInWithFacebook,
        signInWithHayahai,
        forgotPassword,
        verifyResetCode,
        confirmResetPassword,
        sendEmailVerification,
        notification,
        get branding() { return brandingRef.current; },
        get theme() { return themeRef.current; },
        refreshProfile: loadProfile,
        clearSession
    }), [currentUser, loading, notification, loadProfile, clearSession]);

    return (
        <AuthContext.Provider value={value}>
            {children}
            {notification && (
                <div
                    className="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-opacity duration-300 text-white"
                    style={{
                        backgroundColor: notification.type === 'success' ? (themeSettings?.primary || '#22c55e') : '#ef4444'
                    }}
                >
                    {notification?.message}
                </div>
            )}
        </AuthContext.Provider>
    );
}

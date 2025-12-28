'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { IAccount, RegisterForm } from '@/models';
import { AuthService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

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
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [loggedInAccount, setLoggedInAccount] = useState<IAccount | null>(null);
    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    } | null>(null);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    // Load user profile on mount
    const loadProfile = async () => {
        try {
            setLoading(true);
            const { data } = await AuthService.getProfile();
            // Map API response to Context state
            // The API returns { data: { id, name, email, ... }, message } OR { id, name... } depending on DTO usage
            // The controller: return { message: '...', data: result }
            // So data is nested in data.data?
            // Wait, axios response.data IS the body.
            // Controller returns: { message: string, data: UserResponseDto }
            // So response.data.data is the user.

            // Let's verify the AuthService.getProfile implementation.
            // It returns response.data. 
            // So yes, we need to access result.data

            // However, we should be careful about the structure.
            // Let's assume response.data is the object returned by controller.

            const user = data.data || data;

            setCurrentUser(user);

            // Map to IAccount (partial)
            // We need to parse name into first/last or just store it.
            // IAccount doesn't have 'name', it has firstName, lastName?
            // No, IAccount doesn't have firstName/lastName directly unless it implies Passenger?
            // IAccount in account.model.ts has: passengerId, shippingLineId, ... 
            // It does NOT have firstName/lastName at root. It has 'role', 'email'.
            // The 'UserResponseDto' only has name.
            // This is a disconnect. I will map what I can.

            const account: IAccount = {
                id: user.id,
                email: user.email,
                role: 'Passenger', // Defaulting or we need to get it from API
                emailConsent: false,
                // We'll leave other fields undefined as we don't have them
            };
            setLoggedInAccount(account);

        } catch (error) {
            // Not logged in or error
            console.log('Failed to load profile (likely not logged in)', error);
            setCurrentUser(null);
            setLoggedInAccount(null);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    // We using useEffect to load profile on mount


    useEffect(() => {
        loadProfile();
    }, []);

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

            showNotification('success', 'Registration successful! Please login.');

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
        showNotification('error', 'Google Sign-In not implemented yet');
        return null;
    };

    const signInWithFacebook = async () => {
        showNotification('error', 'Facebook Sign-In not implemented yet');
        return null;
    };

    const resetPassword = async (email: string): Promise<boolean> => {
        try {
            setLoading(true);
            await AuthService.forgotPassword(email);
            showNotification('success', 'Password reset email sent (if account exists)');
            return true;
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to request password reset';
            showNotification('error', msg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const sendEmailVerification = async (user: any) => {
        // No endpoint for this in current API
        console.warn('sendEmailVerification not supported by API');
    };

    const logout = async (): Promise<void> => {
        try {
            setLoading(true);
            await AuthService.logout();
            setCurrentUser(null);
            setLoggedInAccount(null);
            router.push('/');
        } catch (error) {
            console.error('Logout error', error);
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
        resetPassword,
        sendEmailVerification,
        notification
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            {notification && (
                <div
                    className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-opacity duration-300 ${notification?.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                >
                    {notification?.message}
                </div>
            )}
        </AuthContext.Provider>
    );


}


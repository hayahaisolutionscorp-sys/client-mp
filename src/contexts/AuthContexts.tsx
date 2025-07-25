'use client';
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { firebase } from 'utils/firebaseConfig';
import { useIdToken } from 'react-firebase-hooks/auth';
import { cacheItem, invalidateItem } from 'helpers/cache.helpers';
import { accountRelatedCacheKeys } from 'constants/cache';
import { IAccount, RegisterForm } from '@/models';
import { mapPassengerToDto, getAccountInformation, createPassengerAccount } from '@/services';

interface AuthContextType {
  currentUser: User | null | undefined;
  loggedInAccount: IAccount | undefined | null;
  hasPrivilegedAccess: boolean;
  loading: boolean;
  register: (email: string, password: string, values: RegisterForm) => Promise<string>;
  signIn: (email: string, password: string) => Promise<string>;
  signInWithGoogle: () => Promise<{ user: User } | null>;
  signInWithFacebook: () => Promise<{ user: User } | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  sendEmailVerification: (user: User) => Promise<void>;
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

const PRIVILEGED_ROLES = [
  'ShippingLineStaff',
  'ShippingLineAdmin',
  'TravelAgencyStaff',
  'TravelAgencyAdmin',
  'SuperAdmin'
] as const;

type AccountRole = (typeof PRIVILEGED_ROLES)[number];

interface AuthError extends Error {
  code?: string;
}

export default function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, loading] = useIdToken(firebase);
  const [loggedInAccount, setLoggedInAccount] = useState<IAccount | undefined | null>(null);
  const [hasPrivilegedAccess, setHasPrivilegedAccess] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  } | null>(null);

  const fetchAccountInformation = useCallback(async () => {
    try {
      if (currentUser) {
        const jwt = await currentUser.getIdToken(true);
        cacheItem('jwt', jwt);
        const myAccountInformation = await getAccountInformation();
        setLoggedInAccount(myAccountInformation);

        const _hasPrivilegedAccess = PRIVILEGED_ROLES.includes(myAccountInformation?.role as AccountRole);
        setHasPrivilegedAccess(_hasPrivilegedAccess);
      } else {
        invalidateItem('jwt');
        setLoggedInAccount(undefined);
        setHasPrivilegedAccess(false);
      }
    } catch (error: unknown) {
      const err = error as AuthError;
      console.error('Error fetching account information:', err.message);
      setLoggedInAccount(undefined);
      setHasPrivilegedAccess(false);
    }
  }, [currentUser]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const register = async (email: string, password: string, values: RegisterForm) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(firebase, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      const mappedPassenger = mapPassengerToDto(values);
      await createPassengerAccount(token, mappedPassenger);
      await sendEmailVerification(user);

      showNotification('success', 'Registration successful! Please check your email for verification.');
      return token;
    } catch (error: unknown) {
      const err = error as AuthError;
      const errorMessage =
        err.code === 'auth/email-already-in-use'
          ? 'Email is already registered'
          : 'Registration failed. Please try again.';
      showNotification('error', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signIn = async (email: string, password: string): Promise<string> => {
    try {
      const userCredential = await signInWithEmailAndPassword(firebase, email, password);
      showNotification('success', 'Login successful!');
      return userCredential.user.uid;
    } catch (error: unknown) {
      const err = error as AuthError;
      const errorMessage =
        err.code === 'auth/wrong-password' ? 'Invalid email or password' : 'Login failed. Please try again.';
      showNotification('error', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(firebase, provider);
  };

  const signInWithFacebook = () => {
    const provider = new FacebookAuthProvider();
    return signInWithRedirect(firebase, provider);
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(firebase, email, {
        url: (process.env.NEXT_PUBLIC_WEB_URL || 'https://www.ayahay.com') + '/login'
      });
      showNotification('success', 'Password reset email sent successfully!');
      return true;
    } catch (error: unknown) {
      const err = error as AuthError;
      const errorMessage =
        err.code === 'auth/user-not-found'
          ? 'No account found with this email'
          : 'Failed to reset password. Please try again.';
      showNotification('error', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(firebase);
      accountRelatedCacheKeys.forEach(invalidateItem);
      showNotification('success', 'Logged out successfully');
    } catch (error: unknown) {
      const err = error as AuthError;
      const errorMessage = err.message || 'Failed to sign out. Please try again.';
      showNotification('error', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value: AuthContextType = {
    currentUser,
    loggedInAccount,
    hasPrivilegedAccess,
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

  useEffect(() => {
    if (!loading) {
      void fetchAccountInformation();
    }
  }, [currentUser, loading, fetchAccountInformation]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-opacity duration-300 ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}
    </AuthContext.Provider>
  );
}

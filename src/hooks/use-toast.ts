'use client';

import { create } from 'zustand';
import { ToastProps, ToastType } from '@/components/ui/Toast';
import { v4 as uuidv4 } from 'uuid';

interface ToastOptions {
    title?: string;
    duration?: number;
    type?: ToastType;
}

interface ToastStore {
    toasts: ToastProps[];
    addToast: (message: string, options?: ToastOptions) => void;
    removeToast: (id: string) => void;
}

const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (message, options) => {
        const id = uuidv4();
        const newToast: ToastProps = {
            id,
            message,
            type: options?.type || 'info',
            title: options?.title,
            duration: options?.duration,
            onClose: (id) => set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            })),
        };

        set((state) => ({
            toasts: [...state.toasts, newToast],
        }));
    },
    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
}));

export const useToast = () => {
    const { addToast, removeToast, toasts } = useToastStore();

    return {
        toasts,
        toast: (message: string, options?: ToastOptions) => addToast(message, options),
        success: (message: string, options?: Omit<ToastOptions, 'type'>) =>
            addToast(message, { ...options, type: 'success' }),
        error: (message: string, options?: Omit<ToastOptions, 'type'>) =>
            addToast(message, { ...options, type: 'error' }),
        warn: (message: string, options?: Omit<ToastOptions, 'type'>) =>
            addToast(message, { ...options, type: 'warning' }),
        info: (message: string, options?: Omit<ToastOptions, 'type'>) =>
            addToast(message, { ...options, type: 'info' }),
        remove: removeToast,
    };
};

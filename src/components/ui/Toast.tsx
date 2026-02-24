'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps {
    id: string;
    type?: ToastType;
    title?: string;
    message: string;
    duration?: number;
    onClose: (id: string) => void;
}

const icons = {
    info: <Info className="w-5 h-5 text-blue-500" />,
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
};

const bgColors = {
    info: 'bg-blue-50 border-blue-100',
    success: 'bg-green-50 border-green-100',
    warning: 'bg-yellow-50 border-yellow-100',
    error: 'bg-red-50 border-red-100',
};

export const Toast: React.FC<ToastProps> = ({
    id,
    type = 'info',
    title,
    message,
    duration = 5000,
    onClose,
}) => {
    useEffect(() => {
        if (duration === Infinity) return;
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            whileHover={{ scale: 1.02 }}
            className={`flex items-start gap-4 p-4 mb-3 border rounded-xl shadow-lg min-w-[300px] max-w-md ${bgColors[type]}`}
        >
            <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
            <div className="flex-1">
                {title && <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>}
                <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
            </div>
            <button
                onClick={() => onClose(id)}
                className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors"
                aria-label="Close"
            >
                <X className="w-4 h-4 text-gray-400" />
            </button>
        </motion.div>
    );
};

export const Toaster: React.FC<{ toasts: ToastProps[] }> = ({ toasts }) => {
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast {...toast} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};

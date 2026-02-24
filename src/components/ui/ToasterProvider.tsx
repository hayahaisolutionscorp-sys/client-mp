'use client';

import { Toaster } from './Toast';
import { useToast } from '@/hooks/use-toast';

export const ToasterProvider = () => {
    const { toasts } = useToast();
    return <Toaster toasts={toasts} />;
};

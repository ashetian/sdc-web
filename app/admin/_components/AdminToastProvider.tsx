'use client';

import { ToastProvider } from '@/app/_context/ToastContext';

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
    return <ToastProvider>{children}</ToastProvider>;
}

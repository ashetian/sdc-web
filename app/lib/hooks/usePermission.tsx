'use client';

import useSWR from 'swr';
import { fetcher } from '../swr/fetcher';
import type { AuthResponse, AdminAccess } from '../types/api';

/**
 * Admin yetkilendirme durumunu kontrol eden hook
 */
export function useAdminAuth() {
    const { data, error, isLoading, mutate } = useSWR<AuthResponse>(
        '/api/admin/check-auth',
        fetcher,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
        }
    );

    return {
        user: data?.user,
        isAdmin: data?.isAdmin ?? false,
        allowedKeys: data?.allowedKeys ?? [],
        isLoading,
        error,
        refresh: mutate,
    };
}

/**
 * Belirli bir yetki için kontrol yapan hook
 * @param requiredKey - Kontrol edilecek yetki key'i (örn: 'events', 'announcements')
 */
export function usePermission(requiredKey: string) {
    const { allowedKeys, isLoading, error } = useAdminAuth();

    const hasPermission =
        allowedKeys.includes('ALL') ||
        allowedKeys.includes(requiredKey);

    return {
        allowed: hasPermission,
        isLoading,
        error,
    };
}

/**
 * Çoklu yetki kontrolü
 * @param requiredKeys - Kontrol edilecek yetki key'leri
 * @param mode - 'any' (herhangi biri yeterli) veya 'all' (hepsi gerekli)
 */
export function usePermissions(
    requiredKeys: string[],
    mode: 'any' | 'all' = 'any'
) {
    const { allowedKeys, isLoading, error } = useAdminAuth();

    const hasAll = allowedKeys.includes('ALL');

    const hasPermission = hasAll || (
        mode === 'any'
            ? requiredKeys.some(key => allowedKeys.includes(key))
            : requiredKeys.every(key => allowedKeys.includes(key))
    );

    return {
        allowed: hasPermission,
        isLoading,
        error,
        // Hangi yetkilere sahip olduğunu göster
        permissions: requiredKeys.reduce((acc, key) => {
            acc[key] = hasAll || allowedKeys.includes(key);
            return acc;
        }, {} as Record<string, boolean>),
    };
}

/**
 * Admin paneli erişim kontrolü için wrapper component
 */
export function PermissionGate({
    children,
    requiredKey,
    fallback = null,
}: {
    children: React.ReactNode;
    requiredKey: string;
    fallback?: React.ReactNode;
}) {
    const { allowed, isLoading } = usePermission(requiredKey);

    if (isLoading) {
        return null; // veya loading spinner
    }

    if (!allowed) {
        return fallback;
    }

    return <>{ children } </>;
}

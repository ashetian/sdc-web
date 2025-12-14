'use client';

/**
 * SWR Hooks - Yaygın kullanılan API çağrıları için hazır hook'lar
 */

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { fetcher, mutator, ApiError } from './fetcher';
import type {
    Event,
    Announcement,
    Project,
    Notification,
    GalleryItem,
    User,
    AuthResponse,
    PaginatedResponse
} from '../types/api';

// ========== Events ==========

export function useEvents(options?: { type?: string; limit?: number }) {
    const params = new URLSearchParams();
    if (options?.type) params.set('type', options.type);
    if (options?.limit) params.set('limit', String(options.limit));

    const queryString = params.toString();
    const url = `/api/events${queryString ? `?${queryString}` : ''}`;

    return useSWR<Event[]>(url, fetcher);
}

export function useEvent(id: string) {
    return useSWR<Event>(id ? `/api/events/${id}` : null, fetcher);
}

// ========== Announcements ==========

export function useAnnouncements(options?: { type?: string; limit?: number; fallbackData?: Announcement[] }) {
    const params = new URLSearchParams();
    if (options?.type) params.set('type', options.type);
    if (options?.limit) params.set('limit', String(options.limit));

    const queryString = params.toString();
    const url = `/api/announcements${queryString ? `?${queryString}` : ''}`;

    return useSWR<Announcement[]>(url, fetcher, {
        fallbackData: options?.fallbackData
    });
}

export function useAnnouncement(slug: string) {
    return useSWR<Announcement>(slug ? `/api/announcements/${slug}` : null, fetcher);
}

// ========== Projects ==========

export function useProjects(options?: { status?: string; limit?: number }) {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.limit) params.set('limit', String(options.limit));

    const queryString = params.toString();
    const url = `/api/projects${queryString ? `?${queryString}` : ''}`;

    return useSWR<Project[]>(url, fetcher);
}

export function useProject(id: string) {
    return useSWR<Project>(id ? `/api/projects/${id}` : null, fetcher);
}

// ========== Notifications ==========

interface NotificationCountResponse {
    member: number;
    total: number;
}

export function useNotificationCount() {
    return useSWR<NotificationCountResponse>('/api/notifications/count', fetcher, {
        refreshInterval: 30000, // Her 30 saniyede bir yenile
    });
}

export function useNotifications(limit: number = 10) {
    return useSWR<{ notifications: Notification[] }>(
        `/api/notifications?limit=${limit}`,
        fetcher
    );
}

export function useUnreadNotificationCount() {
    const { data } = useNotifications();
    return data?.notifications?.filter((n: Notification) => !n.isRead).length ?? 0;
}

// ========== Team & Departments ==========
// Types imported from api.ts
import type { TeamMember, Department } from '../types/api';

export function useDepartments(options?: { fallbackData?: Department[] }) {
    return useSWR<Department[]>('/api/departments', fetcher, {
        fallbackData: options?.fallbackData
    });
}

export function useTeam(options?: { showInTeam?: boolean; fallbackData?: TeamMember[] }) {
    const showInTeam = options?.showInTeam !== false; // default true
    return useSWR<TeamMember[]>(
        `/api/team${showInTeam ? '?showInTeam=true' : ''}`,
        fetcher,
        { fallbackData: options?.fallbackData }
    );
}

// ========== Gallery ==========

export function useGallery(options?: { limit?: number }) {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));

    const queryString = params.toString();
    const url = `/api/gallery${queryString ? `?${queryString}` : ''}`;

    return useSWR<GalleryItem[]>(url, fetcher);
}

export function useGalleryItem(slug: string) {
    return useSWR<GalleryItem>(slug ? `/api/gallery/${slug}` : null, fetcher);
}

// ========== Forum ==========

import type { ForumCategory, ForumTopic } from '../types/api';

export function useForumCategories() {
    return useSWR<ForumCategory[]>('/api/forum/categories', fetcher);
}

export function useForumTopics(options?: { category?: string; limit?: number }) {
    const params = new URLSearchParams();
    if (options?.category) params.set('category', options.category);
    if (options?.limit) params.set('limit', String(options.limit));

    const queryString = params.toString();
    const url = `/api/forum/topics${queryString ? `?${queryString}` : ''}`;

    return useSWR<{ topics: ForumTopic[]; total: number }>(url, fetcher);
}

// ========== Auth ==========

export function useAuth() {
    return useSWR<AuthResponse>('/api/auth/me', fetcher, {
        revalidateOnFocus: false,
        shouldRetryOnError: false,
    });
}

export function useUser() {
    const { data, error, isLoading } = useAuth();
    return {
        user: data?.user,
        isLoggedIn: !!data?.user,
        isLoading,
        error,
    };
}

// ========== Bookmarks ==========

export function useBookmarks() {
    return useSWR<{ bookmarks: string[] }>('/api/bookmarks', fetcher);
}

// ========== Sponsors ==========

interface Sponsor {
    _id: string;
    name: string;
    nameEn?: string;
    description: string;
    descriptionEn?: string;
    logo: string;
}

export function useSponsors(options?: { fallbackData?: Sponsor[] }) {
    return useSWR<Sponsor[]>('/api/sponsors?active=true', fetcher, {
        fallbackData: options?.fallbackData
    });
}

// ========== Stats (Home Page) ==========

interface StatData {
    _id: string;
    label: string;
    labelEn?: string;
    value: string;
    color: string;
    order: number;
}

export function useStats() {
    return useSWR<StatData[]>('/api/stats', fetcher);
}

// ========== Stats (Public) ==========

interface PublicStats {
    memberCount: number;
    eventCount: number;
    projectCount: number;
}

export function usePublicStats() {
    return useSWR<PublicStats>('/api/stats/public', fetcher, {
        revalidateOnFocus: false,
    });
}

// ========== Mutation Helpers ==========

/**
 * POST mutation helper
 */
export function usePostMutation<T>(url: string) {
    return useSWRMutation(
        url,
        async (key: string, { arg }: { arg: unknown }) => {
            return mutator<T>(key, { method: 'POST', body: arg });
        }
    );
}

/**
 * DELETE mutation helper
 */
export function useDeleteMutation<T = void>(url: string) {
    return useSWRMutation(
        url,
        async (key: string) => {
            return mutator<T>(key, { method: 'DELETE' });
        }
    );
}

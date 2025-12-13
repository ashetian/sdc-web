/**
 * SWR Library - Barrel Export
 */

// Fetcher utilities
export { fetcher, mutator, ApiError } from './fetcher';

// Hooks
export {
    // Events
    useEvents,
    useEvent,
    // Announcements
    useAnnouncements,
    useAnnouncement,
    // Projects
    useProjects,
    useProject,
    // Notifications
    useNotificationCount,
    useNotifications,
    useUnreadNotificationCount,
    // Gallery
    useGallery,
    useGalleryItem,
    // Forum
    useForumCategories,
    useForumTopics,
    // Team & Departments
    useDepartments,
    useTeam,
    // Auth
    useAuth,
    useUser,
    // Bookmarks
    useBookmarks,
    // Stats
    useStats,
    usePublicStats,
    // Sponsors
    useSponsors,
    // Mutation helpers
    usePostMutation,
    useDeleteMutation,
} from './hooks';

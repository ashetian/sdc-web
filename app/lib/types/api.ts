/**
 * API Response Types
 * Tüm API endpoint'lerinden dönen verilerin tipleri
 */

import { Types } from 'mongoose';

// ========== Common Types ==========

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

// ========== User & Auth ==========

export interface User {
    _id?: string;
    id?: string;
    studentNo: string;
    nickname: string;
    fullName?: string;
    email: string;
    phone?: string;
    department?: string;
    avatar?: string;
    languagePreference?: 'tr' | 'en';
    nativeLanguage?: 'tr' | 'en';
    allowEmails?: boolean;
    lastLogin?: Date | string;
    bio?: string;
    profileVisibility?: {
        showEmail?: boolean;
        showPhone?: boolean;
        showDepartment?: boolean;
        showFullName?: boolean;
    };
    socialLinks?: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        website?: string;
        instagram?: string;
    };
}

export interface AuthResponse {
    user: User;
    isAdmin: boolean;
    allowedKeys?: string[];
}

// ========== Events ==========

export interface Event {
    _id: string;
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    date?: string;
    eventDate?: string; // Alias used in events/page.tsx
    eventEndDate?: string;
    endDate?: string;
    location?: string;
    locationEn?: string;
    image?: string;
    posterUrl?: string; // Alias for image
    type?: 'workshop' | 'seminar' | 'social' | 'competition' | 'other';
    isFree?: boolean;
    isPaid?: boolean;
    price?: number;
    iban?: string;
    fee?: number;
    capacity?: number;
    registrationCount?: number;
    isActive?: boolean;
    isOpen?: boolean;
    isEnded?: boolean;
    checkinCode?: string;
    slug?: string;
    announcementSlug?: string;
    createdAt?: string;
}

export interface EventRegistration {
    _id: string;
    eventId: string;
    memberId: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    createdAt: string;
}

// ========== Announcements ==========

export interface Announcement {
    _id: string;
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    content: string;
    contentEn?: string;
    type: 'news' | 'event' | 'article' | 'opportunity' | 'workshop';
    image?: string;
    imageOrientation?: 'horizontal' | 'vertical';
    date: string;
    dateEn?: string;
    dateObj?: string | Date; // Added for sorting
    slug: string;
    isDraft: boolean;
    isArchived?: boolean;
    viewCount?: number;
    eventId?: string;
    // Gallery fields
    galleryLinks?: string[];
    galleryCover?: string;
    isInGallery?: boolean;
    galleryDescription?: string;
    galleryDescriptionEn?: string;
    // Content blocks for rich content
    contentBlocks?: ContentBlock[];
    contentBlocksEn?: ContentBlock[];
}

// ========== Projects ==========

export interface Project {
    _id: string;
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    image?: string;
    technologies?: string[];
    githubUrl?: string;
    demoUrl?: string;
    developer?: {
        _id: string;
        nickname: string;
    };
    author?: {
        nickname: string;
        fullName?: string;
        department?: string;
    };
    status?: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    viewCount?: number;
    createdAt?: string;
}

// ========== Members & Team ==========

export interface TeamMember {
    _id: string;
    fullName?: string;
    name: string; // Required for Team component
    email?: string;
    title: string;
    titleEn?: string;
    department?: {
        _id: string;
        name: string;
        nameEn?: string;
    };
    departmentId?: string | Department;
    image?: string;
    photo?: string; // Alias for image
    role: 'member' | 'head' | 'president' | 'vice_president' | 'advisor';
    description?: string;
    location?: string;
    order?: number;
    // Direct social links (About.tsx uses these directly)
    github?: string;
    linkedin?: string;
    instagram?: string;
    // Nested social links (other components may use this structure)
    social?: {
        github?: string;
        linkedin?: string;
        twitter?: string;
    };
}

export interface Department {
    _id: string;
    name: string;
    nameEn?: string;
    description?: string;
    descriptionEn?: string;
    color: string;
    icon: string;
    leadId?: string;
    order?: number;
}

// ========== Forum ==========

export interface ForumCategory {
    _id: string;
    name: string;
    nameEn?: string;
    description?: string;
    descriptionEn?: string;
    slug: string;
    icon?: string;
    color?: string;
    topicCount?: number;
    lastTopicAt?: string;
}

export interface ForumTopic {
    _id: string;
    title: string;
    titleEn?: string;
    content: string;
    category?: ForumCategory;
    categoryId?: {
        _id: string;
        name: string;
        nameEn?: string;
        slug: string;
        icon?: string;
        color?: string;
    };
    author?: {
        _id: string;
        nickname: string;
        avatar?: string;
    };
    authorId?: {
        _id: string;
        fullName?: string;
        nickname?: string;
        avatar?: string;
    };
    tags?: string[];
    isPinned?: boolean;
    isLocked?: boolean;
    upvotes?: number;
    downvotes?: number;
    replyCount?: number;
    viewCount?: number;
    createdAt: string;
    lastReplyAt?: string;
}

// ========== Notifications ==========

export interface Notification {
    _id: string;
    userId: string;
    type: 'comment_like' | 'comment_reply' | 'event_reminder' | 'announcement' | 'system';
    title: string;
    titleEn?: string;
    message: string;
    messageEn?: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
    actorId?: {
        nickname: string;
        avatar?: string;
    };
}

// ========== Comments ==========

export interface Comment {
    _id: string;
    targetType?: 'announcement' | 'event' | 'project' | 'gallery';
    targetId?: string;
    content: string;
    author: {
        _id: string;
        nickname: string;
        avatar?: string;
        fullName?: string;
        department?: string;
    };
    likes?: string[];
    likeCount?: number;
    isEdited?: boolean;
    isDeleted?: boolean;
    parentId?: string | null;
    replies?: Comment[];
    createdAt: string;
}

// ========== Admin ==========

export interface AdminAccess {
    _id: string;
    memberId: {
        _id: string;
        fullName: string;
        email: string;
        studentNo: string;
    };
    allowedKeys: string[];
    grantedBy?: string;
    createdAt: string;
}

// ========== Gallery ==========

export interface GalleryItem {
    _id: string;
    title: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    type: 'event' | 'news' | 'workshop';
    files: string[];
    date: string;
    slug: string;
}

// ========== Stats ==========

export interface StatData {
    _id: string;
    label: string;
    labelEn?: string;
    value: string;
    color: string;
    order: number;
}

export interface DashboardStats {
    totalMembers: number;
    totalEvents: number;
    totalProjects: number;
    totalAnnouncements: number;
    recentRegistrations: number;
    activeUsers: number;
}

// ========== Sponsors ==========

export interface Sponsor {
    _id: string;
    name: string;
    nameEn?: string;
    description: string;
    descriptionEn?: string;
    logo: string;
    url?: string;
    isActive?: boolean;
}

// ========== Elections ==========

export interface Candidate {
    _id: string;
    electionId: string;
    name: string;
    surname: string;
    photo?: string;
    bio?: string;
    voteCount?: number;
}

export interface Election {
    _id: string;
    title: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    candidates: Candidate[];
    voterCount: number;
}

// ========== Chat ==========

export interface ChatMessage {
    _id: string;
    content: string;
    senderId: string;
    senderNickname: string;
    senderAvatar?: string;
    createdAt: string;
    expiresAt?: string;
}

export interface UserPosition {
    odaId: string;
    odaSlug: string;
    odaData: {
        nickname: string;
        avatar?: string;
    };
    x: number;
    y: number;
    lastUpdate: number;
}

// ========== Articles ==========

export interface ContentBlock {
    id: string;
    type: 'paragraph' | 'heading' | 'image' | 'code' | 'quote' | 'list';
    content: string;
    level?: number;
    language?: string;
    alt?: string;
    items?: string[];
}

export interface Article {
    _id: string;
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    content: string;
    contentEn?: string;
    contentBlocks?: ContentBlock[];
    contentBlocksEn?: ContentBlock[];
    author: {
        _id: string;
        nickname: string;
        avatar?: string;
    };
    tags?: string[];
    image?: string;
    slug: string;
    isDraft: boolean;
    viewCount: number;
    createdAt: string;
}

// ========== Applicants ==========

export interface Applicant {
    _id: string;
    studentNo: string;
    name: string;
    surname: string;
    email: string;
    phone?: string;
    department?: string;
    departmentId?: string;
    status: 'pending' | 'approved' | 'rejected';
    cv?: string;
    note?: string;
    createdAt: string;
}

// ========== Bug Reports ==========

export interface BugReport {
    _id: string;
    reporterId?: string;
    reporterNickname?: string;
    type: 'bug' | 'suggestion' | 'other';
    title: string;
    description: string;
    url?: string;
    screenshot?: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority?: 'low' | 'medium' | 'high';
    createdAt: string;
}

// ========== Inventory ==========

export interface InventoryItem {
    _id: string;
    name: string;
    nameEn?: string;
    description?: string;
    quantity: number;
    category: string;
    location?: string;
    assignedTo?: {
        _id: string;
        fullName: string;
    };
    condition: 'new' | 'good' | 'fair' | 'poor';
    purchaseDate?: string;
    createdAt: string;
}

// ========== Audit Log ==========

export interface AuditLogEntry {
    _id: string;
    action: string;
    targetType: string;
    targetId: string;
    targetName?: string;
    performedBy: {
        _id: string;
        nickname: string;
    };
    details?: Record<string, unknown>;
    ipAddress?: string;
    createdAt: string;
}

// ========== Calendar ==========

export interface CalendarMarker {
    _id: string;
    title: string;
    titleEn?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    type: 'event' | 'holiday' | 'deadline' | 'other' | 'exam_week' | 'registration_period' | 'semester_break' | 'important';
    color?: string;
    description?: string;
    eventId?: string;
}

// ========== Access Rules ==========

export interface AccessRule {
    _id: string;
    memberId: string;
    memberInfo?: {
        fullName: string;
        email: string;
        studentNo: string;
    };
    allowedKeys: string[];
    grantedBy?: string;
    createdAt: string;
}

// ========== Member (simplified) ==========

export interface Member {
    _id: string;
    studentNo: string;
    fullName: string;
    email: string;
    phone?: string;
    isActive: boolean;
    departmentId?: string;
    createdAt: string;
}

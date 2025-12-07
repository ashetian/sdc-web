import connectDB from '@/app/lib/db';
import AuditLog from '@/app/lib/models/AuditLog';
import mongoose from 'mongoose';

interface LogActionParams {
    adminId: string | mongoose.Types.ObjectId;
    adminName: string;
    action: string;
    targetType: string;
    targetId?: string;
    targetName?: string;
    details?: string;
    ipAddress?: string;
}

/**
 * Log an admin action to the audit log
 * Call this from admin API endpoints after successful operations
 */
export async function logAdminAction(params: LogActionParams): Promise<void> {
    try {
        await connectDB();

        await AuditLog.create({
            adminId: new mongoose.Types.ObjectId(params.adminId.toString()),
            adminName: params.adminName,
            action: params.action,
            targetType: params.targetType,
            targetId: params.targetId,
            targetName: params.targetName,
            details: params.details,
            ipAddress: params.ipAddress,
        });
    } catch (error) {
        // Log error but don't throw - audit logging should not break main operations
        console.error('Failed to log admin action:', error);
    }
}

// Common action types for consistency
export const AUDIT_ACTIONS = {
    // Events
    CREATE_EVENT: 'CREATE_EVENT',
    UPDATE_EVENT: 'UPDATE_EVENT',
    DELETE_EVENT: 'DELETE_EVENT',
    END_EVENT: 'END_EVENT',

    // Announcements
    CREATE_ANNOUNCEMENT: 'CREATE_ANNOUNCEMENT',
    UPDATE_ANNOUNCEMENT: 'UPDATE_ANNOUNCEMENT',
    DELETE_ANNOUNCEMENT: 'DELETE_ANNOUNCEMENT',
    ARCHIVE_ANNOUNCEMENT: 'ARCHIVE_ANNOUNCEMENT',

    // Users
    DEACTIVATE_USER: 'DEACTIVATE_USER',
    ACTIVATE_USER: 'ACTIVATE_USER',
    UPDATE_USER_ROLE: 'UPDATE_USER_ROLE',
    CREATE_MEMBER: 'CREATE_MEMBER',
    DELETE_APPLICANT: 'DELETE_APPLICANT',

    // Settings
    UPDATE_SETTINGS: 'UPDATE_SETTINGS',
    IMPORT_MEMBERS: 'IMPORT_MEMBERS',

    // Departments
    CREATE_DEPARTMENT: 'CREATE_DEPARTMENT',
    UPDATE_DEPARTMENT: 'UPDATE_DEPARTMENT',
    DELETE_DEPARTMENT: 'DELETE_DEPARTMENT',

    // Elections
    CREATE_ELECTION: 'CREATE_ELECTION',
    UPDATE_ELECTION: 'UPDATE_ELECTION',
    DELETE_ELECTION: 'DELETE_ELECTION',

    // Projects
    CREATE_PROJECT: 'CREATE_PROJECT',
    UPDATE_PROJECT: 'UPDATE_PROJECT',
    DELETE_PROJECT: 'DELETE_PROJECT',
    APPROVE_PROJECT: 'APPROVE_PROJECT',
    REJECT_PROJECT: 'REJECT_PROJECT',

    // Stats
    CREATE_STAT: 'CREATE_STAT',
    UPDATE_STAT: 'UPDATE_STAT',
    DELETE_STAT: 'DELETE_STAT',

    // Team
    CREATE_TEAM_MEMBER: 'CREATE_TEAM_MEMBER',
    UPDATE_TEAM_MEMBER: 'UPDATE_TEAM_MEMBER',
    DELETE_TEAM_MEMBER: 'DELETE_TEAM_MEMBER',

    // Comments
    DELETE_COMMENT: 'DELETE_COMMENT',
    RESTORE_COMMENT: 'RESTORE_COMMENT',

    // Emails
    SEND_BULK_EMAIL: 'SEND_BULK_EMAIL',

    // Sponsors
    CREATE_SPONSOR: 'CREATE_SPONSOR',
    UPDATE_SPONSOR: 'UPDATE_SPONSOR',
    DELETE_SPONSOR: 'DELETE_SPONSOR',

    // Forum
    APPROVE_TOPIC: 'APPROVE_TOPIC',
    DELETE_TOPIC: 'DELETE_TOPIC',
    CREATE_FORUM_CATEGORY: 'CREATE_FORUM_CATEGORY',
    UPDATE_FORUM_CATEGORY: 'UPDATE_FORUM_CATEGORY',
    DELETE_FORUM_CATEGORY: 'DELETE_FORUM_CATEGORY',

    // Tech Stacks
    CREATE_TECH_STACK: 'CREATE_TECH_STACK',
    UPDATE_TECH_STACK: 'UPDATE_TECH_STACK',
    DELETE_TECH_STACK: 'DELETE_TECH_STACK',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

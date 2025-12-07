import Notification, { NotificationType } from '@/app/lib/models/Notification';
import mongoose from 'mongoose';

interface CreateNotificationParams {
    recipientId: string | mongoose.Types.ObjectId;
    type: NotificationType;
    title: string;
    titleEn?: string;
    message: string;
    messageEn?: string;
    link?: string;
    isAdminNotification?: boolean;
    relatedContentType?: string;
    relatedContentId?: string | mongoose.Types.ObjectId;
    actorId?: string | mongoose.Types.ObjectId;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
    try {
        const notification = new Notification({
            recipientId: params.recipientId,
            type: params.type,
            title: params.title,
            titleEn: params.titleEn || params.title,
            message: params.message,
            messageEn: params.messageEn || params.message,
            link: params.link,
            isAdminNotification: params.isAdminNotification || false,
            relatedContentType: params.relatedContentType,
            relatedContentId: params.relatedContentId,
            actorId: params.actorId,
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}

/**
 * Create notifications for all admins
 */
export async function createAdminNotification(params: Omit<CreateNotificationParams, 'recipientId' | 'isAdminNotification'>) {
    const AdminAccess = (await import('@/app/lib/models/AdminAccess')).default;
    const TeamMember = (await import('@/app/lib/models/TeamMember')).default;

    // Get all admin IDs from AdminAccess
    const accessAdmins = await AdminAccess.find({}).select('memberId');
    const adminIds = new Set(accessAdmins.map(a => a.memberId.toString()));

    // Get President/VP IDs
    const teamAdmins = await TeamMember.find({
        role: { $in: ['president', 'vice_president'] },
        isActive: true
    }).select('memberId');

    teamAdmins.forEach(t => {
        if (t.memberId) {
            adminIds.add(t.memberId.toString());
        }
    });

    const notifications = await Promise.all(
        Array.from(adminIds).map(memberId =>
            createNotification({
                ...params,
                recipientId: memberId,
                isAdminNotification: true,
            })
        )
    );

    return notifications;
}

/**
 * Delete admin notifications when content is reviewed
 */
export async function clearAdminNotificationOnReview(
    contentType: string,
    contentId: string | mongoose.Types.ObjectId
) {
    try {
        await Notification.deleteMany({
            isAdminNotification: true,
            relatedContentType: contentType,
            relatedContentId: contentId,
        });
    } catch (error) {
        console.error('Error clearing admin notification:', error);
    }
}

/**
 * Create notifications for all registered members (for announcements)
 */
export async function createBroadcastNotification(params: Omit<CreateNotificationParams, 'recipientId'>) {
    const Member = (await import('@/app/lib/models/Member')).default;

    // Get all registered members
    const members = await Member.find({ isRegistered: true }).select('_id');

    // Batch insert for efficiency
    const notifications = members.map(member => ({
        recipientId: member._id,
        type: params.type,
        title: params.title,
        titleEn: params.titleEn || params.title,
        message: params.message,
        messageEn: params.messageEn || params.message,
        link: params.link,
        isAdminNotification: params.isAdminNotification || false,
        relatedContentType: params.relatedContentType,
        relatedContentId: params.relatedContentId,
        actorId: params.actorId,
        isRead: false,
    }));

    await Notification.insertMany(notifications);
}

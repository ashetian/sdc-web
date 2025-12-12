import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType =
    // Member notifications
    | 'new_announcement'
    | 'comment_reply'
    | 'comment_like'
    | 'project_comment'
    | 'project_like'
    | 'project_approved'
    | 'project_rejected'
    | 'forum_topic_approved'
    | 'content_deleted'
    | 'event_reminder'
    | 'welcome'
    | 'achievement'
    | 'mention'
    | 'security_alert'
    // Admin notifications
    | 'admin_new_comment'
    | 'admin_new_project'
    | 'admin_new_forum_topic'
    | 'admin_new_registration'
    | 'admin_new_applicant'
    | 'admin_bug_report'
    | 'admin_spam_alert'
    | 'admin_milestone';

export interface INotification extends Document {
    recipientId: mongoose.Types.ObjectId;
    type: NotificationType;
    title: string;
    titleEn?: string;
    message: string;
    messageEn?: string;
    link?: string;
    isRead: boolean;
    isAdminNotification: boolean;
    relatedContentType?: string;
    relatedContentId?: mongoose.Types.ObjectId;
    actorId?: mongoose.Types.ObjectId; // User who triggered the notification
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        recipientId: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
            required: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            enum: [
                'new_announcement',
                'comment_reply',
                'comment_like',
                'project_comment',
                'project_like',
                'project_approved',
                'project_rejected',
                'forum_topic_approved',
                'content_deleted',
                'event_reminder',
                'welcome',
                'achievement',
                'mention',
                'security_alert',
                'admin_new_comment',
                'admin_new_project',
                'admin_new_forum_topic',
                'admin_new_registration',
                'admin_new_applicant',
                'admin_bug_report',
                'admin_spam_alert',
                'admin_milestone',
            ],
            index: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 100,
        },
        titleEn: {
            type: String,
            maxlength: 100,
        },
        message: {
            type: String,
            required: true,
            maxlength: 500,
        },
        messageEn: {
            type: String,
            maxlength: 500,
        },
        link: {
            type: String,
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
        isAdminNotification: {
            type: Boolean,
            default: false,
            index: true,
        },
        relatedContentType: {
            type: String,
        },
        relatedContentId: {
            type: Schema.Types.ObjectId,
        },
        actorId: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for efficient queries
NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ isAdminNotification: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ relatedContentType: 1, relatedContentId: 1 });

// TTL index: auto-delete after 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification: Model<INotification> =
    mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;

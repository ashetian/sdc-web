import mongoose, { Schema, Document, Model } from 'mongoose';

export type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'other';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface IForumReport extends Document {
    reporterId: mongoose.Types.ObjectId;
    contentType: 'topic' | 'reply';
    contentId: mongoose.Types.ObjectId;
    reason: ReportReason;
    details?: string;
    status: ReportStatus;
    resolvedById?: mongoose.Types.ObjectId;
    resolvedAt?: Date;
    createdAt: Date;
}

const ForumReportSchema = new Schema<IForumReport>(
    {
        reporterId: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
            required: true,
            index: true,
        },
        contentType: {
            type: String,
            enum: ['topic', 'reply'],
            required: true,
        },
        contentId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        reason: {
            type: String,
            enum: ['spam', 'harassment', 'inappropriate', 'other'],
            required: true,
        },
        details: {
            type: String,
            maxlength: 1000,
        },
        status: {
            type: String,
            enum: ['pending', 'resolved', 'dismissed'],
            default: 'pending',
            index: true,
        },
        resolvedById: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
        },
        resolvedAt: {
            type: Date,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Index for finding pending reports
ForumReportSchema.index({ status: 1, createdAt: -1 });

// Prevent duplicate reports from same user on same content
ForumReportSchema.index(
    { reporterId: 1, contentType: 1, contentId: 1 },
    { unique: true }
);

const ForumReport: Model<IForumReport> =
    mongoose.models.ForumReport || mongoose.model<IForumReport>('ForumReport', ForumReportSchema);

export default ForumReport;

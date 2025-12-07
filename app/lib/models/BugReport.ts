import mongoose, { Schema, Document, Model } from 'mongoose';

export type BugReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface IBugReport extends Document {
    reporterId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    page: string;
    browser?: string;
    status: BugReportStatus;
    adminNote?: string;
    reviewedById?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const BugReportSchema = new Schema<IBugReport>(
    {
        reporterId: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 200,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            maxlength: 2000,
            trim: true,
        },
        page: {
            type: String,
            required: true,
            maxlength: 500,
        },
        browser: {
            type: String,
            maxlength: 500,
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
            default: 'pending',
            index: true,
        },
        adminNote: {
            type: String,
            maxlength: 1000,
        },
        reviewedById: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
        },
    },
    {
        timestamps: true,
    }
);

// Index for listing pending reports
BugReportSchema.index({ status: 1, createdAt: -1 });

const BugReport: Model<IBugReport> =
    mongoose.models.BugReport || mongoose.model<IBugReport>('BugReport', BugReportSchema);

export default BugReport;

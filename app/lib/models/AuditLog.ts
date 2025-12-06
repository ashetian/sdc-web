import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
    adminId: mongoose.Types.ObjectId;
    adminName: string;
    action: string;
    targetType: string;
    targetId?: string;
    targetName?: string;
    details?: string;
    ipAddress?: string;
    createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        adminId: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
            required: true,
            index: true,
        },
        adminName: {
            type: String,
            required: true,
        },
        action: {
            type: String,
            required: true,
            index: true,
        },
        targetType: {
            type: String,
            required: true,
        },
        targetId: {
            type: String,
        },
        targetName: {
            type: String,
        },
        details: {
            type: String,
        },
        ipAddress: {
            type: String,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Index for efficient querying by date
AuditLogSchema.index({ createdAt: -1 });

const AuditLog: Model<IAuditLog> =
    mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;

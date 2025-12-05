import mongoose, { Schema, Document, Model } from 'mongoose';

export type ElectionType = 'president' | 'department_head';
export type ElectionStatus = 'draft' | 'active' | 'completed' | 'suspended';

export interface IElection extends Document {
    title: string;
    description?: string;
    type: ElectionType;
    departmentId?: mongoose.Types.ObjectId;
    status: ElectionStatus;
    startDate?: Date;
    endDate?: Date;
    useRankedChoice: boolean;
    isSuspended: boolean;
    suspensionReason?: string;
    suspendedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ElectionSchema = new Schema<IElection>(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        type: {
            type: String,
            enum: ['president', 'department_head'],
            default: 'president',
        },
        departmentId: {
            type: Schema.Types.ObjectId,
            ref: 'Department',
        },
        status: {
            type: String,
            enum: ['draft', 'active', 'completed', 'suspended'],
            default: 'draft',
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        useRankedChoice: {
            type: Boolean,
            default: true,
        },
        isSuspended: {
            type: Boolean,
            default: false,
        },
        suspensionReason: {
            type: String,
        },
        suspendedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Election: Model<IElection> =
    mongoose.models.Election || mongoose.model<IElection>('Election', ElectionSchema);

export default Election;

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminAccess extends Document {
    memberId: mongoose.Types.ObjectId; // Link to the 'Member' (User Account)
    grantedBy: mongoose.Types.ObjectId; // Who gave this permission
    allowedKeys: string[]; // List of allowed menu keys
    createdAt: Date;
    updatedAt: Date;
}

const AdminAccessSchema = new Schema<IAdminAccess>(
    {
        memberId: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
            required: true,
            unique: true, // One rule set per user
        },
        grantedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
        },
        allowedKeys: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const AdminAccess: Model<IAdminAccess> =
    mongoose.models.AdminAccess || mongoose.model<IAdminAccess>('AdminAccess', AdminAccessSchema);

export default AdminAccess;


import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfileVisibility {
    showEmail: boolean;
    showPhone: boolean;
    showDepartment: boolean;
    showFullName: boolean;
}

export interface IMember extends Document {
    // Basic info (from Excel/CSV import)
    studentNo: string;
    fullName: string;
    email: string;
    phone?: string;
    department?: string;
    isActive: boolean;

    // Authentication fields
    passwordHash?: string;
    isRegistered: boolean;
    lastLogin?: Date;
    isTestAccount?: boolean;

    // Profile fields
    nickname?: string;
    avatar?: string;
    profileVisibility: IProfileVisibility;

    // Permissions
    emailConsent: boolean;
    kvkkAccepted: boolean;
    nativeLanguage?: 'tr' | 'en';

    createdAt: Date;
    updatedAt: Date;
}

const ProfileVisibilitySchema = new Schema<IProfileVisibility>(
    {
        showEmail: { type: Boolean, default: false },
        showPhone: { type: Boolean, default: false },
        showDepartment: { type: Boolean, default: true },
        showFullName: { type: Boolean, default: false },
    },
    { _id: false }
);

const MemberSchema = new Schema<IMember>(
    {
        // Basic info
        studentNo: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        fullName: {
            type: String,
            required: true,

        },
        email: {
            type: String,
            required: true,
            lowercase: true,
        },
        phone: {
            type: String,
        },
        department: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },

        // Authentication
        passwordHash: {
            type: String,
        },
        isRegistered: {
            type: Boolean,
            default: false,
        },
        lastLogin: {
            type: Date,
        },
        isTestAccount: {
            type: Boolean,
            default: false,
        },

        // Profile
        nickname: {
            type: String,
            trim: true,
        },
        avatar: {
            type: String,
            trim: true,
        },
        profileVisibility: {
            type: ProfileVisibilitySchema,
            default: () => ({
                showEmail: false,
                showPhone: false,
                showDepartment: true,
                showFullName: false,
            }),
        },

        // Permissions
        emailConsent: {
            type: Boolean,
            default: false,
        },
        kvkkAccepted: {
            type: Boolean,
            default: false,
        },
        nativeLanguage: {
            type: String,
            enum: ['tr', 'en'],
            default: 'tr',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
MemberSchema.index({ email: 1 });
MemberSchema.index({ nickname: 1 }, { sparse: true });
MemberSchema.index({ fullName: 'text' });

const Member: Model<IMember> =
    mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);

export default Member;

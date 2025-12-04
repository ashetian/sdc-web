import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type TeamRole = 'president' | 'vice_president' | 'head' | 'member' | 'featured';

export interface ITeamMember extends Document {
    name: string;
    email: string;
    phone?: string;
    photo?: string;
    role: TeamRole;
    departmentId?: Types.ObjectId;
    title: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    location?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
    x?: string;
    website?: string;
    order: number;
    isActive: boolean;
    showInTeam: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
        phone: {
            type: String,
        },
        photo: {
            type: String,
        },
        role: {
            type: String,
            enum: ['president', 'vice_president', 'head', 'member', 'featured'],
            default: 'member',
        },
        departmentId: {
            type: Schema.Types.ObjectId,
            ref: 'Department',
        },
        title: {
            type: String,
        },
        titleEn: {
            type: String,
        },
        description: {
            type: String,
        },
        descriptionEn: {
            type: String,
        },
        location: {
            type: String,
        },
        github: {
            type: String,
        },
        linkedin: {
            type: String,
        },
        instagram: {
            type: String,
        },
        x: {
            type: String,
        },
        website: {
            type: String,
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        showInTeam: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent model overwrite in development with hot reload
const TeamMember: Model<ITeamMember> =
    mongoose.models.TeamMember || mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);

export default TeamMember;

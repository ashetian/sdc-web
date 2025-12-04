import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClubMember extends Document {
    electionId: mongoose.Types.ObjectId;
    rowNo: string;
    clubName: string;
    studentNo: string;
    fullName: string;
    department: string;
    phone?: string;
    email: string;
    memberType: string;
    memberStatus: string;
    hasVoted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ClubMemberSchema = new Schema<IClubMember>(
    {
        electionId: {
            type: Schema.Types.ObjectId,
            ref: 'Election',
            required: true,
        },
        rowNo: {
            type: String,
        },
        clubName: {
            type: String,
        },
        studentNo: {
            type: String,
            required: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        department: {
            type: String,
        },
        phone: {
            type: String,
        },
        email: {
            type: String,
            required: true,
        },
        memberType: {
            type: String,
        },
        memberStatus: {
            type: String,
        },
        hasVoted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

ClubMemberSchema.index({ electionId: 1, studentNo: 1 }, { unique: true });
ClubMemberSchema.index({ electionId: 1, email: 1 });

const ClubMember: Model<IClubMember> =
    mongoose.models.ClubMember || mongoose.model<IClubMember>('ClubMember', ClubMemberSchema);

export default ClubMember;

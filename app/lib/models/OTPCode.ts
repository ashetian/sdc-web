import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOTPCode extends Document {
    electionId: mongoose.Types.ObjectId;
    studentNo: string;
    email: string;
    code: string;
    expiresAt: Date;
    verified: boolean;
    createdAt: Date;
}

const OTPCodeSchema = new Schema<IOTPCode>(
    {
        electionId: {
            type: Schema.Types.ObjectId,
            ref: 'Election',
            required: true,
        },
        studentNo: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

OTPCodeSchema.index({ electionId: 1, studentNo: 1 });
OTPCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired codes

const OTPCode: Model<IOTPCode> =
    mongoose.models.OTPCode || mongoose.model<IOTPCode>('OTPCode', OTPCodeSchema);

export default OTPCode;

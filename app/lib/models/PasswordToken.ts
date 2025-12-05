import mongoose, { Schema, Document, Model } from 'mongoose';

export type TokenType = 'signup' | 'reset';

export interface IPasswordToken extends Document {
    memberId: mongoose.Types.ObjectId;
    token: string;
    type: TokenType;
    expiresAt: Date;
    usedAt?: Date;
    createdAt: Date;
}

const PasswordTokenSchema = new Schema<IPasswordToken>(
    {
        memberId: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
            required: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['signup', 'reset'],
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        usedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for cleanup of expired tokens
PasswordTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordToken: Model<IPasswordToken> =
    mongoose.models.PasswordToken || mongoose.model<IPasswordToken>('PasswordToken', PasswordTokenSchema);

export default PasswordToken;

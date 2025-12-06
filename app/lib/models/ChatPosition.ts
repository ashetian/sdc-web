import mongoose, { Schema, Document } from 'mongoose';

export interface IChatPosition extends Document {
    memberId: mongoose.Types.ObjectId;
    memberName: string;
    nickname?: string;
    color: string;
    x: number;
    y: number;
    lastSeen: Date;
}

const ChatPositionSchema = new Schema<IChatPosition>({
    memberId: {
        type: Schema.Types.ObjectId,
        ref: 'Member',
        required: true,
        unique: true,
    },
    memberName: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
    },
    color: {
        type: String,
        required: true,
    },
    x: {
        type: Number,
        required: true,
        default: 400,
    },
    y: {
        type: Number,
        required: true,
        default: 300,
    },
    lastSeen: {
        type: Date,
        default: Date.now,
        expires: 120, // TTL: 2 minutes - inactive users disappear
    },
});

// Index for efficient querying
ChatPositionSchema.index({ lastSeen: 1 });

export default mongoose.models.ChatPosition || mongoose.model<IChatPosition>('ChatPosition', ChatPositionSchema);

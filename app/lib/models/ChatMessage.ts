import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
    memberId: mongoose.Types.ObjectId;
    memberName: string;
    memberColor: string;
    message: string;
    position: {
        x: number;
        y: number;
    };
    createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
    memberId: {
        type: Schema.Types.ObjectId,
        ref: 'Member',
        required: true,
    },
    memberName: {
        type: String,
        required: true,
    },
    memberColor: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
        maxlength: 120,
    },
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600, // TTL: 10 minutes (600 seconds)
    },
});

// Index for efficient querying
ChatMessageSchema.index({ createdAt: 1 });
ChatMessageSchema.index({ memberId: 1, createdAt: -1 });

export default mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

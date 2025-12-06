import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILike extends Document {
    userId: mongoose.Types.ObjectId;
    contentType: 'announcement' | 'gallery' | 'project' | 'comment';
    contentId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const LikeSchema = new Schema<ILike>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    contentType: {
        type: String,
        enum: ['announcement', 'gallery', 'project', 'comment'],
        required: true,
    },
    contentId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Ensure a user can only like content once
LikeSchema.index({ userId: 1, contentType: 1, contentId: 1 }, { unique: true });

// Index for efficient counting
LikeSchema.index({ contentType: 1, contentId: 1 });

const Like: Model<ILike> = mongoose.models.Like || mongoose.model<ILike>('Like', LikeSchema);

export default Like;

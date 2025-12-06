import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IForumVote extends Document {
    memberId: mongoose.Types.ObjectId;
    contentType: 'topic' | 'reply';
    contentId: mongoose.Types.ObjectId;
    value: 1 | -1;
    createdAt: Date;
}

const ForumVoteSchema = new Schema<IForumVote>(
    {
        memberId: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
            required: true,
        },
        contentType: {
            type: String,
            enum: ['topic', 'reply'],
            required: true,
        },
        contentId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        value: {
            type: Number,
            enum: [1, -1],
            required: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Unique constraint: One vote per user per content
ForumVoteSchema.index(
    { memberId: 1, contentType: 1, contentId: 1 },
    { unique: true }
);

// Index for efficient vote counting
ForumVoteSchema.index({ contentType: 1, contentId: 1 });

const ForumVote: Model<IForumVote> =
    mongoose.models.ForumVote || mongoose.model<IForumVote>('ForumVote', ForumVoteSchema);

export default ForumVote;

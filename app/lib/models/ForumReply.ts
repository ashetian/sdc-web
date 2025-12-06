import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IForumReply extends Document {
    topicId: mongoose.Types.ObjectId;
    authorId: mongoose.Types.ObjectId;
    parentId?: mongoose.Types.ObjectId;
    content: string;
    upvotes: number;
    downvotes: number;
    isEdited: boolean;
    isDeleted: boolean;
    isBestAnswer: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ForumReplySchema = new Schema<IForumReply>(
    {
        topicId: {
            type: Schema.Types.ObjectId,
            ref: 'ForumTopic',
            required: true,
            index: true,
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
            required: true,
            index: true,
        },
        parentId: {
            type: Schema.Types.ObjectId,
            ref: 'ForumReply',
            index: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 5000, // Allow long markdown replies
        },
        upvotes: {
            type: Number,
            default: 0,
        },
        downvotes: {
            type: Number,
            default: 0,
        },
        isEdited: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        isBestAnswer: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for fetching replies by topic
ForumReplySchema.index({ topicId: 1, createdAt: 1 });
ForumReplySchema.index({ topicId: 1, parentId: 1, createdAt: 1 });

const ForumReply: Model<IForumReply> =
    mongoose.models.ForumReply || mongoose.model<IForumReply>('ForumReply', ForumReplySchema);

export default ForumReply;

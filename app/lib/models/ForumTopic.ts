import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IForumTopic extends Document {
    categoryId: mongoose.Types.ObjectId;
    authorId: mongoose.Types.ObjectId;
    title: string;
    titleEn?: string;
    content: string;
    contentEn?: string;
    tags: string[];
    upvotes: number;
    downvotes: number;
    replyCount: number;
    viewCount: number;
    isPinned: boolean;
    isLocked: boolean;
    isDeleted: boolean;
    lastReplyAt?: Date;
    lastReplyById?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ForumTopicSchema = new Schema<IForumTopic>(
    {
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'ForumCategory',
            required: true,
            index: true,
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        titleEn: {
            type: String,
            trim: true,
            maxlength: 200,
        },
        content: {
            type: String,
            required: true,
            maxlength: 10000, // Allow long markdown content
        },
        contentEn: {
            type: String,
            maxlength: 10000,
        },
        tags: [{
            type: String,
            trim: true,
            lowercase: true,
        }],
        upvotes: {
            type: Number,
            default: 0,
        },
        downvotes: {
            type: Number,
            default: 0,
        },
        replyCount: {
            type: Number,
            default: 0,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        isPinned: {
            type: Boolean,
            default: false,
        },
        isLocked: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        lastReplyAt: {
            type: Date,
        },
        lastReplyById: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for efficient queries
ForumTopicSchema.index({ categoryId: 1, isPinned: -1, createdAt: -1 });
ForumTopicSchema.index({ categoryId: 1, isPinned: -1, lastReplyAt: -1 });
ForumTopicSchema.index({ tags: 1 });

// Text search index
ForumTopicSchema.index({ title: 'text', content: 'text' });

const ForumTopic: Model<IForumTopic> =
    mongoose.models.ForumTopic || mongoose.model<IForumTopic>('ForumTopic', ForumTopicSchema);

export default ForumTopic;

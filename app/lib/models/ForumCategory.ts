import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IForumCategory extends Document {
    name: string;
    nameEn?: string;
    slug: string;
    description: string;
    descriptionEn?: string;
    icon: string;
    color: string;
    order: number;
    isActive: boolean;
    topicCount: number;
    lastTopicAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ForumCategorySchema = new Schema<IForumCategory>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        nameEn: {
            type: String,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            maxlength: 500,
        },
        descriptionEn: {
            type: String,
            maxlength: 500,
        },
        icon: {
            type: String,
            default: '💬',
        },
        color: {
            type: String,
            default: 'bg-neo-blue',
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        topicCount: {
            type: Number,
            default: 0,
        },
        lastTopicAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for ordering and active filtering
ForumCategorySchema.index({ order: 1, isActive: 1 });

const ForumCategory: Model<IForumCategory> =
    mongoose.models.ForumCategory || mongoose.model<IForumCategory>('ForumCategory', ForumCategorySchema);

export default ForumCategory;

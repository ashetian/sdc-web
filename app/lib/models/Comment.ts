import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
    // Polymorphic content reference
    contentType: 'project' | 'gallery' | 'announcement';
    contentId: mongoose.Types.ObjectId;
    memberId: mongoose.Types.ObjectId;
    content: string;
    isEdited: boolean;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
    {
        contentType: {
            type: String,
            enum: ['project', 'gallery', 'announcement'],
            required: true,
            index: true,
        },
        contentId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        memberId: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
            required: true,
            index: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 500,
            validate: {
                validator: function (v: string) {
                    // Link içermemeli
                    const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
                    return !urlPattern.test(v);
                },
                message: 'Yorumlara link eklenemez',
            },
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
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries
CommentSchema.index({ contentType: 1, contentId: 1 });

// Spam protection: One comment per minute per user per content
CommentSchema.index({ memberId: 1, createdAt: -1 });

// Index for deleted comments cleanup
CommentSchema.index({ isDeleted: 1, deletedAt: 1 });

const Comment: Model<IComment> =
    mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;

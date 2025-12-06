import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBookmark extends Document {
    memberId: mongoose.Types.ObjectId;
    contentType: 'event' | 'project' | 'announcement' | 'gallery' | 'comment';
    contentId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
    {
        memberId: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
            required: true,
            index: true,
        },
        contentType: {
            type: String,
            enum: ['event', 'project', 'announcement', 'gallery', 'comment'],
            required: true,
        },
        contentId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Unique constraint: One bookmark per user per content
BookmarkSchema.index(
    { memberId: 1, contentType: 1, contentId: 1 },
    { unique: true }
);

// For listing user bookmarks (sorted by newest first)
BookmarkSchema.index({ memberId: 1, createdAt: -1 });

const Bookmark: Model<IBookmark> =
    mongoose.models.Bookmark || mongoose.model<IBookmark>('Bookmark', BookmarkSchema);

export default Bookmark;

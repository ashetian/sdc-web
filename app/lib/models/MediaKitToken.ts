import mongoose, { Schema, Document, Model } from 'mongoose';

// Page interface for media kit customization
export interface IMediaKitPage {
    _id?: mongoose.Types.ObjectId;
    title: string;
    titleEn?: string;
    eventIds: mongoose.Types.ObjectId[];
}

export interface IMediaKitToken extends Document {
    token: string;
    sponsorName: string;
    email?: string;
    note?: string;
    isActive: boolean;
    expiresAt: Date;
    viewCount: number;
    lastViewedAt?: Date;
    createdBy: mongoose.Types.ObjectId;
    // Customization fields
    pageTitle?: string;
    pageTitleEn?: string;
    pages?: IMediaKitPage[];
    defaultLanguage?: 'tr' | 'en';
    createdAt: Date;
    updatedAt: Date;
}

// Schema for individual pages
const MediaKitPageSchema = new Schema({
    title: {
        type: String,
        trim: true,
        maxlength: 200,
        default: 'Etkinlikler'
    },
    titleEn: {
        type: String,
        trim: true,
        maxlength: 200,
    },
    eventIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Announcement',
    }],
}, { _id: true });

const MediaKitTokenSchema = new Schema<IMediaKitToken>(
    {
        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        sponsorName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
        },
        note: {
            type: String,
            maxlength: 500,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        lastViewedAt: {
            type: Date,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
            required: true,
        },
        // Customization fields
        pageTitle: {
            type: String,
            trim: true,
            maxlength: 200,
        },
        pageTitleEn: {
            type: String,
            trim: true,
            maxlength: 200,
        },
        pages: [MediaKitPageSchema],
        defaultLanguage: {
            type: String,
            enum: ['tr', 'en'],
            default: 'tr',
        },
    },
    {
        timestamps: true,
    }
);

// Index for active tokens lookup
MediaKitTokenSchema.index({ isActive: 1, expiresAt: 1 });

const MediaKitToken: Model<IMediaKitToken> =
    mongoose.models.MediaKitToken || mongoose.model<IMediaKitToken>('MediaKitToken', MediaKitTokenSchema);

export default MediaKitToken;

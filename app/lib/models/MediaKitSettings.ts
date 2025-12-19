import mongoose, { Schema, Document, Model } from 'mongoose';

// Page interface for media kit customization
export interface IMediaKitPage {
    _id?: mongoose.Types.ObjectId;
    title: string;
    titleEn?: string;
    eventIds: mongoose.Types.ObjectId[];
}

export interface IMediaKitSettings extends Document {
    // Main page title (hero section)
    pageTitle?: string;
    pageTitleEn?: string;
    // Custom event pages
    pages: IMediaKitPage[];
    updatedAt: Date;
    updatedBy?: mongoose.Types.ObjectId;
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

const MediaKitSettingsSchema = new Schema<IMediaKitSettings>(
    {
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
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
        },
    },
    {
        timestamps: true,
    }
);

const MediaKitSettings: Model<IMediaKitSettings> =
    mongoose.models.MediaKitSettings || mongoose.model<IMediaKitSettings>('MediaKitSettings', MediaKitSettingsSchema);

export default MediaKitSettings;

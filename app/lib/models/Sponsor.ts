import mongoose, { Schema, Document } from 'mongoose';

export interface ISponsor extends Document {
    name: string;
    nameEn?: string;
    description: string;
    descriptionEn?: string;
    logo: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SponsorSchema = new Schema<ISponsor>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    nameEn: {
        type: String,
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
    logo: {
        type: String,
        required: true,
    },
    order: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Index for ordering
SponsorSchema.index({ order: 1, isActive: 1 });

export default mongoose.models.Sponsor || mongoose.model<ISponsor>('Sponsor', SponsorSchema);

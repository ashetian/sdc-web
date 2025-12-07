import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITechStack extends Document {
    name: string;
    description: string;
    template: string;
    icon: string;
    color: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TechStackSchema = new Schema<ITechStack>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        template: {
            type: String,
            required: true,
            trim: true,
        },
        icon: {
            type: String,
            default: '📦',
        },
        color: {
            type: String,
            default: 'bg-neo-blue',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const TechStack: Model<ITechStack> =
    mongoose.models.TechStack || mongoose.model<ITechStack>('TechStack', TechStackSchema);

export default TechStack;

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartment extends Document {
    name: string;
    nameEn?: string;
    slug: string;
    description: string;
    descriptionEn?: string;
    icon: string;
    color: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        nameEn: {
            type: String,
            required: false,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        descriptionEn: {
            type: String,
            required: false,
        },
        icon: {
            type: String,
            default: 'code', // Icon identifier
        },
        color: {
            type: String,
            default: 'bg-neo-blue', // Tailwind class
        },
        order: {
            type: Number,
            default: 0,
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

// Prevent model overwrite in development with hot reload
const Department: Model<IDepartment> =
    mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);

export default Department;

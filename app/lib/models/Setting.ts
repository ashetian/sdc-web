import mongoose from 'mongoose';

export interface ISetting {
    key: string;
    value: string;
}

const settingSchema = new mongoose.Schema<ISetting>(
    {
        key: {
            type: String,
            required: true,
            unique: true,
        },
        value: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Setting = mongoose.models.Setting || mongoose.model<ISetting>('Setting', settingSchema);

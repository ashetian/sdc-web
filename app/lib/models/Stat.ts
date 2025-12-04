import mongoose from 'mongoose';

export interface IStat {
    key: string; // unique identifier like 'members', 'projects', 'events'
    label: string; // display text like 'Üye', 'Proje', 'Etkinlik'
    labelEn?: string; // English display text like 'Members', 'Projects', 'Events'
    value: string; // the number/text to display like '220+', '2', '12'
    color: string; // neo-brutalist color class like 'bg-neo-green'
    order: number; // display order (0, 1, 2, etc.)
    isActive: boolean; // whether to display this stat
    createdAt: Date;
    updatedAt: Date;
}

const statSchema = new mongoose.Schema<IStat>(
    {
        key: {
            type: String,
            required: true,
            unique: true,
        },
        label: {
            type: String,
            required: true,
        },
        labelEn: {
            type: String,
            required: false,
        },
        value: {
            type: String,
            required: true,
        },
        color: {
            type: String,
            required: true,
            default: 'bg-neo-blue',
        },
        order: {
            type: Number,
            required: true,
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

export const Stat = mongoose.models.Stat || mongoose.model<IStat>('Stat', statSchema);

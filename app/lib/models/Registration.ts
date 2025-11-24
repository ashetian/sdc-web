import mongoose from 'mongoose';

export interface IRegistration {
    eventId: mongoose.Types.ObjectId;
    studentNumber: string;
    name: string;
    phone: string;
    department: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

const registrationSchema = new mongoose.Schema<IRegistration>(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
        studentNumber: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        department: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Registration = mongoose.models.Registration || mongoose.model<IRegistration>('Registration', registrationSchema);

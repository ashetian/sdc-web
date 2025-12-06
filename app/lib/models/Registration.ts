import mongoose from 'mongoose';

export interface IRegistration {
    eventId: mongoose.Types.ObjectId;
    memberId: mongoose.Types.ObjectId; // Required - only members can register now
    // Legacy fields (for old registrations, will be empty for new ones)
    studentNumber?: string;
    name?: string;
    phone?: string;
    department?: string;
    email?: string;
    // Payment
    paymentProofUrl?: string;
    paymentStatus?: 'pending' | 'verified' | 'rejected' | 'refunded';
    // Attendance tracking
    attendedAt?: Date; // QR check-in time
    rating?: number; // 1-5 stars
    feedback?: string; // Optional comment
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
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member',
            required: true,
        },
        // Legacy fields (kept for backwards compatibility)
        studentNumber: {
            type: String,
            required: false,
        },
        name: {
            type: String,
            required: false,
        },
        phone: {
            type: String,
            required: false,
        },
        department: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: false,
        },
        paymentProofUrl: {
            type: String,
            required: false,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected', 'refunded'],
            default: 'pending',
        },
        // Attendance fields
        attendedAt: {
            type: Date,
            required: false,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: false,
        },
        feedback: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to prevent duplicate registrations
registrationSchema.index({ eventId: 1, memberId: 1 }, { unique: true });

export const Registration = mongoose.models.Registration || mongoose.model<IRegistration>('Registration', registrationSchema);


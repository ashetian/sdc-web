import mongoose from 'mongoose';

export interface IGuestRegistration {
    eventId: mongoose.Types.ObjectId;
    fullName: string;
    email: string;
    phone?: string;
    // Approval status
    status: 'pending' | 'approved' | 'rejected';
    approvedAt?: Date;
    approvedBy?: mongoose.Types.ObjectId;
    // Attendance
    attendanceToken?: string;
    attendanceEmailSentAt?: Date;
    attendedAt?: Date;
    rating?: number;
    feedback?: string;
    // Payment (for paid events)
    paymentProofUrl?: string;
    paymentStatus?: 'pending' | 'verified' | 'rejected' | 'refunded';
    createdAt: Date;
    updatedAt: Date;
}

const guestRegistrationSchema = new mongoose.Schema<IGuestRegistration>(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        // Approval
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        approvedAt: {
            type: Date,
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member',
        },
        // Attendance
        attendanceToken: {
            type: String,
            unique: true,
            sparse: true,
        },
        attendanceEmailSentAt: {
            type: Date,
        },
        attendedAt: {
            type: Date,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        feedback: {
            type: String,
            trim: true,
        },
        // Payment
        paymentProofUrl: {
            type: String,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected', 'refunded'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
guestRegistrationSchema.index({ eventId: 1, email: 1 }, { unique: true });
guestRegistrationSchema.index({ eventId: 1, status: 1 });

export const GuestRegistration =
    mongoose.models.GuestRegistration ||
    mongoose.model<IGuestRegistration>('GuestRegistration', guestRegistrationSchema);

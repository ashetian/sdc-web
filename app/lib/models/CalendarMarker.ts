import mongoose, { Schema, Document, Model } from 'mongoose';

export type MarkerType = 'holiday' | 'exam_week' | 'registration_period' | 'semester_break' | 'important';

export interface ICalendarMarker extends Document {
    title: string;
    titleEn?: string;
    type: MarkerType;
    startDate: Date;
    endDate: Date;
    color?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CalendarMarkerSchema = new Schema<ICalendarMarker>(
    {
        title: {
            type: String,
            required: true,
            maxlength: 100,
        },
        titleEn: {
            type: String,
            maxlength: 100,
        },
        type: {
            type: String,
            required: true,
            enum: ['holiday', 'exam_week', 'registration_period', 'semester_break', 'important'],
            index: true,
        },
        startDate: {
            type: Date,
            required: true,
            index: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        color: {
            type: String,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient date range queries
CalendarMarkerSchema.index({ startDate: 1, endDate: 1 });

const CalendarMarker: Model<ICalendarMarker> =
    mongoose.models.CalendarMarker || mongoose.model<ICalendarMarker>('CalendarMarker', CalendarMarkerSchema);

export default CalendarMarker;

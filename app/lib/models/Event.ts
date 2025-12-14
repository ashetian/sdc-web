import mongoose from 'mongoose';

// Content block interface for completion reports
export interface IReportContentBlock {
  id: string;
  type: 'text' | 'image' | 'image-grid';
  content?: string;
  contentEn?: string;
  image?: string;
  images?: string[];
}

// Completion report interface
export interface ICompletionReport {
  contentBlocks: IReportContentBlock[];
  participantCount: number;
  duration: number; // in minutes
  summary: string;
  summaryEn?: string;
  reportedAt?: Date;
}

export interface IEvent {
  title: string;
  description: string;
  posterUrl?: string;
  eventDate: Date;
  eventEndDate?: Date;
  location?: string;
  isOpen: boolean;
  isPaid: boolean;
  price?: number;
  iban?: string;
  createdAt: Date;
  updatedAt: Date;
  titleEn?: string;
  descriptionEn?: string;
  // Attendance fields
  attendanceCode?: string;
  isEnded: boolean;
  remindersSent?: boolean;
  actualDuration?: number; // in minutes, admin-entered
  // Completion report
  completionReport?: ICompletionReport;
}

const eventSchema = new mongoose.Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    posterUrl: {
      type: String,
      required: false,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    eventEndDate: {
      type: Date,
      required: false,
    },
    location: {
      type: String,
      required: false,
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: false,
    },
    iban: {
      type: String,
      required: false,
    },
    titleEn: {
      type: String,
      required: false,
    },
    descriptionEn: {
      type: String,
      required: false,
    },
    // Attendance fields
    attendanceCode: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    isEnded: {
      type: Boolean,
      default: false,
    },
    actualDuration: {
      type: Number,
      required: false,
    },
    // Completion report
    completionReport: {
      type: {
        contentBlocks: [{
          id: String,
          type: { type: String, enum: ['text', 'image', 'image-grid'] },
          content: String,
          contentEn: String,
          image: String,
          images: [String],
        }],
        participantCount: Number,
        duration: Number,
        summary: String,
        summaryEn: String,
        reportedAt: Date,
      },
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
eventSchema.index({ eventDate: 1 });
eventSchema.index({ isOpen: 1, createdAt: -1 });

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);


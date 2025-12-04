import mongoose from 'mongoose';

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
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);

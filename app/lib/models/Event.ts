import mongoose from 'mongoose';

export interface IEvent {
  title: string;
  description: string;
  posterUrl?: string;
  eventDate: Date;
  eventEndDate?: Date;
  location?: string;
  isPaid: boolean;
  fee?: number;
  paymentIBAN?: string;
  paymentDetails?: string;
  isOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
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
    isPaid: {
      type: Boolean,
      default: false,
    },
    fee: {
      type: Number,
      required: false,
    },
    paymentIBAN: {
      type: String,
      required: false,
    },
    paymentDetails: {
      type: String,
      required: false,
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);

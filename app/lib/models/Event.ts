import mongoose from 'mongoose';

export interface IEvent {
  title: string;
  description: string;
  posterUrl?: string;
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

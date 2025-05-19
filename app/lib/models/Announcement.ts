import mongoose from 'mongoose';

export interface IAnnouncement {
  slug: string;
  title: string;
  date: string;
  description: string;
  type: 'event' | 'news' | 'workshop';
  content: string;
  image?: string;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
  galleryLinks?: string[];
  galleryCover?: string;
  isInGallery?: boolean;
}

const announcementSchema = new mongoose.Schema<IAnnouncement>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['event', 'news', 'workshop'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    galleryLinks: {
      type: [String],
      default: [],
    },
    galleryCover: {
      type: String,
      required: false,
    },
    isInGallery: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Model zaten tanımlıysa onu kullan, değilse yeni model oluştur
export const Announcement = mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', announcementSchema); 
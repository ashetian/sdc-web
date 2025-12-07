import mongoose from 'mongoose';

export interface IContentBlock {
  id: string;
  type: 'text' | 'image' | 'image-grid';
  content?: string;
  contentEn?: string;
  image?: string;
  images?: string[];
}

export interface IAnnouncement {
  slug: string;
  title: string;
  date: string;
  description: string;
  type: 'event' | 'news' | 'article';
  content: string;
  image?: string;
  imageOrientation?: 'horizontal' | 'vertical';
  isDraft: boolean;
  isArchived?: boolean;
  createdAt: Date;
  updatedAt: Date;
  galleryLinks?: string[];
  galleryCover?: string;
  isInGallery?: boolean;
  galleryDescription?: string;
  eventId?: string;
  titleEn?: string;
  dateEn?: string;
  descriptionEn?: string;
  contentEn?: string;
  galleryDescriptionEn?: string;
  contentBlocks?: IContentBlock[];
  contentBlocksEn?: IContentBlock[];
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
      enum: ['event', 'news', 'article'],
      required: true,
    },
    content: {
      type: String,
      required: false,
      default: '',
    },
    image: {
      type: String,
      required: false,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    isArchived: {
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
    galleryDescription: {
      type: String,
      required: false,
      default: '',
    },
    eventId: {
      type: String, // ObjectId olarak tutmak daha doğru olurdu ama ref karmaşası olmasın diye string tutuyoruz, zaten manuel gireceğiz.
      required: false,
    },
    titleEn: {
      type: String,
      required: false,
    },
    dateEn: {
      type: String,
      required: false,
    },
    descriptionEn: {
      type: String,
      required: false,
    },
    contentEn: {
      type: String,
      required: false,
    },
    galleryDescriptionEn: {
      type: String,
      required: false,
    },
    contentBlocks: {
      type: [{
        id: String,
        type: { type: String, enum: ['text', 'image', 'image-grid'] },
        content: String,
        contentEn: String,
        image: String,
        images: [String],
      }],
      required: false,
      default: [],
    },
    contentBlocksEn: {
      type: [{
        id: String,
        type: { type: String, enum: ['text', 'image', 'image-grid'] },
        content: String,
        contentEn: String,
        image: String,
        images: [String],
      }],
      required: false,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Model zaten tanımlıysa onu kullan, değilse yeni model oluştur
export const Announcement = mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', announcementSchema); 
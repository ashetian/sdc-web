import { MetadataRoute } from 'next';
import connectDB from './lib/db';
import { Announcement, IAnnouncement } from './lib/models/Announcement';
import { Event, IEvent } from './lib/models/Event';

const BASE_URL = 'https://ktusdc.com';

interface AnnouncementDoc {
    slug: string;
    updatedAt?: Date;
}

interface EventDoc {
    _id: string;
    updatedAt?: Date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    await connectDB();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${BASE_URL}/events`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/gallery`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/announcements`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/join`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/kvkk`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    // Dynamic announcement pages
    const announcements = await Announcement.find({ isDraft: false })
        .select('slug updatedAt')
        .lean() as unknown as AnnouncementDoc[];

    const announcementPages: MetadataRoute.Sitemap = announcements.map((announcement: AnnouncementDoc) => ({
        url: `${BASE_URL}/announcements/${announcement.slug}`,
        lastModified: announcement.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Gallery pages (announcements with gallery)
    const galleryAnnouncements = await Announcement.find({
        isDraft: false,
        galleryLinks: { $exists: true, $ne: [] }
    })
        .select('slug updatedAt')
        .lean() as unknown as AnnouncementDoc[];

    const galleryPages: MetadataRoute.Sitemap = galleryAnnouncements.map((announcement: AnnouncementDoc) => ({
        url: `${BASE_URL}/gallery/${announcement.slug}`,
        lastModified: announcement.updatedAt || new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    // Dynamic event pages
    const events = await Event.find({ isOpen: true })
        .select('_id updatedAt')
        .lean() as unknown as EventDoc[];

    const eventPages: MetadataRoute.Sitemap = events.map((event: EventDoc) => ({
        url: `${BASE_URL}/events/${event._id}`,
        lastModified: event.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [...staticPages, ...announcementPages, ...galleryPages, ...eventPages];
}


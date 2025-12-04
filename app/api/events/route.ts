import { Types } from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Event, IEvent } from '@/app/lib/models/Event';
import { Announcement, IAnnouncement } from '@/app/lib/models/Announcement';

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode');

        let query = {};
        if (mode !== 'admin') {
            query = { isOpen: true };
        }

        const events = (await Event.find(query).sort({ createdAt: -1 }).lean()) as unknown as (IEvent & { _id: Types.ObjectId })[];

        // Fetch related announcements
        const eventIds = events.map(event => event._id.toString());
        const announcements = (await Announcement.find({ eventId: { $in: eventIds } }).select('slug eventId').lean()) as unknown as (IAnnouncement & { _id: Types.ObjectId })[];

        // Create a map of eventId -> slug
        const announcementMap = new Map();
        announcements.forEach(announcement => {
            if (announcement.eventId) {
                announcementMap.set(announcement.eventId, announcement.slug);
            }
        });

        // Attach slug to events
        const eventsWithSlugs = events.map(event => ({
            ...event,
            announcementSlug: announcementMap.get(event._id.toString())
        }));

        return NextResponse.json(eventsWithSlugs);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Etkinlikler getirilemedi.' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const body = await request.json();

        // Auto-translate if DeepL API key is available
        let eventData = { ...body };
        if (process.env.DEEPL_API_KEY) {
            try {
                const { translateFields } = await import('@/app/lib/translate');
                const translations = await translateFields({
                    title: body.title,
                    description: body.description,
                }, 'tr');

                eventData = {
                    ...body,
                    titleEn: translations.title?.en || '',
                    descriptionEn: translations.description?.en || '',
                };
            } catch (translateError) {
                console.error('Auto-translation failed:', translateError);
                // Continue without translation
            }
        }

        const event = await Event.create(eventData);
        return NextResponse.json(event, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Etkinlik oluşturulamadı.' }, { status: 500 });
    }
}


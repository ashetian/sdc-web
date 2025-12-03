import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Event } from '@/app/lib/models/Event';

import { Announcement } from '@/app/lib/models/Announcement';

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode');

        let query = {};
        if (mode !== 'admin') {
            query = { isOpen: true };
        }

        const events = await Event.find(query).sort({ createdAt: -1 }).lean();

        // Fetch related announcements
        const eventIds = (events as any[]).map(event => event._id.toString());
        const announcements = await Announcement.find({ eventId: { $in: eventIds } }).select('slug eventId').lean();

        // Create a map of eventId -> slug
        const announcementMap = new Map();
        announcements.forEach((announcement: any) => {
            if (announcement.eventId) {
                announcementMap.set(announcement.eventId, announcement.slug);
            }
        });

        // Attach slug to events
        const eventsWithSlugs = (events as any[]).map(event => ({
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

        const event = await Event.create(body);
        return NextResponse.json(event, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Etkinlik oluşturulamadı.' }, { status: 500 });
    }
}


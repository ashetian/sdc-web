import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Event } from '@/app/lib/models/Event';

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode');

        let query = {};
        if (mode !== 'admin') {
            query = { isOpen: true };
        }

        const events = await Event.find(query).sort({ createdAt: -1 });
        return NextResponse.json(events);
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


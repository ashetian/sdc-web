import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Event } from '@/app/lib/models/Event';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const body = await request.json();
        const { id } = params;

        const event = await Event.findByIdAndUpdate(id, body, { new: true });

        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı.' }, { status: 404 });
        }

        return NextResponse.json(event);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Etkinlik güncellenemedi.' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const { id } = params;

        const event = await Event.findByIdAndDelete(id);

        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Etkinlik silindi.' });
    } catch {
        return NextResponse.json({ error: 'Etkinlik silinemedi.' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Event } from '@/app/lib/models/Event';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const { id } = params;
        const event = await Event.findById(id);

        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı.' }, { status: 404 });
        }

        return NextResponse.json(event);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Etkinlik getirilemedi.' }, { status: 500 });
    }
}

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

import { deleteFromCloudinary, deleteFolder, sanitizeFolderName } from '@/app/lib/cloudinaryHelper';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const { id } = params;

        // Find event first to get posterUrl
        const event = await Event.findById(id);

        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı.' }, { status: 404 });
        }

        // Delete poster if exists
        if (event.posterUrl) {
            await deleteFromCloudinary(event.posterUrl);
        }

        // Clean up receipts folder
        // We prefer title-based folder, but fallback to ID if needed (though new uploads use title)
        if (event.title) {
            await deleteFolder(`sdc-web-receipts/${sanitizeFolderName(event.title)}`);
        } else {
            await deleteFolder(`sdc-web-receipts/${id}`);
        }

        // Delete event from DB
        await Event.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Etkinlik silindi.' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Etkinlik silinemedi.' }, { status: 500 });
    }
}

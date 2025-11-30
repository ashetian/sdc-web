import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Registration } from '@/app/lib/models/Registration';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const { id } = params; // eventId

        const registrations = await Registration.find({ eventId: id }).sort({ createdAt: -1 });
        return NextResponse.json(registrations);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Kayıtlar getirilemedi.' }, { status: 500 });
    }
}

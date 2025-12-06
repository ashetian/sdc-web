import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Event } from '@/app/lib/models/Event';
import { Registration } from '@/app/lib/models/Registration';
import { verifyAuth } from '@/app/lib/auth';

// POST /api/events/[id]/end - End event and record stats
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        // Admin only
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        const { actualDuration } = await request.json();

        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
        }

        if (event.isEnded) {
            return NextResponse.json({ error: 'Bu etkinlik zaten sonlandırılmış' }, { status: 400 });
        }

        // Get attendance stats
        const totalAttended = await Registration.countDocuments({
            eventId: id,
            attendedAt: { $ne: null },
        });

        // Update event
        event.isEnded = true;
        event.isOpen = false; // Close registration
        event.actualDuration = actualDuration;
        await event.save();

        return NextResponse.json({
            message: 'Etkinlik sonlandırıldı',
            stats: {
                attendeeCount: totalAttended,
                duration: actualDuration,
            },
        });
    } catch (error) {
        console.error('End event error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

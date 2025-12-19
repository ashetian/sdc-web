import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { GuestRegistration } from '@/app/lib/models/GuestRegistration';
import { Event } from '@/app/lib/models/Event';

// POST - Guest check-in via token (no auth required)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const { token, rating, feedback, surveyAnswers } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Token gerekli' }, { status: 400 });
        }

        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
        }

        if (event.isEnded) {
            return NextResponse.json({ error: 'Bu etkinlik sona ermis' }, { status: 400 });
        }

        const guestRegistration = await GuestRegistration.findOne({
            eventId: id,
            attendanceToken: token,
        });

        if (!guestRegistration) {
            return NextResponse.json({ error: 'Gecersiz yoklama linki' }, { status: 404 });
        }

        if (guestRegistration.status !== 'approved') {
            return NextResponse.json({ error: 'Kaydınız henuz onaylanmamıs' }, { status: 400 });
        }

        if (guestRegistration.attendedAt) {
            return NextResponse.json({ error: 'Zaten yoklama yaptınız' }, { status: 400 });
        }

        // Mark attendance
        guestRegistration.attendedAt = new Date();
        if (rating) guestRegistration.rating = rating;
        if (feedback) guestRegistration.feedback = feedback;
        if (surveyAnswers) guestRegistration.surveyAnswers = surveyAnswers;
        await guestRegistration.save();

        return NextResponse.json({
            message: 'Yoklama başarılı! Etkinliğe hoş geldiniz.',
            guestRegistration,
        });
    } catch (error) {
        console.error('Guest checkin error:', error);
        return NextResponse.json({ error: 'Yoklama yapılamadı' }, { status: 500 });
    }
}

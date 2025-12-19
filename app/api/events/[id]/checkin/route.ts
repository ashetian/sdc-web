import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Event } from '@/app/lib/models/Event';
import { Registration } from '@/app/lib/models/Registration';
import { verifyAuth } from '@/app/lib/auth';

interface RouteContext {
    params: Promise<{ id: string }>
}

// POST /api/events/[id]/checkin - Check in to an event with rating and survey answers
export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const auth = await verifyAuth(request);
        if (!auth) {
            return NextResponse.json({ error: 'Giris yapmalısınız' }, { status: 401 });
        }

        await connectDB();
        const { id } = await context.params;
        const { rating, comment, surveyAnswers } = await request.json();

        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
        }

        if (event.isEnded) {
            return NextResponse.json({ error: 'Bu etkinlik sona ermis' }, { status: 400 });
        }

        // Find or create registration
        let registration = await Registration.findOne({
            eventId: id,
            memberId: auth.userId,
        });

        if (registration) {
            // Update existing registration with attendance
            if (registration.attendedAt) {
                return NextResponse.json({ error: 'Zaten yoklama yaptınız' }, { status: 400 });
            }
            registration.attendedAt = new Date();
            registration.rating = rating;
            registration.feedback = comment;
            registration.surveyAnswers = surveyAnswers || [];
            await registration.save();
        } else {
            // Create new registration with attendance
            registration = await Registration.create({
                eventId: id,
                memberId: auth.userId,
                attendedAt: new Date(),
                rating,
                feedback: comment,
                surveyAnswers: surveyAnswers || [],
            });
        }

        return NextResponse.json({
            message: 'Yoklama basarılı!',
            registration,
        });
    } catch (error) {
        console.error('Checkin error:', error);
        return NextResponse.json({ error: 'Bir hata olustu' }, { status: 500 });
    }
}

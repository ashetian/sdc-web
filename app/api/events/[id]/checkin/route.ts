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
        const { rating, comment, surveyAnswers, session } = await request.json();

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

        // 2. yoklama mı?
        const isSession2 = session === 2 || session === '2';

        if (registration) {
            if (isSession2) {
                // 2. yoklama
                if (registration.attendedAt2) {
                    return NextResponse.json({ error: 'Zaten 2. yoklama yaptınız' }, { status: 400 });
                }
                registration.attendedAt2 = new Date();
            } else {
                // 1. yoklama
                if (registration.attendedAt) {
                    return NextResponse.json({ error: 'Zaten yoklama yaptınız' }, { status: 400 });
                }
                registration.attendedAt = new Date();
                registration.rating = rating;
                registration.feedback = comment;
                registration.surveyAnswers = surveyAnswers || [];
            }
            await registration.save();
        } else {
            // Create new registration with attendance
            const regData: any = {
                eventId: id,
                memberId: auth.userId,
            };

            if (isSession2) {
                regData.attendedAt2 = new Date();
            } else {
                regData.attendedAt = new Date();
                regData.rating = rating;
                regData.feedback = comment;
                regData.surveyAnswers = surveyAnswers || [];
            }

            registration = await Registration.create(regData);
        }

        return NextResponse.json({
            message: isSession2 ? '2. Yoklama başarılı!' : 'Yoklama başarılı!',
            registration,
        });
    } catch (error) {
        console.error('Checkin error:', error);
        return NextResponse.json({ error: 'Bir hata olustu' }, { status: 500 });
    }
}


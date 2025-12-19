import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Event } from '@/app/lib/models/Event';
import { verifyAuth } from '@/app/lib/auth';

interface RouteContext {
    params: Promise<{ id: string }>
}

// GET /api/events/[id]/survey - Get survey questions for an event
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        await connectDB();
        const { id } = await context.params;

        const event = await Event.findById(id).select('surveyQuestions title');
        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
        }

        return NextResponse.json({
            eventId: event._id,
            title: event.title,
            surveyQuestions: event.surveyQuestions || [],
        });
    } catch (error) {
        console.error('Get survey error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}

// PUT /api/events/[id]/survey - Update survey questions (admin only)
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const auth = await verifyAuth(request);
        if (!auth) {
            return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
        }

        await connectDB();
        const { id } = await context.params;
        const { surveyQuestions } = await request.json();

        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
        }

        // Validate and update survey questions
        event.surveyQuestions = surveyQuestions || [];
        await event.save();

        return NextResponse.json({
            success: true,
            surveyQuestions: event.surveyQuestions,
        });
    } catch (error) {
        console.error('Update survey error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Event } from '@/app/lib/models/Event';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

async function isAdmin() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;
        if (!token) return false;
        await jwtVerify(token, JWT_SECRET);
        return true;
    } catch {
        return false;
    }
}

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET - Fetch event report
export async function GET(request: NextRequest, context: RouteContext) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectDB();
        const { id } = await context.params;

        const event = await Event.findById(id).select('title completionReport isEnded');

        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
        }

        return NextResponse.json({
            title: event.title,
            report: event.completionReport || null,
            isEnded: event.isEnded,
        });
    } catch (error) {
        console.error('Report fetch error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// POST - Save event report
export async function POST(request: NextRequest, context: RouteContext) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectDB();
        const { id } = await context.params;

        const event = await Event.findById(id);

        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
        }

        // Don't allow editing report if event is already ended
        if (event.isEnded) {
            return NextResponse.json({ error: 'Biten etkinliğin raporu düzenlenemez' }, { status: 400 });
        }

        const { contentBlocks, participantCount, duration, summary, summaryEn } = await request.json();

        if (!summary || summary.trim().length === 0) {
            return NextResponse.json({ error: 'Rapor özeti gerekli' }, { status: 400 });
        }

        if (!participantCount || participantCount <= 0) {
            return NextResponse.json({ error: 'Geçerli katılımcı sayısı gerekli' }, { status: 400 });
        }

        if (!duration || duration <= 0) {
            return NextResponse.json({ error: 'Geçerli süre gerekli' }, { status: 400 });
        }

        // Translate content blocks if DeepL is available
        let translatedContentBlocks = contentBlocks || [];
        if (process.env.DEEPL_API_KEY && contentBlocks && contentBlocks.length > 0) {
            try {
                const { translateContentBlocks } = await import('@/app/lib/translate');
                translatedContentBlocks = await translateContentBlocks(contentBlocks, 'tr');
            } catch (translateError) {
                console.error('Content blocks translation failed:', translateError);
                // Continue with untranslated blocks
            }
        }

        event.completionReport = {
            contentBlocks: translatedContentBlocks,
            participantCount,
            duration,
            summary,
            summaryEn: summaryEn || '',
            reportedAt: new Date(),
        };

        await event.save();

        return NextResponse.json({
            success: true,
            message: 'Rapor kaydedildi',
            report: event.completionReport
        });
    } catch (error) {
        console.error('Report save error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

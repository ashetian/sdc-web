import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Event } from '@/app/lib/models/Event';
import { verifyAuth } from '@/app/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';
import { deleteFromCloudinary, deleteFolder, sanitizeFolderName } from '@/app/lib/cloudinaryHelper';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;

        // Auth check
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        const body = await request.json();

        // Auto-translate if DeepL API key is available
        let updateData = { ...body };
        if (process.env.DEEPL_API_KEY && (body.title || body.description)) {
            try {
                if (!body.titleEn || !body.descriptionEn) {
                    const { translateFields } = await import('@/app/lib/translate');
                    const fieldsToTranslate: Record<string, string> = {};
                    if (body.title) fieldsToTranslate.title = body.title;
                    if (body.description) fieldsToTranslate.description = body.description;

                    const translations = await translateFields(fieldsToTranslate, 'tr');

                    if (body.title && !body.titleEn) updateData.titleEn = translations.title?.en;
                    if (body.description && !body.descriptionEn) updateData.descriptionEn = translations.description?.en;
                }
            } catch (translateError) {
                console.error('Auto-translation failed:', translateError);
            }
        }

        const event = await Event.findByIdAndUpdate(id, updateData, { new: true });

        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı.' }, { status: 404 });
        }

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.UPDATE_EVENT,
            targetType: 'Event',
            targetId: id,
            targetName: event.title,
        });

        return NextResponse.json(event);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Etkinlik güncellenemedi.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;

        // Auth check
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        const event = await Event.findById(id);

        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı.' }, { status: 404 });
        }

        const eventTitle = event.title;

        // Delete poster if exists
        if (event.posterUrl) {
            await deleteFromCloudinary(event.posterUrl);
        }

        // Clean up receipts folder
        if (event.title) {
            await deleteFolder(`sdc-web-receipts/${sanitizeFolderName(event.title)}`);
        } else {
            await deleteFolder(`sdc-web-receipts/${id}`);
        }

        // Delete event from DB
        await Event.findByIdAndDelete(id);

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.DELETE_EVENT,
            targetType: 'Event',
            targetId: id,
            targetName: eventTitle,
        });

        return NextResponse.json({ message: 'Etkinlik silindi.' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Etkinlik silinemedi.' }, { status: 500 });
    }
}


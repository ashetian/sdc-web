import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Registration } from '@/app/lib/models/Registration';
import { Event } from '@/app/lib/models/Event';

export async function POST(request: Request) {
    try {
        await connectDB();
        const body = await request.json();
        const { eventId, studentNumber } = body;

        // Etkinliğin açık olup olmadığını kontrol et
        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı.' }, { status: 404 });
        }
        if (!event.isOpen) {
            return NextResponse.json({ error: 'Bu etkinlik için başvurular kapalı.' }, { status: 400 });
        }

        // Ücretli etkinlik kontrolü
        if (event.isPaid && !body.paymentProofUrl) {
            return NextResponse.json({ error: 'Ücretli etkinlikler için ödeme dekontu yüklenmelidir.' }, { status: 400 });
        }

        // Mükerrer kayıt kontrolü (isteğe bağlı ama iyi bir pratik)
        const existingRegistration = await Registration.findOne({
            eventId,
            $or: [{ studentNumber }, { email: body.email }]
        });
        if (existingRegistration) {
            return NextResponse.json({ error: 'Bu öğrenci numarası veya e-posta ile zaten kaydolunmuş.' }, { status: 400 });
        }

        const registration = await Registration.create(body);

        // Admin notification for new registration
        try {
            const { createAdminNotification } = await import('@/app/lib/notifications');
            await createAdminNotification({
                type: 'admin_new_registration',
                title: 'Yeni etkinlik kaydı',
                titleEn: 'New event registration',
                message: `"${event.title}" etkinliğine yeni kayıt: ${body.fullName}`,
                messageEn: `New registration for "${event.titleEn || event.title}": ${body.fullName}`,
                link: `/admin/events/${eventId}`,
                relatedContentType: 'registration',
                relatedContentId: registration._id,
            });
        } catch (notifError) {
            console.error('Admin notification error:', notifError);
        }

        return NextResponse.json(registration, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Kayıt oluşturulamadı.' }, { status: 500 });
    }
}


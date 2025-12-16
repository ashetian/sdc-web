import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { GuestRegistration } from '@/app/lib/models/GuestRegistration';
import { Event } from '@/app/lib/models/Event';
import { verifyAuth } from '@/app/lib/auth';
import crypto from 'crypto';

// POST - Approve or reject guest registration
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; guestId: string }> }
) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        await connectDB();
        const { id, guestId } = await params;
        const { action } = await request.json();

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
        }

        const guestRegistration = await GuestRegistration.findOne({
            _id: guestId,
            eventId: id,
        });

        if (!guestRegistration) {
            return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
        }

        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
        }

        const { sendEmail, wrapEmailHtml } = await import('@/app/lib/email');

        if (action === 'approve') {
            guestRegistration.status = 'approved';
            guestRegistration.approvedAt = new Date();
            guestRegistration.approvedBy = user.userId;

            // Send approval email first
            const emailHtml = wrapEmailHtml(`
                <p>Merhaba <strong>${guestRegistration.fullName}</strong>,</p>
                <p><strong>${event.title}</strong> etkinliğine kaydınız onaylanmıştır.</p>
                <p><strong>Tarih:</strong> ${new Date(event.eventDate).toLocaleString('tr-TR')}</p>
                <p><strong>Yer:</strong> ${event.location || 'Belirtilmedi'}</p>
                <br>
                <p>Etkinlikte görüşmek üzere!</p>
            `, 'Etkinlik Kaydı Onaylandı');

            try {
                await sendEmail({
                    to: guestRegistration.email,
                    subject: `Kayıt Onaylandı: ${event.title}`,
                    html: emailHtml,
                });
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // Email failed but continue with approval
            }

            // Save after attempting email
            await guestRegistration.save();

            return NextResponse.json({
                message: 'Kayıt onaylandı',
                guestRegistration,
            });
        } else {
            guestRegistration.status = 'rejected';

            // Send rejection email first
            const emailHtml = wrapEmailHtml(`
                <p>Merhaba <strong>${guestRegistration.fullName}</strong>,</p>
                <p><strong>${event.title}</strong> etkinliğine yaptığınız başvuru maalesef kabul edilememiştir.</p>
                <p>Sorularınız için bizimle iletişime geçebilirsiniz.</p>
            `, 'Etkinlik Kaydı Durumu');

            try {
                await sendEmail({
                    to: guestRegistration.email,
                    subject: `Kayıt Durumu: ${event.title}`,
                    html: emailHtml,
                });
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // Email failed but continue with rejection
            }

            // Save after attempting email
            await guestRegistration.save();

            return NextResponse.json({
                message: 'Kayıt reddedildi',
                guestRegistration,
            });
        }
    } catch (error) {
        console.error('Guest approval error:', error);
        return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
    }
}

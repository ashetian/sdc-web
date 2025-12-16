import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { GuestRegistration } from '@/app/lib/models/GuestRegistration';
import { Event } from '@/app/lib/models/Event';
import { verifyAuth } from '@/app/lib/auth';
import crypto from 'crypto';

// POST - Send attendance email to guest
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

        const guestRegistration = await GuestRegistration.findOne({
            _id: guestId,
            eventId: id,
        });

        if (!guestRegistration) {
            return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
        }

        if (guestRegistration.status !== 'approved') {
            return NextResponse.json(
                { error: 'Sadece onaylanmış kayıtlara yoklama maili gönderilebilir' },
                { status: 400 }
            );
        }

        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
        }

        // Generate attendance token if not exists
        if (!guestRegistration.attendanceToken) {
            guestRegistration.attendanceToken = crypto.randomBytes(24).toString('hex');
        }
        guestRegistration.attendanceEmailSentAt = new Date();
        await guestRegistration.save();

        // Build attendance link
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const attendanceLink = `${baseUrl}/events/${id}/guest-checkin?token=${guestRegistration.attendanceToken}`;

        const { sendEmail, wrapEmailHtml } = await import('@/app/lib/email');

        const emailHtml = wrapEmailHtml(`
            <p>Merhaba <strong>${guestRegistration.fullName}</strong>,</p>
            <p><strong>${event.title}</strong> etkinliğine katılımınızı onaylamak için aşağıdaki bağlantıyı kullanın:</p>
            <p style="text-align: center; margin: 24px 0;">
                <a href="${attendanceLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; font-weight: bold; border: 3px solid #000;">
                    Katılımı Onayla
                </a>
            </p>
            <p>Bu bağlantı etkinlik süresince geçerlidir.</p>
        `, 'Etkinlik Yoklama');

        try {
            await sendEmail({
                to: guestRegistration.email,
                subject: `Yoklama: ${event.title}`,
                html: emailHtml,
            });
        } catch (emailError) {
            console.error('Send attendance email error:', emailError);
            return NextResponse.json({
                error: 'Mail gönderilemedi. Email ayarlarını kontrol edin.'
            }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Yoklama maili gönderildi',
            guestRegistration,
        });
    } catch (error) {
        console.error('Send attendance error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

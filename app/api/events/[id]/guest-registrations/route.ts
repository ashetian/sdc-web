import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { GuestRegistration } from '@/app/lib/models/GuestRegistration';
import { Event } from '@/app/lib/models/Event';
import { verifyAuth } from '@/app/lib/auth';
import { verifyTurnstileToken } from '@/app/lib/turnstile';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/app/lib/rateLimit';

// GET - List guest registrations (admin only)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;

        const guestRegistrations = await GuestRegistration.find({ eventId: id })
            .sort({ createdAt: -1 });

        return NextResponse.json(guestRegistrations);
    } catch (error) {
        console.error('Guest registrations fetch error:', error);
        return NextResponse.json({ error: 'Kayıtlar getirilemedi' }, { status: 500 });
    }
}

// POST - Create guest registration (public, no auth required)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Rate limiting check
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(clientIP, 'guest-registration', RATE_LIMITS.SENSITIVE);

        if (rateLimit.limited) {
            const resetSeconds = Math.ceil(rateLimit.resetIn / 1000);
            return NextResponse.json(
                { error: `Çok fazla istek. ${resetSeconds} saniye sonra tekrar deneyin.` },
                { status: 429 }
            );
        }

        await connectDB();
        const { id } = await params;
        const body = await request.json();
        const { fullName, email, phone, paymentProofUrl, turnstileToken } = body;

        // Verify Turnstile CAPTCHA
        const isValidCaptcha = await verifyTurnstileToken(turnstileToken, clientIP);
        if (!isValidCaptcha) {
            return NextResponse.json(
                { error: 'CAPTCHA doğrulaması başarısız. Lütfen tekrar deneyin.' },
                { status: 400 }
            );
        }

        // Validate required fields
        if (!fullName || !email) {
            return NextResponse.json(
                { error: 'Ad soyad ve e-posta zorunludur' },
                { status: 400 }
            );
        }

        // Check event exists and allows guest registration
        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
        }

        if (!event.allowGuestRegistration) {
            return NextResponse.json(
                { error: 'Bu etkinlik misafir katılıma kapalı' },
                { status: 400 }
            );
        }

        if (!event.isOpen) {
            return NextResponse.json(
                { error: 'Bu etkinlik kayıtlara kapalı' },
                { status: 400 }
            );
        }

        if (event.isEnded) {
            return NextResponse.json(
                { error: 'Bu etkinlik sona ermiş' },
                { status: 400 }
            );
        }

        // Check for paid events
        if (event.isPaid && !paymentProofUrl) {
            return NextResponse.json(
                { error: 'Ücretli etkinlikler için ödeme dekontu zorunludur' },
                { status: 400 }
            );
        }

        // Check for duplicate registration
        const existingReg = await GuestRegistration.findOne({
            eventId: id,
            email: email.toLowerCase(),
        });

        if (existingReg) {
            return NextResponse.json(
                { error: 'Bu e-posta ile zaten kayıt yapılmış' },
                { status: 400 }
            );
        }

        // Create guest registration
        const guestRegistration = await GuestRegistration.create({
            eventId: id,
            fullName,
            email: email.toLowerCase(),
            phone,
            paymentProofUrl,
            status: 'pending',
        });

        // Send notification to admin
        try {
            const { createAdminNotification } = await import('@/app/lib/notifications');
            await createAdminNotification({
                type: 'admin_new_registration',
                title: 'Yeni misafir kayıt başvurusu',
                titleEn: 'New guest registration request',
                message: `"${event.title}" etkinliğine misafir başvurusu: ${fullName}`,
                messageEn: `Guest registration for "${event.titleEn || event.title}": ${fullName}`,
                link: `/admin/events/${id}/registrations`,
                relatedContentType: 'registration',
                relatedContentId: guestRegistration._id,
            });
        } catch (notifError) {
            console.error('Admin notification error:', notifError);
        }

        return NextResponse.json({
            message: 'Başvurunuz alındı. Admin onayı bekleniyor.',
            guestRegistration,
        }, { status: 201 });
    } catch (error) {
        console.error('Guest registration error:', error);
        return NextResponse.json({ error: 'Kayıt oluşturulamadı' }, { status: 500 });
    }
}

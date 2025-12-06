import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Registration } from '@/app/lib/models/Registration';
import { Event } from '@/app/lib/models/Event';
import { verifyAuth } from '@/app/lib/auth';

// GET - List registrations with member info (admin)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;

        const registrations = await Registration.find({ eventId: id })
            .populate('memberId', 'fullName studentNo email phone department nickname')
            .sort({ createdAt: -1 });

        return NextResponse.json(registrations);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Kayıtlar getirilemedi.' }, { status: 500 });
    }
}

// POST - Register for event (member only, no form needed)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Verify member is logged in
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Kayıt olmak için giriş yapmalısınız' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;

        // Check event exists and is open
        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
        }

        if (!event.isOpen) {
            return NextResponse.json({ error: 'Bu etkinlik kayıtlara kapalı' }, { status: 400 });
        }

        if (event.isEnded) {
            return NextResponse.json({ error: 'Bu etkinlik sona ermiş' }, { status: 400 });
        }

        // Check for existing registration
        const existingReg = await Registration.findOne({
            eventId: id,
            memberId: user.userId,
        });

        if (existingReg) {
            return NextResponse.json({ error: 'Bu etkinliğe zaten kayıtlısınız' }, { status: 400 });
        }

        // Create registration
        const registration = await Registration.create({
            eventId: id,
            memberId: user.userId,
        });

        // Send confirmation email
        try {
            const member = await import('@/app/lib/models/Member').then(m => m.default.findById(user.userId));
            const { sendEmail, wrapEmailHtml } = await import('@/app/lib/email');

            if (member && member.email) {
                const emailHtml = wrapEmailHtml(`
                    <p>Merhaba <strong>${member.nickname || member.fullName}</strong>,</p>
                    <p><strong>${event.title}</strong> etkinliğine kaydınız başarıyla alınmıştır.</p>
                    <p><strong>Tarih:</strong> ${new Date(event.startDate).toLocaleString('tr-TR')}</p>
                    <p><strong>Yer:</strong> ${event.location}</p>
                    <br>
                    <p>Etkinlikte görüşmek üzere!</p>
                `, 'Etkinlik Kaydı Onayı');

                await sendEmail({
                    to: member.email,
                    subject: `Kayıt Onayı: ${event.title}`,
                    html: emailHtml
                });
            }
        } catch (emailError) {
            console.error('Confirmation email failed:', emailError);
            // Don't block response
        }

        return NextResponse.json({
            message: 'Kayıt başarılı!',
            registration,
        }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Kayıt oluşturulamadı' }, { status: 500 });
    }
}

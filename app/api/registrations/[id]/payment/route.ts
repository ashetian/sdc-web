import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Registration } from '@/app/lib/models/Registration';
import { Event } from '@/app/lib/models/Event';
import { sendPaymentStatusEmail } from '@/app/lib/email/client';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const body = await request.json();
        const { status } = body;

        if (!['verified', 'rejected'].includes(status)) {
            return NextResponse.json(
                { error: 'Geçersiz durum. Sadece "verified" veya "rejected" olabilir.' },
                { status: 400 }
            );
        }

        const registration = await Registration.findById(params.id);
        if (!registration) {
            return NextResponse.json(
                { error: 'Kayıt bulunamadı.' },
                { status: 404 }
            );
        }

        // Update payment status
        registration.paymentStatus = status;
        registration.paymentVerifiedAt = new Date();
        registration.paymentVerifiedBy = 'admin'; // TODO: Add actual admin user info when auth is implemented

        await registration.save();

        // Send payment status email
        try {
            const event = await Event.findById(registration.eventId);
            if (event) {
                await sendPaymentStatusEmail({
                    name: registration.name,
                    email: registration.email,
                    eventTitle: event.title,
                    status: status as 'verified' | 'rejected',
                    eventDate: event.eventDate,
                });
            }
        } catch (emailError) {
            console.error('Failed to send payment status email:', emailError);
            // Don't fail the update if email fails
        }

        return NextResponse.json(registration);
    } catch (error) {
        console.error('Ödeme durumu güncellenirken hata:', error);
        return NextResponse.json(
            { error: 'Ödeme durumu güncellenemedi.' },
            { status: 500 }
        );
    }
}

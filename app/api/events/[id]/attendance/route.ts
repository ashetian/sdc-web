import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Event } from '@/app/lib/models/Event';
import { Registration } from '@/app/lib/models/Registration';
import { verifyAuth } from '@/app/lib/auth';
import crypto from 'crypto';

// POST /api/events/[id]/attendance - Generate QR code or check in
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const { action, rating, feedback } = await request.json();

        if (action === 'generate') {
            // Generate QR code - admin only
            const user = await verifyAuth(request);
            if (!user) {
                return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
            }

            const event = await Event.findById(id);
            if (!event) {
                return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
            }

            // Generate unique attendance code if not exists
            if (!event.attendanceCode) {
                event.attendanceCode = crypto.randomBytes(16).toString('hex');
                await event.save();
            }

            return NextResponse.json({
                attendanceCode: event.attendanceCode,
                qrUrl: `/events/${id}/checkin?code=${event.attendanceCode}`,
            });
        }

        if (action === 'checkin') {
            // Check in with QR - member only
            const user = await verifyAuth(request);
            if (!user) {
                return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
            }

            const event = await Event.findById(id);
            if (!event) {
                return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
            }

            if (event.isEnded) {
                return NextResponse.json({ error: 'Bu etkinlik sona ermiş' }, { status: 400 });
            }

            // Find or create registration
            let registration = await Registration.findOne({
                eventId: id,
                memberId: user.userId,
            });

            if (registration) {
                // Update existing registration with attendance
                if (registration.attendedAt) {
                    return NextResponse.json({ error: 'Zaten yoklama yaptınız' }, { status: 400 });
                }
                registration.attendedAt = new Date();
                registration.rating = rating;
                registration.feedback = feedback;
                await registration.save();
            } else {
                // Create new registration with attendance
                registration = await Registration.create({
                    eventId: id,
                    memberId: user.userId,
                    attendedAt: new Date(),
                    rating,
                    feedback,
                });
            }

            return NextResponse.json({
                message: 'Yoklama başarılı!',
                registration,
            });
        }

        return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
    } catch (error) {
        console.error('Attendance error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// GET /api/events/[id]/attendance - Get attendance list
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        // Admin only
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        const registrations = await Registration.find({ eventId: id })
            .populate('memberId', 'fullName studentNo email phone department nickname')
            .sort({ createdAt: -1 });

        // Calculate stats
        const totalRegistered = registrations.length;
        const totalAttended = registrations.filter(r => r.attendedAt).length;
        const ratings = registrations.filter(r => r.rating).map(r => r.rating as number);
        const averageRating = ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;

        return NextResponse.json({
            registrations,
            stats: {
                totalRegistered,
                totalAttended,
                averageRating: Math.round(averageRating * 10) / 10,
            },
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

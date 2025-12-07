import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import CalendarMarker from '@/app/lib/models/CalendarMarker';
import { verifyAuth } from '@/app/lib/auth';
import AdminAccess from '@/app/lib/models/AdminAccess';
import TeamMember from '@/app/lib/models/TeamMember';
import { z } from 'zod';

// Verify admin access (matches check-auth logic)
async function verifyAdmin() {
    const auth = await verifyAuth();
    if (!auth?.userId) return null;

    await connectDB();

    // Check TeamMember role first (president/VP are auto-admins)
    const teamMember = await TeamMember.findOne({ memberId: auth.userId, isActive: true });
    if (teamMember && ['president', 'vice_president'].includes(teamMember.role)) {
        return { userId: auth.userId };
    }

    // Then check AdminAccess table
    const access = await AdminAccess.findOne({ memberId: auth.userId });
    return access ? { userId: auth.userId } : null;
}

const markerSchema = z.object({
    title: z.string().min(1).max(100),
    titleEn: z.string().max(100).optional(),
    type: z.enum(['holiday', 'exam_week', 'registration_period', 'semester_break', 'important']),
    startDate: z.string(),
    endDate: z.string(),
    color: z.string().optional(),
    isActive: z.boolean().optional(),
});

// GET: List all calendar markers (admin only)
export async function GET() {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const markers = await CalendarMarker.find().sort({ startDate: -1 }).lean();

        return NextResponse.json(markers);
    } catch (error) {
        console.error('Error fetching calendar markers:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Create new calendar marker
export async function POST(request: NextRequest) {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const body = await request.json();

        const parsed = markerSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const marker = await CalendarMarker.create({
            ...parsed.data,
            startDate: new Date(parsed.data.startDate),
            endDate: new Date(parsed.data.endDate),
        });

        return NextResponse.json(marker, { status: 201 });
    } catch (error) {
        console.error('Error creating calendar marker:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Delete calendar marker
export async function DELETE(request: NextRequest) {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await connectDB();
        await CalendarMarker.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting calendar marker:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

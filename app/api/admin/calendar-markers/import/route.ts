import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import CalendarMarker from '@/app/lib/models/CalendarMarker';
import { verifyAuth } from '@/app/lib/auth';
import AdminAccess from '@/app/lib/models/AdminAccess';
import TeamMember from '@/app/lib/models/TeamMember';

// Nager.Date API for Turkish public holidays
const NAGER_API_URL = 'https://date.nager.at/api/v3/PublicHolidays';

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

interface NagerHoliday {
    date: string;
    localName: string;
    name: string;
    countryCode: string;
    types: string[];
}

// GET: Fetch holidays from Nager.Date API for a specific year
export async function GET(request: NextRequest) {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year') || new Date().getFullYear().toString();

        // Fetch from Nager.Date API
        const response = await fetch(`${NAGER_API_URL}/${year}/TR`, {
            next: { revalidate: 86400 } // Cache for 24 hours
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch holidays from external API' }, { status: 500 });
        }

        const holidays: NagerHoliday[] = await response.json();

        // Transform to our format
        const formattedHolidays = holidays.map(h => ({
            title: h.localName,
            titleEn: h.name,
            type: 'holiday',
            startDate: h.date,
            endDate: h.date,
        }));

        return NextResponse.json({
            year,
            holidays: formattedHolidays,
            source: 'Nager.Date API',
        });
    } catch (error) {
        console.error('Error fetching holidays:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Import holidays from API for a specific year
export async function POST(request: NextRequest) {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { year } = await request.json();

        if (!year || year < 2020 || year > 2030) {
            return NextResponse.json({ error: 'Invalid year (must be between 2020-2030)' }, { status: 400 });
        }

        // Fetch from Nager.Date API
        const response = await fetch(`${NAGER_API_URL}/${year}/TR`);

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch holidays from external API' }, { status: 500 });
        }

        const holidays: NagerHoliday[] = await response.json();

        await connectDB();

        let addedCount = 0;
        let skippedCount = 0;

        for (const holiday of holidays) {
            // Check if already exists (same title and date)
            const existing = await CalendarMarker.findOne({
                title: holiday.localName,
                startDate: new Date(holiday.date),
            });

            if (existing) {
                skippedCount++;
                continue;
            }

            await CalendarMarker.create({
                title: holiday.localName,
                titleEn: holiday.name,
                type: 'holiday',
                startDate: new Date(holiday.date),
                endDate: new Date(holiday.date),
                isActive: true,
            });
            addedCount++;
        }

        return NextResponse.json({
            success: true,
            year,
            added: addedCount,
            skipped: skippedCount,
            total: holidays.length,
        });
    } catch (error) {
        console.error('Error importing holidays:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

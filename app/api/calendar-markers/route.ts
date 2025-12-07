import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import CalendarMarker from '@/app/lib/models/CalendarMarker';

// GET: Fetch calendar markers for a date range
export async function GET(request: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
        const month = searchParams.get('month'); // Optional: specific month (0-11)

        let startDate: Date;
        let endDate: Date;

        if (month !== null) {
            // Get markers for specific month
            const monthNum = parseInt(month);
            startDate = new Date(year, monthNum, 1);
            endDate = new Date(year, monthNum + 1, 0);
        } else {
            // Get markers for entire year
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31);
        }

        const markers = await CalendarMarker.find({
            isActive: true,
            $or: [
                // Marker starts within range
                { startDate: { $gte: startDate, $lte: endDate } },
                // Marker ends within range
                { endDate: { $gte: startDate, $lte: endDate } },
                // Marker spans the entire range
                { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
            ],
        }).sort({ startDate: 1 }).lean();

        return NextResponse.json(markers);
    } catch (error) {
        console.error('Error fetching calendar markers:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

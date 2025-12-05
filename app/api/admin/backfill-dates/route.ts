import { NextResponse } from 'next/server';
import { Announcement } from '@/app/lib/models/Announcement';
import { translateDate } from '@/app/lib/translate';
import connectDB from '@/app/lib/db';

// Quick endpoint to add dateEn to all announcements (no API needed)
export async function GET() {
    try {
        await connectDB();

        const announcements = await Announcement.find({});
        let updated = 0;

        for (const doc of announcements) {
            // Also update if dateEn is empty string
            if (doc.date && (!doc.dateEn || doc.dateEn.trim() === '')) {
                doc.dateEn = translateDate(doc.date);
                await doc.save();
                updated++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Updated ${updated} announcements with dateEn`
        });
    } catch (error) {
        console.error('Date backfill error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

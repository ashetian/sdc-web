import { NextResponse } from 'next/server';
import { Announcement } from '@/app/lib/models/Announcement';
import connectDB from '@/app/lib/db';

// Archive announcements older than 1 year
export async function GET() {
    try {
        await connectDB();

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        // Find announcements with createdAt older than 1 year and not already archived
        const result = await Announcement.updateMany(
            {
                createdAt: { $lt: oneYearAgo },
                isArchived: { $ne: true }
            },
            {
                $set: { isArchived: true }
            }
        );

        return NextResponse.json({
            success: true,
            message: `Archived ${result.modifiedCount} announcements older than 1 year`
        });
    } catch (error) {
        console.error('Archive error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

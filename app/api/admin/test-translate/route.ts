import { NextResponse } from 'next/server';
import { Announcement } from '@/app/lib/models/Announcement';
import { translateContent } from '@/app/lib/translate';
import connectDB from '@/app/lib/db';

// Test endpoint - translate the most recent announcement
export async function GET() {
    try {
        await connectDB();

        // Get the most recent announcement
        const announcement = await Announcement.findOne({}).sort({ createdAt: -1 });

        if (!announcement) {
            return NextResponse.json({ error: 'No announcement found' }, { status: 404 });
        }

        console.log(`Translating: ${announcement.title}`);

        // Translate fields
        const titleResult = await translateContent(announcement.title, 'tr');
        const descResult = await translateContent(announcement.description, 'tr');
        const contentResult = await translateContent(announcement.content, 'tr');

        // Update the announcement
        announcement.titleEn = titleResult.en;
        announcement.descriptionEn = descResult.en;
        announcement.contentEn = contentResult.en;

        await announcement.save();

        // Reload to verify
        const reloaded = await Announcement.findById(announcement._id);

        return NextResponse.json({
            success: true,
            announcement: {
                slug: reloaded?.slug,
                title: reloaded?.title,
                titleEn: reloaded?.titleEn,
                descriptionEn: reloaded?.descriptionEn?.substring(0, 100) + '...',
                contentEn: reloaded?.contentEn?.substring(0, 100) + '...'
            }
        });
    } catch (error) {
        console.error('Test translate error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

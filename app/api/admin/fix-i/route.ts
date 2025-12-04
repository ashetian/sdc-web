import { NextResponse } from 'next/server';
import { Announcement } from '@/app/lib/models/Announcement';
import connectDB from '@/app/lib/db';

export async function GET() {
    try {
        await connectDB();

        // Get all announcements and check raw values
        const docs = await Announcement.find({}).lean();
        let fixed = 0;
        const fixedSlugs: string[] = [];

        for (const doc of docs) {
            const updates: Record<string, string> = {};

            // Check each field
            if (typeof doc.titleEn === 'string' && /[İı]/.test(doc.titleEn)) {
                updates.titleEn = doc.titleEn.replace(/İ/g, 'I').replace(/ı/g, 'i');
            }
            if (typeof doc.descriptionEn === 'string' && /[İı]/.test(doc.descriptionEn)) {
                updates.descriptionEn = doc.descriptionEn.replace(/İ/g, 'I').replace(/ı/g, 'i');
            }
            if (typeof doc.contentEn === 'string' && /[İı]/.test(doc.contentEn)) {
                updates.contentEn = doc.contentEn.replace(/İ/g, 'I').replace(/ı/g, 'i');
            }
            if (typeof doc.galleryDescriptionEn === 'string' && /[İı]/.test(doc.galleryDescriptionEn)) {
                updates.galleryDescriptionEn = doc.galleryDescriptionEn.replace(/İ/g, 'I').replace(/ı/g, 'i');
            }

            if (Object.keys(updates).length > 0) {
                await Announcement.findByIdAndUpdate(doc._id, { $set: updates });
                fixed++;
                fixedSlugs.push(doc.slug);
            }
        }

        return NextResponse.json({
            success: true,
            fixed,
            slugs: fixedSlugs
        });
    } catch (error) {
        console.error('Fix error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

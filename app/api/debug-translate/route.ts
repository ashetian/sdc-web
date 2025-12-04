import { NextResponse } from 'next/server';
import { translateFields } from '@/app/lib/translate';
import connectDB from '@/app/lib/db';
import { Announcement } from '@/app/lib/models/Announcement';

export async function GET() {
    try {
        // Test translation
        const testTranslations = await translateFields({
            title: 'Test Başlık',
            description: 'Test açıklama metni'
        }, 'tr');

        // Get one announcement and update it
        await connectDB();
        const announcement = await Announcement.findOne({});

        let updateResult = null;
        if (announcement) {
            announcement.titleEn = testTranslations.title?.en || 'Translation failed';
            announcement.descriptionEn = testTranslations.description?.en || 'Translation failed';
            announcement.contentEn = 'Test content translation';
            await announcement.save();

            // Reload to verify
            const reloaded = await Announcement.findById(announcement._id);
            updateResult = {
                original: {
                    title: announcement.title,
                    titleEn: announcement.titleEn
                },
                reloaded: {
                    title: reloaded?.title,
                    titleEn: reloaded?.titleEn,
                    descriptionEn: reloaded?.descriptionEn,
                    contentEn: reloaded?.contentEn
                }
            };
        }

        return NextResponse.json({
            translations: testTranslations,
            updateResult,
            deeplKeySet: !!process.env.DEEPL_API_KEY
        });
    } catch (error) {
        console.error('Debug error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

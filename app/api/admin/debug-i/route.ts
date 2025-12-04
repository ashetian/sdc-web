import { NextResponse } from 'next/server';
import { Announcement } from '@/app/lib/models/Announcement';
import connectDB from '@/app/lib/db';

export async function GET() {
    try {
        await connectDB();

        // Get first announcement with titleEn
        const doc = await Announcement.findOne({ titleEn: { $exists: true, $ne: '' } }).lean();

        if (!doc || !doc.titleEn) {
            return NextResponse.json({ error: 'No announcement found' });
        }

        // Check character codes
        const charCodes = [];
        for (let i = 0; i < Math.min(doc.titleEn.length, 50); i++) {
            const char = doc.titleEn[i];
            charCodes.push({
                char,
                code: char.charCodeAt(0),
                isI: char === 'İ' || char.charCodeAt(0) === 304
            });
        }

        // Try to find İ using charCode
        const hasI = doc.titleEn.split('').some((c: string) => c.charCodeAt(0) === 304);
        const has_i = doc.titleEn.split('').some((c: string) => c.charCodeAt(0) === 305);

        return NextResponse.json({
            titleEn: doc.titleEn.substring(0, 100),
            hasİ: doc.titleEn.includes('İ'),
            hasI_byCode: hasI,
            has_ı_byCode: has_i,
            charCodes: charCodes.filter(c => c.code > 127)
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { translateContent, translateFields } from '@/app/lib/translate';

// POST - Translate content
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { text, fields, sourceLanguage = 'tr' } = data;

        // Single text translation
        if (text) {
            const result = await translateContent(text, sourceLanguage);
            return NextResponse.json(result);
        }

        // Multiple fields translation
        if (fields && typeof fields === 'object') {
            const results = await translateFields(fields, sourceLanguage);
            return NextResponse.json(results);
        }

        return NextResponse.json({ error: 'No text or fields provided' }, { status: 400 });
    } catch (error) {
        console.error('Translation API error:', error);
        return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
    }
}

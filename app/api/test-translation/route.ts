import { NextResponse } from 'next/server';
import { translateContent } from '@/app/lib/translate';

export async function GET() {
    try {
        if (!process.env.DEEPL_API_KEY) {
            return NextResponse.json({ error: 'DEEPL_API_KEY is missing' }, { status: 500 });
        }

        const result = await translateContent('Yazılım Geliştirme Kulübü harika bir topluluktur.', 'tr');

        return NextResponse.json({
            success: true,
            original: 'Yazılım Geliştirme Kulübü harika bir topluluktur.',
            translated: result.en,
            apiKeyPresent: true,
            apiKeyType: process.env.DEEPL_API_KEY.endsWith(':fx') ? 'Free' : 'Pro'
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

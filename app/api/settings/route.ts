import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Setting } from '@/app/lib/models/Setting';

export async function GET() {
    try {
        await connectDB();
        const settings = await Setting.find({});
        // Convert array to object for easier consumption { key: value }
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingsMap);
    } catch (error) {
        console.error('Ayarlar getirilirken hata:', error);
        return NextResponse.json({ error: 'Ayarlar yüklenemedi.' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const body = await request.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json({ error: 'Key ve value zorunludur.' }, { status: 400 });
        }

        const setting = await Setting.findOneAndUpdate(
            { key },
            { value },
            { upsert: true, new: true }
        );

        return NextResponse.json(setting);
    } catch (error) {
        console.error('Ayar güncellenirken hata:', error);
        return NextResponse.json({ error: 'Ayar güncellenemedi.' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { clearEmailSettingsCache } from '@/app/lib/email';

import { JWT_SECRET } from '@/app/lib/auth';

// Verify admin access
async function isAdmin() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;
        if (!token) return false;

        await jwtVerify(token, JWT_SECRET);
        return true;
    } catch {
        return false;
    }
}

export async function POST() {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        clearEmailSettingsCache();
        return NextResponse.json({ success: true, message: 'Cache cleared' });
    } catch (error) {
        console.error('Cache clear error:', error);
        return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 });
    }
}

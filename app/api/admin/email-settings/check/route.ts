import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

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

export async function GET() {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Gmail env variables are configured
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    return NextResponse.json({
        gmailConfigured: !!(gmailUser && gmailAppPassword),
        gmailUser: gmailUser ? gmailUser.replace(/(.{3})(.*)(@.*)/, '$1***$3') : null, // Masked
    });
}

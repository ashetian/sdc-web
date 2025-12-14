import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Centralized JWT_SECRET - REQUIRED in production
const jwtSecretString = process.env.JWT_SECRET;

if (!jwtSecretString && typeof window === 'undefined') {
    if (process.env.NODE_ENV === 'production') {
        throw new Error(
            '🔴 CRITICAL: JWT_SECRET environment variable is required in production! ' +
            'Set it in your environment variables before deploying.'
        );
    }
    console.warn(
        '⚠️ JWT_SECRET not set. Using INSECURE dev fallback. ' +
        'DO NOT deploy to production without setting JWT_SECRET!'
    );
}

// In production, this will never use the fallback due to the throw above
export const JWT_SECRET = new TextEncoder().encode(
    jwtSecretString || 'dev-only-fallback-NEVER-USE-IN-PRODUCTION'
);

export async function verifyAuth(req?: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) return null;

        const { payload } = await jwtVerify(token, JWT_SECRET);

        return {
            userId: payload.memberId as string,
            studentNo: payload.studentNo as string,
            nickname: payload.nickname as string,
        };
    } catch (error) {
        return null;
    }
}

import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Centralized JWT_SECRET - warns if missing but allows build
const jwtSecretString = process.env.JWT_SECRET;
if (!jwtSecretString && typeof window === 'undefined') {
    console.warn('⚠️ JWT_SECRET environment variable is not set. Using dev fallback.');
}

export const JWT_SECRET = new TextEncoder().encode(jwtSecretString || 'dev-only-secret-do-not-use-in-production');

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

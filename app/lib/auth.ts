import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

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

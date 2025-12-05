import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Member from '@/app/lib/models/Member';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

// POST - Login with student number and password
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { studentNo, password } = await request.json();

        if (!studentNo || !password) {
            return NextResponse.json({ error: 'Öğrenci numarası ve şifre gerekli' }, { status: 400 });
        }

        // Find member
        const member = await Member.findOne({
            studentNo: String(studentNo).trim(),
            isActive: true
        });

        if (!member) {
            return NextResponse.json({ error: 'Geçersiz öğrenci numarası veya şifre' }, { status: 401 });
        }

        if (!member.isRegistered || !member.passwordHash) {
            return NextResponse.json({
                error: 'Hesabınız henüz oluşturulmamış. Önce kayıt olun.',
                notRegistered: true
            }, { status: 401 });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, member.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: 'Geçersiz öğrenci numarası veya şifre' }, { status: 401 });
        }

        // Update last login
        await Member.findByIdAndUpdate(member._id, { lastLogin: new Date() });

        // Create JWT token
        const token = await new SignJWT({
            memberId: member._id.toString(),
            studentNo: member.studentNo,
            nickname: member.nickname,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(JWT_SECRET);

        // Set HTTP-only cookie
        const cookieStore = await cookies();
        cookieStore.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return NextResponse.json({
            message: 'Giriş başarılı',
            user: {
                studentNo: member.studentNo,
                nickname: member.nickname,
                fullName: member.fullName,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

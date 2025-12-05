import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Member from '@/app/lib/models/Member';
import PasswordToken from '@/app/lib/models/PasswordToken';
import bcrypt from 'bcryptjs';

// POST - Set password from email token
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { token, password, nickname } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Token ve şifre gerekli' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Şifre en az 6 karakter olmalı' }, { status: 400 });
        }

        // Find valid token
        const passwordToken = await PasswordToken.findOne({
            token,
            expiresAt: { $gt: new Date() },
            usedAt: { $exists: false },
        });

        if (!passwordToken) {
            return NextResponse.json({
                error: 'Geçersiz veya süresi dolmuş link. Lütfen tekrar deneyin.'
            }, { status: 400 });
        }

        // Find member
        const member = await Member.findById(passwordToken.memberId);
        if (!member) {
            return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Update member
        const updateData: Record<string, unknown> = {
            passwordHash,
            isRegistered: true,
            lastLogin: new Date(),
        };

        // Set nickname if provided (required for first signup)
        if (passwordToken.type === 'signup') {
            if (!nickname || nickname.trim().length < 2) {
                return NextResponse.json({ error: 'Nickname en az 2 karakter olmalı' }, { status: 400 });
            }
            updateData.nickname = nickname.trim();
        }

        await Member.findByIdAndUpdate(member._id, updateData);

        // Mark token as used
        await PasswordToken.findByIdAndUpdate(passwordToken._id, { usedAt: new Date() });

        return NextResponse.json({
            message: passwordToken.type === 'signup' ? 'Hesabınız oluşturuldu!' : 'Şifreniz güncellendi!',
            isSignup: passwordToken.type === 'signup',
        });
    } catch (error) {
        console.error('Set password error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// GET - Validate token and get member info
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Token gerekli' }, { status: 400 });
        }

        const passwordToken = await PasswordToken.findOne({
            token,
            expiresAt: { $gt: new Date() },
            usedAt: { $exists: false },
        });

        if (!passwordToken) {
            return NextResponse.json({
                valid: false,
                error: 'Geçersiz veya süresi dolmuş link'
            }, { status: 400 });
        }

        const member = await Member.findById(passwordToken.memberId);
        if (!member) {
            return NextResponse.json({ valid: false, error: 'Üye bulunamadı' }, { status: 404 });
        }

        return NextResponse.json({
            valid: true,
            type: passwordToken.type,
            fullName: member.fullName,
            requiresNickname: passwordToken.type === 'signup',
        });
    } catch (error) {
        console.error('Validate token error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

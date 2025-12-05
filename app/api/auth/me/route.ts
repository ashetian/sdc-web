import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Member from '@/app/lib/models/Member';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

// GET - Get current user info
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const memberId = payload.memberId as string;

        await connectDB();
        const member = await Member.findById(memberId).select('-passwordHash');

        if (!member || !member.isRegistered) {
            const response = NextResponse.json({ error: 'Oturum geçersiz veya üyelik sıfırlandı' }, { status: 401 });
            response.cookies.delete('auth-token');
            return response;
        }

        return NextResponse.json({
            user: {
                id: member._id,
                studentNo: member.studentNo,
                fullName: member.fullName,
                nickname: member.nickname,
                avatar: member.avatar,
                email: member.email,
                phone: member.phone,
                department: member.department,
                profileVisibility: member.profileVisibility,
                lastLogin: member.lastLogin,
            },
        });
    } catch (error) {
        console.error('Get me error:', error);
        return NextResponse.json({ error: 'Oturum geçersiz' }, { status: 401 });
    }
}

// PUT - Update current user profile
export async function PUT(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const memberId = payload.memberId as string;

        const body = await request.json();
        const { nickname, avatar, profileVisibility } = body;

        await connectDB();

        const updateData: Record<string, unknown> = {};

        if (nickname !== undefined) {
            if (nickname.trim().length < 2) {
                return NextResponse.json({ error: 'Nickname en az 2 karakter olmalı' }, { status: 400 });
            }
            updateData.nickname = nickname.trim();
        }

        if (avatar !== undefined) {
            // Avatar can be a URL or empty string to remove
            updateData.avatar = avatar.trim();
        }

        if (profileVisibility !== undefined) {
            updateData.profileVisibility = {
                showEmail: Boolean(profileVisibility.showEmail),
                showPhone: Boolean(profileVisibility.showPhone),
                showDepartment: Boolean(profileVisibility.showDepartment),
                showFullName: Boolean(profileVisibility.showFullName),
            };
        }

        const member = await Member.findByIdAndUpdate(
            memberId,
            updateData,
            { new: true }
        ).select('-passwordHash');

        if (!member) {
            return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Profil güncellendi',
            user: {
                id: member._id,
                studentNo: member.studentNo,
                fullName: member.fullName,
                nickname: member.nickname,
                avatar: member.avatar,
                profileVisibility: member.profileVisibility,
            },
        });
    } catch (error) {
        console.error('Update me error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

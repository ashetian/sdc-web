import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Member from '@/app/lib/models/Member';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

import { JWT_SECRET } from '@/app/lib/auth';

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
                emailConsent: member.emailConsent,
                bio: member.bio,
                socialLinks: member.socialLinks,
                nativeLanguage: member.nativeLanguage,
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
        const { nickname, avatar, profileVisibility, emailConsent, nativeLanguage } = body;

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

        if (emailConsent !== undefined) {
            updateData.emailConsent = Boolean(emailConsent);
        }

        if (nativeLanguage !== undefined && ['tr', 'en'].includes(nativeLanguage)) {
            updateData.nativeLanguage = nativeLanguage;
        }

        if (profileVisibility !== undefined) {
            updateData.profileVisibility = {
                showEmail: Boolean(profileVisibility.showEmail),
                showPhone: Boolean(profileVisibility.showPhone),
                showDepartment: Boolean(profileVisibility.showDepartment),
                showFullName: Boolean(profileVisibility.showFullName),
            };
        }

        const { bio, socialLinks } = body;

        if (bio !== undefined) {
            updateData.bio = bio.trim().slice(0, 500);
        }

        if (socialLinks !== undefined) {
            updateData.socialLinks = {
                github: socialLinks.github?.trim(),
                linkedin: socialLinks.linkedin?.trim(),
                twitter: socialLinks.twitter?.trim(),
                website: socialLinks.website?.trim(),
                instagram: socialLinks.instagram?.trim(),
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

        // Also update TeamMember photo if exists
        try {
            const { default: TeamMember } = await import('@/app/lib/models/TeamMember');
            if (updateData.avatar !== undefined) {
                await TeamMember.updateMany(
                    { memberId: member._id },
                    { $set: { photo: updateData.avatar } }
                );
            }
        } catch (tmError) {
            console.error('Error syncing team member photo:', tmError);
            // Don't fail the request if this sync fails
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
                emailConsent: member.emailConsent,
            },
        });
    } catch (error) {
        console.error('Update me error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

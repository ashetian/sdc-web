import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Member from '@/app/lib/models/Member';
import { verifyAuth } from '@/app/lib/auth';

// GET - Get public profile
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await context.params;

        // We can optionally verify auth to show more info if viewer is admin/same user, 
        // but requirements say "public profile modal".
        // Let's stick to safe public data based on visibility settings.

        const member = await Member.findById(id).select('fullName nickname avatar bio socialLinks profileVisibility department studentNo email phone');

        if (!member) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
        }

        const visibility = member.profileVisibility || {
            showEmail: false,
            showPhone: false,
            showDepartment: true,
            showFullName: false
        };

        // Construct safe response
        const publicProfile = {
            _id: member._id,
            nickname: member.nickname || 'Kullanıcı',
            avatar: member.avatar,
            bio: member.bio,
            socialLinks: member.socialLinks,
            department: visibility.showDepartment ? member.department : undefined,
            fullName: visibility.showFullName ? member.fullName : undefined,
            email: visibility.showEmail ? member.email : undefined,
            phone: visibility.showPhone ? member.phone : undefined,
            studentNo: undefined, // Never show studentNo publicly ideally, unless requested? Keeping hidden for now.
        };

        return NextResponse.json(publicProfile);
    } catch (error) {
        console.error('Error fetching public profile:', error);
        return NextResponse.json({ error: 'Profil alınamadı' }, { status: 500 });
    }
}

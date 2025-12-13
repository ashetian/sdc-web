import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import TeamMember from '@/app/lib/models/TeamMember';
import { verifyAuth } from '@/app/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

// GET - List team members
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const showInTeam = searchParams.get('showInTeam');
        const departmentId = searchParams.get('departmentId');
        const role = searchParams.get('role');

        // Build filter
        const filter: Record<string, unknown> = { isActive: true };

        if (showInTeam === 'true') {
            filter.showInTeam = true;
        }

        if (departmentId) {
            filter.departmentId = departmentId;
        }

        if (role) {
            // Support comma-separated roles
            if (role.includes(',')) {
                filter.role = { $in: role.split(',') };
            } else {
                filter.role = role;
            }
        }

        let members = await TeamMember.find(filter)
            .populate('departmentId', 'name slug color');

        // Custom sort by role hierarchy + order
        const roleOrder: Record<string, number> = {
            president: 1,
            vice_president: 2,
            head: 3,
            member: 4,
            featured: 5
        };

        members.sort((a, b) => {
            const roleA = roleOrder[a.role as string] || 99;
            const roleB = roleOrder[b.role as string] || 99;
            if (roleA !== roleB) return roleA - roleB;
            return (a.order || 0) - (b.order || 0);
        });

        return NextResponse.json(members);
    } catch (error) {
        console.error('Error fetching team members:', error);
        return NextResponse.json({ error: 'Ekip üyeleri alınamadı' }, { status: 500 });
    }
}

// POST - Create new team member
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Auth check
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        const data = await request.json();

        // Auto-translate if DeepL API key is available
        let memberData = { ...data };

        if (process.env.DEEPL_API_KEY && (!data.titleEn || !data.descriptionEn)) {
            try {
                const { translateContent } = await import('@/app/lib/translate');

                if (!data.titleEn && data.title) {
                    const titleResult = await translateContent(data.title, 'tr');
                    memberData.titleEn = titleResult.en || '';
                }

                if (!data.descriptionEn && data.description) {
                    const descResult = await translateContent(data.description, 'tr');
                    memberData.descriptionEn = descResult.en || '';
                }

                console.log('TeamMember auto-translation successful');
            } catch (translateError) {
                console.error('TeamMember translation failed:', translateError);
            }
        }

        const member = await TeamMember.create(memberData);

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.CREATE_TEAM_MEMBER,
            targetType: 'TeamMember',
            targetId: member._id.toString(),
            targetName: member.name,
        });

        return NextResponse.json(member, { status: 201 });
    } catch (error) {
        console.error('Error creating team member:', error);
        return NextResponse.json({ error: 'Ekip üyesi oluşturulamadı' }, { status: 500 });
    }
}

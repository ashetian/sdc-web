import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import TeamMember from '@/app/lib/models/TeamMember';
import { verifyAuth } from '@/app/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

// GET - List team members
import { getTeamMembers } from '@/app/lib/services/teamService';

// GET - List team members
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const showInTeam = searchParams.get('showInTeam');
        const departmentId = searchParams.get('departmentId');
        const role = searchParams.get('role');

        const filter: any = { activeOnly: true };
        if (showInTeam === 'true') filter.showInTeam = true;
        if (departmentId) filter.departmentId = departmentId;
        if (role) filter.role = role;

        const members = await getTeamMembers(filter);

        return NextResponse.json(members, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
            }
        });
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

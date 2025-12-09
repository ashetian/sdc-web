import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import TeamMember from '@/app/lib/models/TeamMember';
import { deleteFromCloudinary } from '@/app/lib/cloudinaryHelper';
import { verifyAuth } from '@/app/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

// GET - Get single team member
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const member = await TeamMember.findById(id).populate('departmentId', 'name slug color');

        if (!member) {
            return NextResponse.json({ error: 'Ekip üyesi bulunamadı' }, { status: 404 });
        }

        return NextResponse.json(member);
    } catch (error) {
        console.error('Error fetching team member:', error);
        return NextResponse.json({ error: 'Ekip üyesi alınamadı' }, { status: 500 });
    }
}

// PUT - Update team member
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        // Auth check
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        const data = await request.json();

        // Get old member to check if photo changed
        const oldMember = await TeamMember.findById(id);
        if (oldMember && oldMember.photo && data.photo && oldMember.photo !== data.photo) {
            await deleteFromCloudinary(oldMember.photo);
        }

        // Auto-translate if DeepL API key is available
        let updateData = { ...data };

        if (process.env.DEEPL_API_KEY && (!data.titleEn || !data.descriptionEn)) {
            try {
                const { translateContent } = await import('@/app/lib/translate');

                if (!data.titleEn && data.title) {
                    const titleResult = await translateContent(data.title, 'tr');
                    updateData.titleEn = titleResult.en || '';
                }

                if (!data.descriptionEn && data.description) {
                    const descResult = await translateContent(data.description, 'tr');
                    updateData.descriptionEn = descResult.en || '';
                }

                console.log('TeamMember update auto-translation successful');
            } catch (translateError) {
                console.error('TeamMember update translation failed:', translateError);
            }
        }

        const member = await TeamMember.findByIdAndUpdate(id, updateData, { new: true })
            .populate('departmentId', 'name slug color');

        if (!member) {
            return NextResponse.json({ error: 'Ekip üyesi bulunamadı' }, { status: 404 });
        }

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.UPDATE_TEAM_MEMBER,
            targetType: 'TeamMember',
            targetId: id,
            targetName: member.name,
        });

        return NextResponse.json(member);
    } catch (error) {
        console.error('Error updating team member:', error);
        return NextResponse.json({ error: 'Ekip üyesi güncellenemedi' }, { status: 500 });
    }
}

// DELETE - Delete team member
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        // Auth check
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        const member = await TeamMember.findById(id);
        if (!member) {
            return NextResponse.json({ error: 'Ekip üyesi bulunamadı' }, { status: 404 });
        }

        const memberName = member.name;

        if (member.photo) {
            await deleteFromCloudinary(member.photo);
        }

        await TeamMember.findByIdAndDelete(id);

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.DELETE_TEAM_MEMBER,
            targetType: 'TeamMember',
            targetId: id,
            targetName: memberName,
        });

        return NextResponse.json({ message: 'Ekip üyesi silindi' });
    } catch (error) {
        console.error('Error deleting team member:', error);
        return NextResponse.json({ error: 'Ekip üyesi silinemedi' }, { status: 500 });
    }
}

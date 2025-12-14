import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Department from '@/app/lib/models/Department';
import { verifyAuth } from '@/app/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

// GET - Get single department
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const department = await Department.findById(id).populate('leadId', 'fullName email studentNo avatar bio socialLinks');

        if (!department) {
            return NextResponse.json({ error: 'Departman bulunamadı' }, { status: 404 });
        }

        return NextResponse.json(department);
    } catch (error) {
        console.error('Error fetching department:', error);
        return NextResponse.json({ error: 'Departman alınamadı' }, { status: 500 });
    }
}

// PUT - Update department
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

        // If name changed, regenerate slug
        if (data.name) {
            data.slug = data.name
                .toLowerCase()
                .replace(/ı/g, 'i')
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ş/g, 's')
                .replace(/ö/g, 'o')
                .replace(/ç/g, 'c')
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
        }

        // Auto-translate if DeepL API key is available
        if (process.env.DEEPL_API_KEY && (data.name || data.description)) {
            try {
                if ((data.name && !data.nameEn) || (data.description && !data.descriptionEn)) {
                    const { translateFields } = await import('@/app/lib/translate');

                    const fieldsToTranslate: Record<string, string> = {};
                    if (data.name) fieldsToTranslate.name = data.name;
                    if (data.description) fieldsToTranslate.description = data.description;

                    const translations = await translateFields(fieldsToTranslate, 'tr');

                    if (data.name && !data.nameEn) data.nameEn = translations.name?.en;
                    if (data.description && !data.descriptionEn) data.descriptionEn = translations.description?.en;
                }
            } catch (translateError) {
                console.error('Auto-translation failed:', translateError);
            }
        }

        const department = await Department.findByIdAndUpdate(id, data, { new: true });

        if (!department) {
            return NextResponse.json({ error: 'Departman bulunamadı' }, { status: 404 });
        }

        // Sync "Head" role in TeamMember collection if leadId changed (and is valid)
        if (data.leadId && data.leadId !== '') {
            try {
                const TeamMember = (await import('@/app/lib/models/TeamMember')).default;
                const Member = (await import('@/app/lib/models/Member')).default;

                // 1. Demote any existing "head" in this department to "member"
                await TeamMember.updateMany(
                    { departmentId: id, role: 'head' },
                    { $set: { role: 'member' } }
                );

                // 2. Find if the new lead is already a team member in this department
                const existingTeamMember = await TeamMember.findOne({
                    departmentId: id,
                    memberId: data.leadId
                });

                if (existingTeamMember) {
                    // Update role to head
                    existingTeamMember.role = 'head';
                    await existingTeamMember.save();
                } else {
                    // Create new team member as head
                    // Fetch member details first
                    const memberInfo = await Member.findById(data.leadId);
                    if (memberInfo) {
                        await TeamMember.create({
                            name: memberInfo.fullName,
                            email: memberInfo.email,
                            photo: memberInfo.avatar,
                            role: 'head',
                            memberId: memberInfo._id,
                            departmentId: id,
                            title: 'Departman Başkanı',
                            showInTeam: true,
                            order: -1 // Top of the list
                        });
                    }
                }
            } catch (syncError) {
                console.error('Error syncing department head:', syncError);
                // Non-blocking error, continue
            }
        }

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.UPDATE_DEPARTMENT,
            targetType: 'Department',
            targetId: id,
            targetName: department.name,
        });

        return NextResponse.json(department);
    } catch (error) {
        console.error('Error updating department:', error);
        return NextResponse.json({ error: 'Departman güncellenemedi' }, { status: 500 });
    }
}

// DELETE - Delete department
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

        const department = await Department.findById(id);

        if (!department) {
            return NextResponse.json({ error: 'Departman bulunamadı' }, { status: 404 });
        }

        const deptName = department.name;
        await Department.findByIdAndDelete(id);

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.DELETE_DEPARTMENT,
            targetType: 'Department',
            targetId: id,
            targetName: deptName,
        });

        return NextResponse.json({ message: 'Departman silindi' });
    } catch (error) {
        console.error('Error deleting department:', error);
        return NextResponse.json({ error: 'Departman silinemedi' }, { status: 500 });
    }
}

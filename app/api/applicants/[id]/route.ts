import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Applicant } from '@/app/lib/models/Applicant';
import { verifyAuth } from '@/app/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

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

        const applicant = await Applicant.findById(id);

        if (!applicant) {
            return NextResponse.json(
                { error: 'Başvuru bulunamadı' },
                { status: 404 }
            );
        }

        const applicantName = applicant.fullName;
        await Applicant.findByIdAndDelete(id);

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.DELETE_APPLICANT,
            targetType: 'Applicant',
            targetId: id,
            targetName: applicantName,
        });

        return NextResponse.json({ message: 'Başvuru silindi' });
    } catch (error) {
        console.error('Başvuru silinirken hata oluştu:', error);
        return NextResponse.json(
            { error: 'Başvuru silinirken bir hata oluştu' },
            { status: 500 }
        );
    }
}


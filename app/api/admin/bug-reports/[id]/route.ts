import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/app/lib/auth';
import connectDB from '@/app/lib/db';
import BugReport from '@/app/lib/models/BugReport';
import TeamMember from '@/app/lib/models/TeamMember';
import AdminAccess from '@/app/lib/models/AdminAccess';

// Check admin access
async function checkAdminAccess(payload: { userId: string }) {
    const accessRule = await AdminAccess.findOne({ memberId: payload.userId });
    const teamMember = await TeamMember.findOne({ memberId: payload.userId, isActive: true });
    
    if (teamMember && ['president', 'vice_president'].includes(teamMember.role)) {
        return { userId: payload.userId, isSuperAdmin: true };
    }
    
    if (accessRule) {
        return { userId: payload.userId, isSuperAdmin: accessRule.allowedKeys.includes('ALL') };
    }
    
    return null;
}

// PATCH - Update bug report status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        
        const payload = await verifyAuth(request);
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const admin = await checkAdminAccess(payload);
        if (!admin) {
            return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status, adminNote } = body;

        const report = await BugReport.findById(id);
        if (!report) {
            return NextResponse.json({ error: 'Bildirim bulunamadı' }, { status: 404 });
        }

        // Update fields
        if (status && ['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
            report.status = status;
            report.reviewedById = admin.userId;
        }
        if (adminNote !== undefined) {
            report.adminNote = adminNote;
        }

        await report.save();

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error('Bug report update error:', error);
        return NextResponse.json({ error: 'Bildirim güncellenemedi' }, { status: 500 });
    }
}

// DELETE - Delete bug report
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        
        const payload = await verifyAuth(request);
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const admin = await checkAdminAccess(payload);
        if (!admin) {
            return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
        }

        const { id } = await params;

        const report = await BugReport.findByIdAndDelete(id);
        if (!report) {
            return NextResponse.json({ error: 'Bildirim bulunamadı' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Bug report delete error:', error);
        return NextResponse.json({ error: 'Bildirim silinemedi' }, { status: 500 });
    }
}

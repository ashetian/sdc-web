import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Member from '@/app/lib/models/Member';
import { verifyAuth } from '@/app/lib/auth';
import TeamMember from '@/app/lib/models/TeamMember';
import bcrypt from 'bcryptjs';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

// Helper to check Superadmin status
async function isSuperAdmin(userId: string) {
    const teamMember = await TeamMember.findOne({ memberId: userId, isActive: true });
    return teamMember && ['president', 'vice_president'].includes(teamMember.role);
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const payload = await verifyAuth(req);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check if Superadmin
        if (!await isSuperAdmin(payload.userId)) {
            const AdminAccess = (await import('@/app/lib/models/AdminAccess')).default;
            const access = await AdminAccess.findOne({ memberId: payload.userId });
            if (!access || !access.allowedKeys.includes('ALL')) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        const data = await req.json();
        const { studentNo, fullName, email, password, department, nickname, phone } = data;

        // Validations
        if (!studentNo || !fullName || !email || !password) {
            return NextResponse.json({ error: "Eksik bilgi (Öğrenci No, İsim, Email, Şifre zorunludur)" }, { status: 400 });
        }

        // Check duplications
        const existing = await Member.findOne({
            $or: [{ studentNo }, { email }]
        });
        if (existing) {
            return NextResponse.json({ error: "Bu öğrenci numarası veya email zaten kayıtlı." }, { status: 400 });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create Member
        const newMember = await Member.create({
            studentNo,
            fullName,
            email: email.toLowerCase(),
            passwordHash,
            department,
            nickname,
            phone,
            isTestAccount: true,
            isRegistered: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Audit log
        await logAdminAction({
            adminId: payload.userId,
            adminName: payload.nickname || payload.studentNo,
            action: AUDIT_ACTIONS.CREATE_MEMBER,
            targetType: 'Member',
            targetId: newMember._id.toString(),
            targetName: `${fullName} (${studentNo})`,
            details: 'Test üyesi oluşturuldu',
        });

        return NextResponse.json({ message: "Test üyesi başarıyla oluşturuldu.", member: newMember }, { status: 201 });

    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen hata';
        console.error("Create member error:", e);
        return NextResponse.json({ error: "Bir hata oluştu: " + errorMessage }, { status: 500 });
    }
}


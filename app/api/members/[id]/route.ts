import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Member from '@/app/lib/models/Member';
import PasswordToken from '@/app/lib/models/PasswordToken';
import { sendEmail, maskEmail, generatePasswordSetupEmail } from '@/app/lib/email';
import { verifyAuth } from '@/app/lib/auth';
import crypto from 'crypto';

// GET - Get single member details (admin)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const member = await Member.findById(id).select('-passwordHash');

        if (!member) {
            return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 });
        }

        return NextResponse.json(member);
    } catch (error) {
        console.error('Get member error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// PUT - Update member profile (admin)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();

        const allowedFields = ['fullName', 'email', 'phone', 'department', 'nickname', 'isActive'];
        const updateData: Record<string, unknown> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        const member = await Member.findByIdAndUpdate(id, updateData, { new: true }).select('-passwordHash');

        if (!member) {
            return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Üye güncellendi',
            member,
        });
    } catch (error) {
        console.error('Update member error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// POST - Admin password reset (send email to member)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const member = await Member.findById(id);

        if (!member) {
            return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 });
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Save token (invalidate any existing tokens)
        await PasswordToken.deleteMany({ memberId: member._id, type: 'reset' });
        await PasswordToken.create({
            memberId: member._id,
            token,
            type: 'reset',
            expiresAt,
        });

        // Send email
        const emailHtml = generatePasswordSetupEmail(member.fullName, token, true);
        await sendEmail({
            to: member.email,
            subject: 'SDC - Şifre Sıfırlama (Admin)',
            html: emailHtml,
        });

        return NextResponse.json({
            message: 'Şifre sıfırlama linki üyenin e-posta adresine gönderildi',
            email: maskEmail(member.email),
        });
    } catch (error) {
        console.error('Admin reset password error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// DELETE - Remove member (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verify authentication
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;

        const member = await Member.findByIdAndDelete(id);

        if (!member) {
            return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Üye başarıyla silindi',
        });
    } catch (error) {
        console.error('Delete member error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

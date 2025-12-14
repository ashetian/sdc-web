import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Member from '@/app/lib/models/Member';
import PasswordToken from '@/app/lib/models/PasswordToken';
import { sendEmail, maskEmail, generatePasswordSetupEmail } from '@/app/lib/email';
import crypto from 'crypto';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/app/lib/rateLimit';

// POST - Request password reset
export async function POST(request: NextRequest) {
    try {
        // Rate limiting check (stricter for password reset)
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(clientIP, 'forgot-password', { maxRequests: 3, windowMs: 5 * 60 * 1000 }); // 3 per 5 min

        if (rateLimit.limited) {
            const resetSeconds = Math.ceil(rateLimit.resetIn / 1000);
            return NextResponse.json(
                { error: `Çok fazla deneme. ${resetSeconds} saniye sonra tekrar deneyin.` },
                { status: 429 }
            );
        }

        await connectDB();

        const { studentNo } = await request.json();

        if (!studentNo) {
            return NextResponse.json({ error: 'Öğrenci numarası gerekli' }, { status: 400 });
        }

        // Find member
        const member = await Member.findOne({
            studentNo: String(studentNo).trim(),
            isActive: true
        });

        if (!member) {
            // Don't reveal if user exists - security best practice
            return NextResponse.json({
                message: 'Eğer bu öğrenci numarası kayıtlıysa, şifre sıfırlama linki e-posta adresine gönderilecektir.',
            });
        }

        if (!member.isRegistered) {
            return NextResponse.json({
                error: 'Bu hesap henüz oluşturulmamış. Önce kayıt olun.',
                notRegistered: true
            }, { status: 400 });
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
        const emailHtml = generatePasswordSetupEmail(member.fullName, token, true, member.nativeLanguage as 'tr' | 'en');
        await sendEmail({
            to: member.email,
            subject: member.nativeLanguage === 'en' ? 'SDC - Password Reset' : 'SDC - Şifre Sıfırlama',
            html: emailHtml,
        });

        return NextResponse.json({
            message: 'Şifre sıfırlama linki e-posta adresinize gönderildi',
            email: maskEmail(member.email),
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

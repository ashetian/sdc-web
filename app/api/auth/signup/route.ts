import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Member from '@/app/lib/models/Member';
import PasswordToken from '@/app/lib/models/PasswordToken';
import { sendEmail, maskEmail, generatePasswordSetupEmail } from '@/app/lib/email';
import crypto from 'crypto';

// POST - Request signup with student number
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { studentNo, kvkkAccepted, emailConsent, nativeLanguage } = await request.json();

        if (!studentNo) {
            return NextResponse.json({ error: 'Öğrenci numarası gerekli' }, { status: 400 });
        }

        if (!kvkkAccepted) {
            return NextResponse.json({ error: 'KVKK metnini onaylamanız gerekmektedir.' }, { status: 400 });
        }

        // Find member in database
        const member = await Member.findOne({
            studentNo: String(studentNo).trim(),
            isActive: true
        });

        if (!member) {
            return NextResponse.json({
                error: 'Bu öğrenci numarası kulüp üye listesinde bulunamadı',
                isNotFound: true
            }, { status: 404 });
        }

        if (member.isRegistered) {
            return NextResponse.json({
                error: 'Bu hesap zaten kayıtlı. Giriş yapabilir veya şifrenizi sıfırlayabilirsiniz.',
                isRegistered: true
            }, { status: 400 });
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update member with consent info
        member.kvkkAccepted = true;
        member.emailConsent = emailConsent || false;
        member.nativeLanguage = nativeLanguage || 'tr';
        await member.save();

        // Save token (invalidate any existing tokens)
        await PasswordToken.deleteMany({ memberId: member._id, type: 'signup' });
        await PasswordToken.create({
            memberId: member._id,
            token,
            type: 'signup',
            expiresAt,
        });

        // Send email
        const emailHtml = generatePasswordSetupEmail(member.fullName, token, false, member.nativeLanguage as 'tr' | 'en');
        await sendEmail({
            to: member.email,
            subject: member.nativeLanguage === 'en' ? 'SDC - Account Verification' : 'SDC - Hesap Oluşturma',
            html: emailHtml,
        });

        return NextResponse.json({
            message: 'Şifre oluşturma linki e-posta adresinize gönderildi',
            email: maskEmail(member.email),
        });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

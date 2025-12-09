import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ClubMember from '@/app/lib/models/ClubMember';
import OTPCode from '@/app/lib/models/OTPCode';
import Election from '@/app/lib/models/Election';
import { sendEmail, wrapEmailHtml } from '@/app/lib/email';
import crypto from 'crypto';

// Generate 6-digit OTP
function generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
}

// POST - Send OTP to verify voter
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const { studentNo, email } = await request.json();

        if (!studentNo || !email) {
            return NextResponse.json({ error: 'Öğrenci no ve e-posta gerekli' }, { status: 400 });
        }

        // Check if election is active
        const election = await Election.findById(id);
        if (!election || election.status !== 'active') {
            return NextResponse.json({ error: 'Seçim aktif değil' }, { status: 400 });
        }

        // Find member in club list
        const member = await ClubMember.findOne({
            electionId: id,
            studentNo: studentNo,
            email: email.toLowerCase(),
        });

        if (!member) {
            return NextResponse.json({ error: 'Kulüp üye listesinde bulunamadınız' }, { status: 404 });
        }

        if (member.hasVoted) {
            return NextResponse.json({ error: 'Zaten oy kullandınız' }, { status: 400 });
        }

        // Generate OTP
        const code = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP
        await OTPCode.findOneAndUpdate(
            { electionId: id, studentNo },
            {
                electionId: id,
                studentNo,
                email: email.toLowerCase(),
                code,
                expiresAt,
                verified: false,
            },
            { upsert: true, new: true }
        );

        // Send email
        const subject = `SDC Seçim Doğrulama Kodu - ${election.title}`;
        const content = `
            <h2 style="color: #000; border-bottom: 3px solid #000; padding-bottom: 10px; margin-top: 0;">
                SDC Seçim Doğrulama
            </h2>
            <p>Merhaba <strong>${member.fullName}</strong>,</p>
            <p><strong>${election.title}</strong> için oy kullanmak üzere doğrulama kodunuz:</p>
            <div style="background: #FFDE00; border: 3px solid #000; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px;">${code}</span>
            </div>
            <p style="color: #666; font-size: 14px;">Bu kod 10 dakika içinde geçerliliğini yitirecektir.</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">Bu e-postayı siz talep etmediyseniz lütfen dikkate almayın.</p>
            </div>
        `;

        await sendEmail({
            to: email,
            subject: subject,
            html: wrapEmailHtml(content, 'Seçim Doğrulama', 'tr'),
        });

        return NextResponse.json({
            message: 'Doğrulama kodu e-posta adresinize gönderildi',
            email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return NextResponse.json({ error: 'Doğrulama kodu gönderilemedi' }, { status: 500 });
    }
}

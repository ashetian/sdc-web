import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Member from '@/app/lib/models/Member';
import { sendEmail, wrapEmailHtml } from '@/app/lib/email';
import { verifyAuth } from '@/app/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

export async function POST(request: NextRequest) {
    // Auth check
    const user = await verifyAuth(request);
    if (!user) {
        return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    try {
        await connectDB();
        const { subject, html, target, recipientIds } = await request.json();

        if (!subject || !html) {
            return NextResponse.json({ error: 'Konu ve içerik gerekli' }, { status: 400 });
        }

        let query: Record<string, unknown> = { isActive: true };
        if (target === 'email_consent_only') {
            query.emailConsent = true;
        } else if (target === 'specific') {
            if (!recipientIds || !Array.isArray(recipientIds)) {
                return NextResponse.json({ error: 'Üye seçimi yapılmadı' }, { status: 400 });
            }
            query = { _id: { $in: recipientIds } };
        }

        const members = await Member.find(query).select('email fullName nativeLanguage');

        // Prepare content
        const { translateContent } = await import('@/app/lib/translate');

        // Default Turkish content
        const subjectTr = subject;
        const htmlTr = wrapEmailHtml(html, subject, 'tr');

        // English content (lazy translation)
        let subjectEn = subject;
        let htmlEn = htmlTr; // Fallback

        // Check if we have any English users
        const hasEnglishUsers = members.some((m: { nativeLanguage?: string }) => m.nativeLanguage === 'en');

        if (hasEnglishUsers && process.env.DEEPL_API_KEY) {
            try {
                // Translate subject and body
                const resultSubject = await translateContent(subject, 'tr');
                const resultHtml = await translateContent(html, 'tr');

                subjectEn = resultSubject.en;
                htmlEn = wrapEmailHtml(resultHtml.en, subjectEn, 'en');
                console.log('Admin email auto-translated successfully');
            } catch (error) {
                console.error('Translation failed:', error);
                // Fallback to Turkish wrapped with English footer
                htmlEn = wrapEmailHtml(html, subject, 'en');
            }
        } else if (hasEnglishUsers) {
            // No API key but English users exist -> Use Turkish content with English footer
            htmlEn = wrapEmailHtml(html, subject, 'en');
        }

        // Batch sending
        let successCount = 0;

        for (const member of members) {
            try {
                const isEn = member.nativeLanguage === 'en';
                await sendEmail({
                    to: member.email,
                    subject: isEn ? subjectEn : subjectTr,
                    html: isEn ? htmlEn : htmlTr
                });
                successCount++;
            } catch (err) {
                console.error(`Failed to send to ${member.email}`, err);
            }
        }

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.SEND_BULK_EMAIL,
            targetType: 'Email',
            targetName: subject,
            details: `${successCount}/${members.length} üyeye gönderildi`,
        });

        return NextResponse.json({ success: true, count: successCount });

    } catch (error) {
        console.error('Email send error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}


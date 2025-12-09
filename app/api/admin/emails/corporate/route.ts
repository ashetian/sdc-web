import { NextRequest, NextResponse } from 'next/server';
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
        const { recipientEmail, recipientName, subject, html } = await request.json();

        if (!recipientEmail || !subject) {
            return NextResponse.json({ error: 'E-posta adresi ve konu gerekli' }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipientEmail)) {
            return NextResponse.json({ error: 'Geçersiz e-posta adresi' }, { status: 400 });
        }

        // Wrap HTML with email template (default to Turkish for corporate emails)
        const wrappedHtml = wrapEmailHtml(html || '', subject, 'tr');

        // Send the email
        await sendEmail({
            to: recipientEmail,
            subject,
            html: wrappedHtml
        });

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.SEND_BULK_EMAIL, // Reusing the action, or you can add a new one
            targetType: 'CorporateEmail',
            targetName: subject,
            details: `Kurumsal e-posta gönderildi: ${recipientName ? `${recipientName} (${recipientEmail})` : recipientEmail}`,
        });

        return NextResponse.json({ success: true, message: 'E-posta gönderildi' });

    } catch (error) {
        console.error('Corporate email send error:', error);
        return NextResponse.json({ error: 'E-posta gönderilirken bir hata oluştu' }, { status: 500 });
    }
}

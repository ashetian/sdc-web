import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { sendEmail, wrapEmailHtml } from '@/app/lib/email';

import { JWT_SECRET } from '@/app/lib/auth';

// Verify admin access
async function isAdmin() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;
        if (!token) return false;

        await jwtVerify(token, JWT_SECRET);
        return true;
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'E-posta adresi gerekli' }, { status: 400 });
        }

        const html = wrapEmailHtml(`
            <h2 style="color: #000; margin-bottom: 20px;">Test E-postası 🎉</h2>
            <p>Bu e-posta <strong>SDC Admin Panel</strong> üzerinden gönderildi.</p>
            <p>Eğer bu e-postayı görüyorsanız, e-posta ayarlarınız doğru çalışıyor demektir!</p>
            <div style="background: #f0f0f0; padding: 15px; border-left: 4px solid #FFDE00; margin: 20px 0;">
                <strong>Gönderim Zamanı:</strong> ${new Date().toLocaleString('tr-TR')}
            </div>
        `, 'SDC Test E-postası');

        await sendEmail({
            to: email,
            subject: 'SDC - Test E-postası ✉️',
            html,
        });

        return NextResponse.json({ success: true, message: 'Test e-postası gönderildi' });
    } catch (error) {
        console.error('Test email error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
        return NextResponse.json({ error: `E-posta gönderilemedi: ${errorMessage}` }, { status: 500 });
    }
}

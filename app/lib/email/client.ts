import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email sender configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

interface RegistrationEmailData {
    name: string;
    email: string;
    eventTitle: string;
    eventDate?: string;
    studentNumber: string;
    isPaid: boolean;
    fee?: number;
    paymentIBAN?: string;
    paymentDetails?: string;
}

interface PaymentStatusEmailData {
    name: string;
    email: string;
    eventTitle: string;
    status: 'verified' | 'rejected';
    eventDate?: string;
}

/**
 * Send registration confirmation email
 */
export async function sendRegistrationEmail(data: RegistrationEmailData) {
    try {
        const { name, email, eventTitle, eventDate, studentNumber, isPaid, fee, paymentIBAN, paymentDetails } = data;

        let emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Kayıt Onayı</h2>
                <p>Merhaba ${name},</p>
                <p><strong>${eventTitle}</strong> etkinliğine kaydınız alınmıştır.</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #374151;">Kayıt Bilgileriniz</h3>
                    <p><strong>Öğrenci No:</strong> ${studentNumber}</p>
                    <p><strong>E-posta:</strong> ${email}</p>
                    ${eventDate ? `<p><strong>Etkinlik Tarihi:</strong> ${new Date(eventDate).toLocaleDateString('tr-TR')}</p>` : ''}
                </div>
        `;

        if (isPaid && fee) {
            emailContent += `
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                    <h3 style="margin-top: 0; color: #92400e;">⚠️ Ödeme Bilgileri</h3>
                    <p>Bu ücretli bir etkinliktir. Kaydınızın kesinleşmesi için ödeme yapmanız gerekmektedir.</p>
                    <p><strong>Tutar:</strong> ${fee} TL</p>
                    ${paymentIBAN ? `<p><strong>IBAN:</strong> <code style="background: #fff; padding: 2px 6px; border-radius: 4px;">${paymentIBAN}</code></p>` : ''}
                    ${paymentDetails ? `<p><strong>Ödeme Talimatları:</strong><br/>${paymentDetails}</p>` : ''}
                    <p style="margin-top: 15px; font-size: 14px; color: #92400e;">
                        <strong>Önemli:</strong> Ödemenizi yaptıktan sonra dekontunuzu sisteme yüklemeyi unutmayın. 
                        Ödemeniz admin tarafından onaylandıktan sonra e-posta ile bilgilendirileceksiniz.
                    </p>
                </div>
            `;
        } else {
            emailContent += `
                <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                    <p style="margin: 0; color: #065f46;"><strong>✓</strong> Kaydınız onaylanmıştır!</p>
                </div>
            `;
        }

        emailContent += `
                <p style="margin-top: 20px;">Etkinlik hakkında sorularınız için bizimle iletişime geçebilirsiniz.</p>
                <p>Teşekkürler,<br/>SDC Ekibi</p>
            </div>
        `;

        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: `Kayıt Onayı - ${eventTitle}`,
            html: emailContent,
        });

        console.log(`Registration email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending registration email:', error);
        return { success: false, error };
    }
}

/**
 * Send payment status update email
 */
export async function sendPaymentStatusEmail(data: PaymentStatusEmailData) {
    try {
        const { name, email, eventTitle, status, eventDate } = data;

        const isVerified = status === 'verified';
        const statusText = isVerified ? 'Onaylandı' : 'Reddedildi';
        const statusColor = isVerified ? '#10b981' : '#ef4444';
        const backgroundColor = isVerified ? '#d1fae5' : '#fee2e2';
        const icon = isVerified ? '✓' : '✗';

        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Ödeme Durumu Güncellemesi</h2>
                <p>Merhaba ${name},</p>
                <p><strong>${eventTitle}</strong> etkinliği için ödemeniz hakkında bilgilendirme:</p>
                
                <div style="background-color: ${backgroundColor}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
                    <h3 style="margin-top: 0; color: ${statusColor};">${icon} Ödeme ${statusText}</h3>
                    ${isVerified ? `
                        <p style="margin: 0;">Ödemeniz admin tarafından onaylanmıştır. Kaydınız kesinleşmiştir!</p>
                        ${eventDate ? `<p style="margin-top: 10px;"><strong>Etkinlik Tarihi:</strong> ${new Date(eventDate).toLocaleDateString('tr-TR')}</p>` : ''}
                        <p style="margin-top: 10px;">Etkinlikte görüşmek üzere!</p>
                    ` : `
                        <p style="margin: 0;">Ödemeniz admin tarafından reddedilmiştir.</p>
                        <p style="margin-top: 10px;">Lütfen bilgilerinizi kontrol ederek tekrar deneyiniz veya bizimle iletişime geçiniz.</p>
                    `}
                </div>

                <p>Sorularınız için bizimle iletişime geçebilirsiniz.</p>
                <p>Teşekkürler,<br/>SDC Ekibi</p>
            </div>
        `;

        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: `Ödeme ${statusText} - ${eventTitle}`,
            html: emailContent,
        });

        console.log(`Payment ${status} email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending payment status email:', error);
        return { success: false, error };
    }
}

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
    await transporter.sendMail({
        from: process.env.SMTP_FROM || 'SDC <noreply@ktusdc.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
    });
}

export function maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return '***@***.***';

    const firstChar = localPart[0];
    const lastChar = localPart[localPart.length - 1];
    const maskedLocal = localPart.length > 2
        ? `${firstChar}${'*'.repeat(Math.min(5, localPart.length - 2))}${lastChar}`
        : localPart;

    return `${maskedLocal}@${domain}`;
}

export function generatePasswordSetupEmail(name: string, token: string, isReset: boolean = false): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ktusdc.com';
    const actionUrl = `${baseUrl}/auth/set-password/${token}`;
    const title = isReset ? 'Şifre Sıfırlama' : 'Hesap Oluşturma';
    const action = isReset ? 'şifrenizi sıfırlamak' : 'hesabınızı oluşturmak';
    const logoUrl = `${baseUrl}/sdclogo.png`;

    return `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #fff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="${logoUrl}" alt="SDC Logo" style="height: 80px; width: auto;" />
            </div>
            <h2 style="color: #000; border-bottom: 3px solid #000; padding-bottom: 10px; text-align: center;">
                ${title}
            </h2>
            <p>Merhaba <strong>${name}</strong>,</p>
            <p>${action} için aşağıdaki butona tıklayın:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${actionUrl}" 
                   style="background: #FFDE00; color: #000; padding: 15px 30px; text-decoration: none; 
                          font-weight: bold; border: 3px solid #000; display: inline-block;">
                    ${isReset ? 'Şifremi Sıfırla' : 'Hesabımı Oluştur'}
                </a>
            </div>
            <p style="color: #666; font-size: 14px;">
                Bu link 24 saat içinde geçerliliğini yitirecektir.
            </p>
            <p style="color: #666; font-size: 14px;">
                Buton çalışmazsa bu linki tarayıcınıza yapıştırın:<br>
                <a href="${actionUrl}" style="color: #0066cc; word-break: break-all;">${actionUrl}</a>
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                <p style="color: #999; font-size: 12px;">
                    Bu e-postayı siz talep etmediyseniz lütfen dikkate almayın.
                </p>
                <p style="color: #999; font-size: 12px;">
                    © ${new Date().getFullYear()} Software Development Club
                </p>
            </div>
        </div>
    `;
}

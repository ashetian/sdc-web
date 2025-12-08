import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import connectDB from './db';
import { Setting } from './models/Setting';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email settings cache
interface EmailSettings {
    emailProvider: 'resend' | 'nodemailer-gmail';
}

let cachedSettings: EmailSettings | null = null;
let lastSettingsFetch: number = 0;
const CACHE_DURATION = 60000; // 1 minute cache

// Fetch email settings from database (only provider, credentials from env)
async function getEmailSettings(): Promise<EmailSettings> {
    const now = Date.now();

    // Return cached settings if still valid
    if (cachedSettings && (now - lastSettingsFetch) < CACHE_DURATION) {
        return cachedSettings;
    }

    try {
        await connectDB();
        const setting = await Setting.findOne({ key: 'emailProvider' });

        cachedSettings = {
            emailProvider: (setting?.value as 'resend' | 'nodemailer-gmail') || 'resend',
        };
        lastSettingsFetch = now;

        return cachedSettings;
    } catch (error) {
        console.error('Failed to fetch email settings:', error);
        return { emailProvider: 'resend' };
    }
}

// Create Gmail transporter (credentials from env only - secure)
function createGmailTransporter() {
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
        throw new Error('Gmail credentials not configured in environment variables');
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailUser,
            pass: gmailAppPassword,
        },
    });
}

// Clear settings cache (useful after settings update)
export function clearEmailSettingsCache(): void {
    cachedSettings = null;
    lastSettingsFetch = 0;
}

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
    const { to, subject, html } = options;
    const settings = await getEmailSettings();
    const replyTo = 'iletisim@ktusdc.com'; // Constant Reply-To
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/profile`;

    // Generate simple plain text version
    const text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
        .replace(/<br\s*\/?>/gi, '\n') // Replace br with newline
        .replace(/<[^>]*>/g, '') // Remove other tags
        .replace(/\n\s*\n/g, '\n\n') // Normalize newlines
        .trim();

    if (settings.emailProvider === 'nodemailer-gmail') {
        // Use Nodemailer with Gmail SMTP (credentials from env)
        const transporter = createGmailTransporter();
        const gmailUser = process.env.GMAIL_USER;

        try {
            await transporter.sendMail({
                from: `KTUDSC Yazılım Geliştirme Kulübü <${gmailUser}>`,
                to: to,
                replyTo: replyTo,
                subject: subject,
                html: html,
                text: text, // Plain text version
                headers: {
                    'List-Unsubscribe': `<${unsubscribeUrl}>`,
                    'X-Entity-ID': 'KTUSDC-Web',
                }
            });
        } catch (error) {
            console.error('Nodemailer Gmail error:', error);
            throw error;
        }
    } else {
        // Use Resend (default)
        try {
            const data = await resend.emails.send({
                from: 'KTUSDC Yazılım Geliştirme Kulübü <noreply@ktusdc.com>',
                to: [to],
                replyTo: replyTo,
                subject: subject,
                html: html,
                text: text, // Plain text version
                headers: {
                    'List-Unsubscribe': `<${unsubscribeUrl}>`,
                    'X-Entity-ID': 'KTUSDC-Web',
                }
            });

            if (data.error) {
                console.error('Resend Error:', data.error);
                throw new Error(data.error.message);
            }
        } catch (error) {
            console.error('Email sending failed:', error);
            throw error;
        }
    }
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

export function generatePasswordSetupEmail(name: string, token: string, isReset: boolean = false, lang: 'tr' | 'en' = 'tr'): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ktusdc.com';
    const actionUrl = `${baseUrl}/auth/set-password/${token}`;
    const logoUrl = `${baseUrl}/sdclogo.png`;

    const texts = {
        tr: {
            title: isReset ? 'Şifre Sıfırlama' : 'Hesap Oluşturma',
            greeting: `Merhaba <strong>${name}</strong>,`,
            instruction: isReset ? 'şifrenizi sıfırlamak için aşağıdaki butona tıklayın:' : 'hesabınızı oluşturmak için aşağıdaki butona tıklayın:',
            button: isReset ? 'Şifremi Sıfırla' : 'Hesabımı Oluştur',
            expiry: 'Bu link 24 saat içinde geçerliliğini yitirecektir.',
            fallback: 'Buton çalışmazsa bu linki tarayıcınıza yapıştırın:',
            ignore: 'Bu e-postayı siz talep etmediyseniz lütfen dikkate almayın.',
            copyright: `© ${new Date().getFullYear()} Software Development Club`
        },
        en: {
            title: isReset ? 'Password Reset' : 'Account Verification',
            greeting: `Hello <strong>${name}</strong>,`,
            instruction: isReset ? 'click the button below to reset your password:' : 'click the button below to verify your account:',
            button: isReset ? 'Reset Password' : 'Verify Account',
            expiry: 'This link will expire in 24 hours.',
            fallback: 'If the button does not work, paste this link into your browser:',
            ignore: 'If you did not request this email, please ignore it.',
            copyright: `© ${new Date().getFullYear()} Software Development Club`
        }
    };

    const t = texts[lang] || texts.tr;

    return `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #fff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="${logoUrl}" alt="SDC Logo" style="height: 80px; width: auto;" />
            </div>
            <h2 style="color: #000; border-bottom: 3px solid #000; padding-bottom: 10px; text-align: center;">
                ${t.title}
            </h2>
            <p>${t.greeting}</p>
            <p>${t.instruction}</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${actionUrl}" 
                   style="background: #FFDE00; color: #000; padding: 15px 30px; text-decoration: none; 
                          font-weight: bold; border: 3px solid #000; display: inline-block;">
                    ${t.button}
                </a>
            </div>
            <p style="color: #666; font-size: 14px;">
                ${t.expiry}
            </p>
            <p style="color: #666; font-size: 14px;">
                ${t.fallback}<br>
                <a href="${actionUrl}" style="color: #0066cc; word-break: break-all;">${actionUrl}</a>
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                <p style="color: #999; font-size: 12px;">
                    ${t.ignore}
                </p>
                <p style="color: #999; font-size: 12px;">
                    ${t.copyright}
                </p>
            </div>
        </div>
    `;
}

// Re-export for compatibility
export { wrapEmailHtml } from './email-template';

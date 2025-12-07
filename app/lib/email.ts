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

    if (settings.emailProvider === 'nodemailer-gmail') {
        // Use Nodemailer with Gmail SMTP (credentials from env)
        const transporter = createGmailTransporter();
        const gmailUser = process.env.GMAIL_USER;

        try {
            await transporter.sendMail({
                from: `SDC <${gmailUser}>`,
                to: to,
                subject: subject,
                html: html,
            });
        } catch (error) {
            console.error('Nodemailer Gmail error:', error);
            throw error;
        }
    } else {
        // Use Resend (default)
        try {
            const data = await resend.emails.send({
                from: 'SDC <noreply@ktusdc.com>',
                to: [to],
                subject: subject,
                html: html,
                headers: {
                    'List-Unsubscribe': `<${process.env.NEXT_PUBLIC_BASE_URL}/profile>`,
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

// Re-export for compatibility
export { wrapEmailHtml } from './email-template';

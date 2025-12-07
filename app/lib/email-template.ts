// Shared Email Template Generator
// Can be used in both Backend (fetching) and Frontend (preview)

// Use environment variable for base URL, fallback to production domain
export const wrapEmailHtml = (content: string, title: string = 'SDC', lang: 'tr' | 'en' = 'tr') => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ktusdc.com';
    const logoUrl = `${baseUrl}/sdclogo.png`;

    const texts = {
        tr: {
            whatsapp: 'WhatsApp Topluluğuna Katıl',
            footer: 'Bu e-posta Karadeniz Teknik Üniversitesi Yazılım Geliştirme Kulübü (KTUSDC) tarafından gönderilmiştir.',
            settings: 'E-posta alım ayarlarınızı profil sayfanızdan değiştirebilirsiniz.'
        },
        en: {
            whatsapp: 'Join WhatsApp Community',
            footer: 'This email was sent by Karadeniz Technical University Software Development Club (KTUSDC).',
            settings: 'You can change your email preferences from your profile page.'
        }
    };

    const t = texts[lang] || texts.tr;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .content { padding: 30px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; }
            .btn { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Club Logo -->
            <div style="text-align: center; padding: 20px 0; border-bottom: 4px solid #000;">
                <img src="${logoUrl}" alt="KTUSDC Logo" style="height: 80px; width: auto; display: block; margin: 0 auto;" />
            </div>

            <div class="content">
                ${content}
            </div>

            <!-- Social Media Section -->
            <div style="text-align: center; margin: 30px 0; padding: 20px 0; border-top: 1px solid #eee;">
                
                <!-- WhatsApp Button -->
                <div style="margin-bottom: 25px;">
                    <a href="https://chat.whatsapp.com/FH8knELNs0E5ZMd7XxH5YB" style="background-color: #25D366; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/120px-WhatsApp.svg.png" alt="WhatsApp" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 8px;">
                        ${t.whatsapp}
                    </a>
                </div>

                <!-- Icon Row -->
                <div style="display: inline-block;">
                    <a href="https://www.instagram.com/ktu.sdc" style="text-decoration: none; margin: 0 10px;">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/120px-Instagram_icon.png" alt="Instagram" style="width: 32px; height: 32px; transition: transform 0.2s;">
                    </a>
                    <a href="https://www.linkedin.com/company/ktusdc/about/" style="text-decoration: none; margin: 0 10px;">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn" style="width: 32px; height: 32px; transition: transform 0.2s;">
                    </a>
                    <a href="https://ktu-sdc.slack.com" style="text-decoration: none; margin: 0 10px;">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/120px-Slack_icon_2019.svg.png" alt="Slack" style="width: 32px; height: 32px; transition: transform 0.2s;">
                    </a>
                </div>

            </div>

            <div class="footer">
                <p>${t.footer}</p>
                <p>${t.settings}</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

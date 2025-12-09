// Shared Email Template Generator
// Can be used in both Backend (fetching) and Frontend (preview)

// Use environment variable for base URL, fallback to production domain
export const wrapEmailHtml = (content: string, title: string = 'SDC', lang: 'tr' | 'en' = 'tr') => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ktusdc.com';
    const logoUrl = `${baseUrl}/sdclogo.png`;

    // Extract first 100 chars as preheader text (invisible in body but seen in inbox)
    const preheaderText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 100) + '...';

    const texts = {
        tr: {
            whatsapp: 'WhatsApp Topluluğuna Katıl',
            footer: 'Bu e-posta Karadeniz Teknik Üniversitesi Yazılım Geliştirme Kulübü (KTUSDC) tarafından gönderilmiştir.',
            settings: 'E-posta alım ayarlarınızı profil sayfanızdan değiştirebilirsiniz.',
            address: 'Karadeniz Teknik Üniversitesi, Yazılım Geliştirme Bölümü, Kanuni Kampüsü, Trabzon, Türkiye',
            viewBrowser: 'Tarayıcıda görüntüle'
        },
        en: {
            whatsapp: 'Join WhatsApp Community',
            footer: 'This email was sent by Karadeniz Technical University Software Development Club (KTUSDC).',
            settings: 'You can change your email preferences from your profile page.',
            address: 'Karadeniz Technical University, Dept. of Software Development, Kanuni Campus, Trabzon, Turkey',
            viewBrowser: 'View in browser'
        }
    };

    const t = texts[lang] || texts.tr;

    return `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="x-apple-disable-message-reformatting">
        <title>${title}</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); border-radius: 8px; }
            .content { padding: 30px; text-align: left; }
            .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; }
            .btn { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 10px 0; }
            img { max-width: 100%; height: auto; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; border: none; }
            a { color: #000000; text-decoration: underline; }
            a:hover { text-decoration: none; }
            /* Mobile styles */
            @media only screen and (max-width: 600px) {
                .container { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
                .content { padding: 20px !important; }
            }
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
        
        <!-- Preheader Text (Invisible) -->
        <div style="display: none; max-height: 0px; overflow: hidden;">
            ${preheaderText}
            &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
        </div>

        <div class="container" style="background-color: #ffffff; margin: 20px auto; max-width: 600px; border-radius: 8px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
            
            <!-- Club Logo -->
            <div style="text-align: center; padding: 30px 0 20px 0; border-bottom: 4px solid #000; background-color: #fff;">
                <img src="${logoUrl}" alt="KTUSDC Logo" style="height: 80px; width: auto; display: block; margin: 0 auto;" />
            </div>

            <!-- Main Content -->
            <div class="content" style="padding: 30px; color: #333333; line-height: 1.6; font-size: 16px;">
                ${content}
            </div>

            <!-- Social Media Section -->
            <div style="text-align: center; margin: 0; padding: 30px 20px; border-top: 1px solid #eee; background-color: #ffffff;">
                
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
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/120px-Instagram_icon.png" alt="Instagram" style="width: 32px; height: 32px; display: inline-block;" border="0">
                    </a>
                    <a href="https://www.linkedin.com/company/ktusdc/about/" style="text-decoration: none; margin: 0 10px;">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn" style="width: 32px; height: 32px; display: inline-block;" border="0">
                    </a>
                    <a href="https://ktu-sdc.slack.com" style="text-decoration: none; margin: 0 10px;">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/120px-Slack_icon_2019.svg.png" alt="Slack" style="width: 32px; height: 32px; display: inline-block;" border="0">
                    </a>
                </div>

            </div>

            <!-- Footer -->
            <div class="footer" style="padding: 30px 20px; background-color: #f8f9fa; text-align: center; font-size: 12px; color: #666666;">
                <p style="margin: 0 0 10px 0; font-weight: bold;">${t.footer}</p>
                <p style="margin: 0 0 15px 0;">${t.address}</p>
                <p style="margin: 0;">
                    <a href="${baseUrl}/profile" style="color: #666666; text-decoration: underline;">
                        ${t.settings}
                    </a>
                </p>
                <div style="margin-top: 15px; font-size: 10px; color: #999;">
                    &copy; ${new Date().getFullYear()} KTUSDC. All rights reserved.
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

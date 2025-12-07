import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Event } from '@/app/lib/models/Event';
import { Registration } from '@/app/lib/models/Registration';
import { Announcement } from '@/app/lib/models/Announcement';
import { verifyAuth } from '@/app/lib/auth';
import { sendEmail, wrapEmailHtml } from '@/app/lib/email';
import Member from '@/app/lib/models/Member';
import { translateContent, translateDate } from '@/app/lib/translate';

// Helper to create slug from title
function createSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// POST /api/events/[id]/end - End event and create announcement
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        // Admin only
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
        }

        if (event.isEnded) {
            return NextResponse.json({ error: 'Bu etkinlik zaten sonlandırılmış' }, { status: 400 });
        }

        // Check if completion report exists
        if (!event.completionReport || !event.completionReport.summary) {
            return NextResponse.json({
                error: 'Etkinliği sonlandırmadan önce sonuç raporu eklemelisiniz',
                needsReport: true
            }, { status: 400 });
        }

        const report = event.completionReport;

        // Get attendance stats
        const totalAttended = await Registration.countDocuments({
            eventId: id,
            attendedAt: { $ne: null },
        });

        // Update event
        event.isEnded = true;
        event.isOpen = false;
        event.actualDuration = report.duration;
        await event.save();

        // Create announcement from report
        const dateStr = new Date().toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const announcementTitle = `${event.title} - Etkinlik Raporu`;
        const baseSlug = createSlug(announcementTitle);
        let slug = baseSlug;
        let counter = 1;

        // Ensure unique slug
        while (await Announcement.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Translate if DeepL is available
        let titleEn = '';
        let descriptionEn = '';
        let summaryEn = report.summaryEn || '';

        if (process.env.DEEPL_API_KEY) {
            try {
                const titleResult = await translateContent(announcementTitle, 'tr');
                const descResult = await translateContent(report.summary, 'tr');
                titleEn = titleResult.en;
                descriptionEn = descResult.en;
                if (!summaryEn) {
                    summaryEn = descResult.en;
                }
            } catch (e) {
                console.error('Translation failed:', e);
            }
        }

        const announcement = await Announcement.create({
            slug,
            title: announcementTitle,
            titleEn: titleEn || `${event.titleEn || event.title} - Event Report`,
            date: dateStr,
            dateEn: translateDate(dateStr),
            description: report.summary,
            descriptionEn: descriptionEn || summaryEn || report.summary,
            type: 'event',
            content: '',
            contentBlocks: report.contentBlocks,
            eventId: id,
            isDraft: false,
            image: event.posterUrl,
        });

        // Send email notifications (preview only)
        (async () => {
            try {
                const members = await Member.find({
                    isActive: true,
                    emailConsent: true
                }).select('email nativeLanguage');

                if (members.length > 0) {
                    const announcementUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/announcements/${slug}`;

                    const htmlTr = wrapEmailHtml(`
                        <h2 style="margin-bottom: 20px;">${announcementTitle}</h2>
                        <div style="margin-bottom: 20px;">
                            <p><strong>Katılımcı:</strong> ${totalAttended} kişi</p>
                            <p><strong>Süre:</strong> ${Math.floor(report.duration / 60)} saat ${report.duration % 60} dakika</p>
                        </div>
                        <p style="margin-bottom: 20px;">${report.summary.substring(0, 200)}${report.summary.length > 200 ? '...' : ''}</p>
                        <a href="${announcementUrl}" style="display: inline-block; background: #FFDE00; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border: 3px solid #000;">Detayları Gör</a>
                    `, 'Etkinlik Raporu', 'tr');

                    const htmlEn = wrapEmailHtml(`
                        <h2 style="margin-bottom: 20px;">${titleEn || `${event.titleEn || event.title} - Event Report`}</h2>
                        <div style="margin-bottom: 20px;">
                            <p><strong>Participants:</strong> ${totalAttended} people</p>
                            <p><strong>Duration:</strong> ${Math.floor(report.duration / 60)} hours ${report.duration % 60} minutes</p>
                        </div>
                        <p style="margin-bottom: 20px;">${(summaryEn || report.summary).substring(0, 200)}${(summaryEn || report.summary).length > 200 ? '...' : ''}</p>
                        <a href="${announcementUrl}" style="display: inline-block; background: #FFDE00; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border: 3px solid #000;">View Details</a>
                    `, 'Event Report', 'en');

                    for (const member of members) {
                        const isEn = member.nativeLanguage === 'en';
                        await sendEmail({
                            to: member.email,
                            subject: isEn
                                ? `Event Report: ${titleEn || event.titleEn || event.title}`
                                : `Etkinlik Raporu: ${event.title}`,
                            html: isEn ? htmlEn : htmlTr
                        }).catch(e => console.error(`Failed to send to ${member.email}`, e));
                    }
                }
            } catch (emailError) {
                console.error('Email notification failed:', emailError);
            }
        })();

        // Audit log
        const { logAdminAction, AUDIT_ACTIONS } = await import('@/app/lib/utils/logAdminAction');
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.END_EVENT,
            targetType: 'Event',
            targetId: id,
            targetName: event.title,
            details: `Katılımcı: ${totalAttended}, Süre: ${report.duration}dk`,
        });

        return NextResponse.json({
            message: 'Etkinlik sonlandırıldı ve duyuru oluşturuldu',
            stats: {
                attendeeCount: totalAttended,
                duration: report.duration,
            },
            announcement: {
                slug: announcement.slug,
                title: announcement.title,
            }
        });
    } catch (error) {
        console.error('End event error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}


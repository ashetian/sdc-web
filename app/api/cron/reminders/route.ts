import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Event } from '@/app/lib/models/Event';
import { Registration } from '@/app/lib/models/Registration';
import { sendEmail, wrapEmailHtml } from '@/app/lib/email';
import moment from 'moment';

// CRON JOB Endpoint
// Vercel Cron can call this daily
export async function GET(request: Request) {
    try {
        // Authenticate Cron Request (secure with a simple secret key check if needed)
        // const authHeader = request.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        await connectDB();

        // 1. Find events starting tomorrow (between 24h and 48h from now, or exactly “tomorrow”)
        // Logic: Find events where startDate is > now and < now + 24h + buffer?
        // Better: Find events where startDate is tomorrow.
        // Let's simplfy: Find events starting in the next 24-48 hours that haven't sent reminders yet.

        const now = moment();
        const tomorrowStart = moment().add(1, 'days').startOf('day');
        const tomorrowEnd = moment().add(1, 'days').endOf('day');

        // Events happening tomorrow, not yet reminded
        const events = await Event.find({
            startDate: {
                $gte: tomorrowStart.toDate(),
                $lte: tomorrowEnd.toDate()
            },
            remindersSent: { $ne: true },
            isPublished: true
        });

        console.log(`Cron: Found ${events.length} events for tomorrow.`);

        const results = [];

        for (const event of events) {
            // Find registered members
            const registrations = await Registration.find({ eventId: event._id }).populate('memberId', 'email fullName');

            if (registrations.length > 0) {
                const emailHtml = wrapEmailHtml(`
                    <p>Merhaba,</p>
                    <p><strong>${event.title}</strong> etkinliği yarın başlıyor!</p>
                    <p><strong>Tarih:</strong> ${new Date(event.startDate).toLocaleString('tr-TR')}</p>
                    <p><strong>Yer:</strong> ${event.location}</p>
                    <br>
                    <p>Katılımınızı bekliyoruz. Görüşmek üzere!</p>
                `, 'Etkinlik Hatırlatması');

                let sentCount = 0;
                for (const reg of registrations) {
                    // @ts-ignore
                    const member = reg.memberId;
                    if (member && member.email) {
                        try {
                            await sendEmail({
                                to: member.email,
                                subject: `Hatırlatma: ${event.title}`,
                                html: emailHtml
                            });
                            sentCount++;
                        } catch (e) {
                            console.error(`Reminder failed for ${member.email}`);
                        }
                    }
                }
                results.push({ event: event.title, sent: sentCount });
            }

            // Mark as sent
            event.remindersSent = true;
            await event.save();
        }

        return NextResponse.json({ success: true, processed: results });
    } catch (error) {
        console.error('Cron error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

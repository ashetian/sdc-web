import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Announcement } from '@/app/lib/models/Announcement';
import { Event } from '@/app/lib/models/Event';
import Project from '@/app/lib/models/Project';
import TeamMember from '@/app/lib/models/TeamMember';
import Sponsor from '@/app/lib/models/Sponsor';
import { verifyAuth } from '@/app/lib/auth';
import { translateContent, translateContentBlocks, translateDate } from '@/app/lib/translate';

type ContentTypeResult = { total: number; translated: number; errors: number };
type ResultsType = Record<string, ContentTypeResult>;

// POST - Batch translate selected content types
export async function POST(request: NextRequest) {
    try {
        // Auth check - admin only
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        if (!process.env.DEEPL_API_KEY) {
            return NextResponse.json({ error: 'DEEPL_API_KEY tanımlı değil' }, { status: 500 });
        }

        await connectDB();

        // Get selected content types from request body
        const body = await request.json().catch(() => ({}));
        const types: string[] = body.types || ['announcements', 'events', 'projects', 'team', 'sponsors'];

        const results: ResultsType = {};

        // 1. Translate Announcements
        if (types.includes('announcements')) {
            results.announcements = { total: 0, translated: 0, errors: 0 };
            const announcements = await Announcement.find({});
            results.announcements.total = announcements.length;

            for (const announcement of announcements) {
                try {
                    let needsUpdate = false;
                    const updateData: Record<string, unknown> = {};

                    if (announcement.title && !announcement.titleEn) {
                        const result = await translateContent(announcement.title, 'tr');
                        updateData.titleEn = result.en;
                        needsUpdate = true;
                    }

                    if (announcement.description && !announcement.descriptionEn) {
                        const result = await translateContent(announcement.description, 'tr');
                        updateData.descriptionEn = result.en;
                        needsUpdate = true;
                    }

                    if (announcement.content && !announcement.contentEn) {
                        const result = await translateContent(announcement.content, 'tr');
                        updateData.contentEn = result.en;
                        needsUpdate = true;
                    }

                    if (announcement.date && !announcement.dateEn) {
                        updateData.dateEn = translateDate(announcement.date);
                        needsUpdate = true;
                    }

                    if (announcement.galleryDescription && !announcement.galleryDescriptionEn) {
                        const result = await translateContent(announcement.galleryDescription, 'tr');
                        updateData.galleryDescriptionEn = result.en;
                        needsUpdate = true;
                    }

                    if (announcement.contentBlocks && announcement.contentBlocks.length > 0) {
                        const hasUntranslatedBlocks = announcement.contentBlocks.some(
                            (block: { type: string; content?: string; contentEn?: string; buttonText?: string; buttonTextEn?: string }) =>
                                (block.type === 'text' && block.content && !block.contentEn) ||
                                (block.type === 'link-button' && block.buttonText && !block.buttonTextEn)
                        );

                        if (hasUntranslatedBlocks) {
                            const translatedBlocks = await translateContentBlocks(announcement.contentBlocks, 'tr');
                            updateData.contentBlocks = translatedBlocks;
                            needsUpdate = true;
                        }
                    }

                    if (needsUpdate) {
                        await Announcement.findByIdAndUpdate(announcement._id, updateData);
                        results.announcements.translated++;
                        console.log(`Translated announcement: ${announcement.title}`);
                    }
                } catch (error) {
                    console.error(`Error translating announcement ${announcement.slug}:`, error);
                    results.announcements.errors++;
                }
            }
        }

        // 2. Translate Events
        if (types.includes('events')) {
            results.events = { total: 0, translated: 0, errors: 0 };
            const events = await Event.find({});
            results.events.total = events.length;

            for (const event of events) {
                try {
                    let needsUpdate = false;
                    const updateData: Record<string, unknown> = {};

                    if (event.title && !event.titleEn) {
                        const result = await translateContent(event.title, 'tr');
                        updateData.titleEn = result.en;
                        needsUpdate = true;
                    }

                    if (event.description && !event.descriptionEn) {
                        const result = await translateContent(event.description, 'tr');
                        updateData.descriptionEn = result.en;
                        needsUpdate = true;
                    }

                    if (event.completionReport?.contentBlocks?.length > 0) {
                        const hasUntranslatedBlocks = event.completionReport.contentBlocks.some(
                            (block: { type: string; content?: string; contentEn?: string; buttonText?: string; buttonTextEn?: string }) =>
                                (block.type === 'text' && block.content && !block.contentEn) ||
                                (block.type === 'link-button' && block.buttonText && !block.buttonTextEn)
                        );

                        if (hasUntranslatedBlocks) {
                            const translatedBlocks = await translateContentBlocks(event.completionReport.contentBlocks, 'tr');
                            updateData['completionReport.contentBlocks'] = translatedBlocks;
                            needsUpdate = true;
                        }
                    }

                    if (event.completionReport?.summary && !event.completionReport?.summaryEn) {
                        const result = await translateContent(event.completionReport.summary, 'tr');
                        updateData['completionReport.summaryEn'] = result.en;
                        needsUpdate = true;
                    }

                    if (needsUpdate) {
                        await Event.findByIdAndUpdate(event._id, updateData);
                        results.events.translated++;
                        console.log(`Translated event: ${event.title}`);
                    }
                } catch (error) {
                    console.error(`Error translating event ${event._id}:`, error);
                    results.events.errors++;
                }
            }
        }

        // 3. Translate Projects
        if (types.includes('projects')) {
            results.projects = { total: 0, translated: 0, errors: 0 };
            const projects = await Project.find({});
            results.projects.total = projects.length;

            for (const project of projects) {
                try {
                    let needsUpdate = false;
                    const updateData: Record<string, unknown> = {};

                    if (project.title && !project.titleEn) {
                        const result = await translateContent(project.title, 'tr');
                        updateData.titleEn = result.en;
                        needsUpdate = true;
                    }

                    if (project.description && !project.descriptionEn) {
                        const result = await translateContent(project.description, 'tr');
                        updateData.descriptionEn = result.en;
                        needsUpdate = true;
                    }

                    if (needsUpdate) {
                        await Project.findByIdAndUpdate(project._id, updateData);
                        results.projects.translated++;
                        console.log(`Translated project: ${project.title}`);
                    }
                } catch (error) {
                    console.error(`Error translating project ${project._id}:`, error);
                    results.projects.errors++;
                }
            }
        }

        // 4. Translate Team Members
        if (types.includes('team')) {
            results.team = { total: 0, translated: 0, errors: 0 };
            const teamMembers = await TeamMember.find({});
            results.team.total = teamMembers.length;

            for (const member of teamMembers) {
                try {
                    let needsUpdate = false;
                    const updateData: Record<string, unknown> = {};

                    if (member.title && !member.titleEn) {
                        const result = await translateContent(member.title, 'tr');
                        updateData.titleEn = result.en;
                        needsUpdate = true;
                    }

                    if (member.description && !member.descriptionEn) {
                        const result = await translateContent(member.description, 'tr');
                        updateData.descriptionEn = result.en;
                        needsUpdate = true;
                    }

                    if (needsUpdate) {
                        await TeamMember.findByIdAndUpdate(member._id, updateData);
                        results.team.translated++;
                        console.log(`Translated team member: ${member.name}`);
                    }
                } catch (error) {
                    console.error(`Error translating team member ${member._id}:`, error);
                    results.team.errors++;
                }
            }
        }

        // 5. Translate Sponsors
        if (types.includes('sponsors')) {
            results.sponsors = { total: 0, translated: 0, errors: 0 };
            const sponsors = await Sponsor.find({});
            results.sponsors.total = sponsors.length;

            for (const sponsor of sponsors) {
                try {
                    let needsUpdate = false;
                    const updateData: Record<string, unknown> = {};

                    if (sponsor.name && !sponsor.nameEn) {
                        const result = await translateContent(sponsor.name, 'tr');
                        updateData.nameEn = result.en;
                        needsUpdate = true;
                    }

                    if (sponsor.description && !sponsor.descriptionEn) {
                        const result = await translateContent(sponsor.description, 'tr');
                        updateData.descriptionEn = result.en;
                        needsUpdate = true;
                    }

                    if (needsUpdate) {
                        await Sponsor.findByIdAndUpdate(sponsor._id, updateData);
                        results.sponsors.translated++;
                        console.log(`Translated sponsor: ${sponsor.name}`);
                    }
                } catch (error) {
                    console.error(`Error translating sponsor ${sponsor._id}:`, error);
                    results.sponsors.errors++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Toplu çeviri tamamlandı',
            results
        });

    } catch (error) {
        console.error('Batch translation error:', error);
        return NextResponse.json({
            error: 'Toplu çeviri sırasında hata oluştu: ' + (error as Error).message
        }, { status: 500 });
    }
}

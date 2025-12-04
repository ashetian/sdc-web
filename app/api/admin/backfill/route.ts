import { NextResponse } from 'next/server';
import { Announcement } from '@/app/lib/models/Announcement';
import { Event } from '@/app/lib/models/Event';
import Department from '@/app/lib/models/Department';
import TeamMember from '@/app/lib/models/TeamMember';
import { Stat } from '@/app/lib/models/Stat';
import { translateContent, translateDate } from '@/app/lib/translate';
import connectDB from '@/app/lib/db';

// Helper to delay between API calls to avoid rate limiting
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Translate a single field with retry on rate limit
async function translateWithRetry(text: string, maxRetries = 3): Promise<string | null> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await translateContent(text, 'tr');
            // Check if translation actually happened (not same as input)
            if (result.en && result.en !== text) {
                return result.en;
            }
            return result.en;
        } catch (e) {
            const error = e as Error;
            if (error.message.includes('429') && i < maxRetries - 1) {
                // Rate limited - wait longer and retry
                console.log(`Rate limited, waiting ${(i + 1) * 2}s before retry...`);
                await sleep((i + 1) * 2000);
            } else {
                throw e;
            }
        }
    }
    return null;
}

export async function GET() {
    const results = {
        announcements: { updated: 0, skipped: 0 },
        events: { updated: 0, skipped: 0 },
        departments: { updated: 0, skipped: 0 },
        teamMembers: { updated: 0, skipped: 0 },
        stats: { updated: 0, skipped: 0 },
        errors: [] as string[]
    };

    try {
        await connectDB();

        // 1. Backfill Announcements - only those without valid English translations
        const announcements = await Announcement.find({
            $or: [
                { titleEn: { $exists: false } },
                { titleEn: null },
                { titleEn: '' },
                // Also check if titleEn equals title (not translated)
                { $expr: { $eq: ['$titleEn', '$title'] } }
            ]
        });

        console.log(`Found ${announcements.length} announcements to translate`);

        for (const doc of announcements) {
            try {
                console.log(`Translating announcement: ${doc.slug}`);

                const titleEn = await translateWithRetry(doc.title);
                await sleep(1000); // Wait 1s between fields

                const descEn = await translateWithRetry(doc.description);
                await sleep(1000);

                const contentEn = await translateWithRetry(doc.content);

                if (titleEn && descEn && contentEn) {
                    doc.titleEn = titleEn;
                    doc.descriptionEn = descEn;
                    doc.contentEn = contentEn;

                    if (doc.galleryDescription) {
                        await sleep(1000);
                        const galleryDescEn = await translateWithRetry(doc.galleryDescription);
                        if (galleryDescEn) doc.galleryDescriptionEn = galleryDescEn;
                    }

                    // Translate date (no API needed)
                    if (doc.date) {
                        doc.dateEn = translateDate(doc.date);
                    }

                    await doc.save();
                    results.announcements.updated++;
                } else {
                    results.announcements.skipped++;
                }

                await sleep(2000); // Wait 2s between documents
            } catch (e) {
                results.errors.push(`Announcement ${doc.slug}: ${e}`);
            }
        }

        // 2. Backfill Events
        const events = await Event.find({
            $or: [
                { titleEn: { $exists: false } },
                { titleEn: null },
                { titleEn: '' }
            ]
        });

        for (const doc of events) {
            try {
                const titleEn = await translateWithRetry(doc.title);
                await sleep(1000);
                const descEn = await translateWithRetry(doc.description);

                if (titleEn && descEn) {
                    doc.titleEn = titleEn;
                    doc.descriptionEn = descEn;
                    await doc.save();
                    results.events.updated++;
                } else {
                    results.events.skipped++;
                }

                await sleep(2000);
            } catch (e) {
                results.errors.push(`Event ${doc.title}: ${e}`);
            }
        }

        // 3. Backfill Departments
        const departments = await Department.find({
            $or: [
                { nameEn: { $exists: false } },
                { nameEn: null },
                { nameEn: '' }
            ]
        });

        for (const doc of departments) {
            try {
                const nameEn = await translateWithRetry(doc.name);
                await sleep(1000);
                const descEn = await translateWithRetry(doc.description);

                if (nameEn && descEn) {
                    doc.nameEn = nameEn;
                    doc.descriptionEn = descEn;
                    await doc.save();
                    results.departments.updated++;
                } else {
                    results.departments.skipped++;
                }

                await sleep(2000);
            } catch (e) {
                results.errors.push(`Department ${doc.name}: ${e}`);
            }
        }

        // 4. Backfill TeamMembers
        const teamMembers = await TeamMember.find({
            title: { $exists: true, $ne: null, $ne: '' },
            $or: [
                { titleEn: { $exists: false } },
                { titleEn: null },
                { titleEn: '' }
            ]
        });

        for (const doc of teamMembers) {
            try {
                if (doc.title) {
                    const titleEn = await translateWithRetry(doc.title);
                    if (titleEn) {
                        doc.titleEn = titleEn;

                        if (doc.description) {
                            await sleep(1000);
                            const descEn = await translateWithRetry(doc.description);
                            if (descEn) doc.descriptionEn = descEn;
                        }

                        await doc.save();
                        results.teamMembers.updated++;
                    } else {
                        results.teamMembers.skipped++;
                    }
                }

                await sleep(2000);
            } catch (e) {
                results.errors.push(`TeamMember ${doc.name}: ${e}`);
            }
        }

        // 5. Backfill Stats
        const stats = await Stat.find({
            $or: [
                { labelEn: { $exists: false } },
                { labelEn: null },
                { labelEn: '' }
            ]
        });

        for (const doc of stats) {
            try {
                const labelEn = await translateWithRetry(doc.label);

                if (labelEn) {
                    doc.labelEn = labelEn;
                    await doc.save();
                    results.stats.updated++;
                } else {
                    results.stats.skipped++;
                }

                await sleep(2000);
            } catch (e) {
                results.errors.push(`Stat ${doc.key}: ${e}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Backfill complete',
            results
        });
    } catch (error) {
        console.error('Backfill error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error',
            partial: results
        }, { status: 500 });
    }
}

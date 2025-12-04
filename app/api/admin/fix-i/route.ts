import { NextResponse } from 'next/server';
import { Announcement } from '@/app/lib/models/Announcement';
import { Event } from '@/app/lib/models/Event';
import Department from '@/app/lib/models/Department';
import TeamMember from '@/app/lib/models/TeamMember';
import { Stat } from '@/app/lib/models/Stat';
import connectDB from '@/app/lib/db';

// Fix Turkish İ and ı in all English fields across all models
export async function GET() {
    try {
        await connectDB();
        const results = { announcements: 0, events: 0, departments: 0, teamMembers: 0, stats: 0 };
        const fixedItems: string[] = [];

        // Helper function to sanitize
        const sanitize = (text: string) => text.replace(/İ/g, 'I').replace(/ı/g, 'i');

        // Fix Announcements
        const announcements = await Announcement.find({}).lean();
        for (const doc of announcements) {
            const updates: Record<string, string> = {};

            if (doc.titleEn && /[İı]/.test(doc.titleEn)) {
                updates.titleEn = sanitize(doc.titleEn);
            }
            if (doc.descriptionEn && /[İı]/.test(doc.descriptionEn)) {
                updates.descriptionEn = sanitize(doc.descriptionEn);
            }
            if (doc.contentEn && /[İı]/.test(doc.contentEn)) {
                updates.contentEn = sanitize(doc.contentEn);
            }
            if (doc.galleryDescriptionEn && /[İı]/.test(doc.galleryDescriptionEn)) {
                updates.galleryDescriptionEn = sanitize(doc.galleryDescriptionEn);
            }

            if (Object.keys(updates).length > 0) {
                await Announcement.findByIdAndUpdate(doc._id, { $set: updates });
                results.announcements++;
                fixedItems.push(`Announcement: ${doc.slug}`);
            }
        }

        // Fix Events
        const events = await Event.find({}).lean();
        for (const doc of events) {
            const updates: Record<string, string> = {};

            if (doc.titleEn && /[İı]/.test(doc.titleEn)) {
                updates.titleEn = sanitize(doc.titleEn);
            }
            if (doc.descriptionEn && /[İı]/.test(doc.descriptionEn)) {
                updates.descriptionEn = sanitize(doc.descriptionEn);
            }

            if (Object.keys(updates).length > 0) {
                await Event.findByIdAndUpdate(doc._id, { $set: updates });
                results.events++;
                fixedItems.push(`Event: ${doc.title}`);
            }
        }

        // Fix Departments
        const departments = await Department.find({}).lean();
        for (const doc of departments) {
            const updates: Record<string, string> = {};

            if (doc.nameEn && /[İı]/.test(doc.nameEn)) {
                updates.nameEn = sanitize(doc.nameEn);
            }
            if (doc.descriptionEn && /[İı]/.test(doc.descriptionEn)) {
                updates.descriptionEn = sanitize(doc.descriptionEn);
            }

            if (Object.keys(updates).length > 0) {
                await Department.findByIdAndUpdate(doc._id, { $set: updates });
                results.departments++;
                fixedItems.push(`Department: ${doc.name}`);
            }
        }

        // Fix Team Members
        const teamMembers = await TeamMember.find({}).lean();
        for (const doc of teamMembers) {
            const updates: Record<string, string> = {};

            if (doc.titleEn && /[İı]/.test(doc.titleEn)) {
                updates.titleEn = sanitize(doc.titleEn);
            }
            if (doc.descriptionEn && /[İı]/.test(doc.descriptionEn)) {
                updates.descriptionEn = sanitize(doc.descriptionEn);
            }

            if (Object.keys(updates).length > 0) {
                await TeamMember.findByIdAndUpdate(doc._id, { $set: updates });
                results.teamMembers++;
                fixedItems.push(`Team: ${doc.name}`);
            }
        }

        // Fix Stats
        const stats = await Stat.find({}).lean();
        for (const doc of stats) {
            if (doc.labelEn && /[İı]/.test(doc.labelEn)) {
                await Stat.findByIdAndUpdate(doc._id, {
                    $set: { labelEn: sanitize(doc.labelEn) }
                });
                results.stats++;
                fixedItems.push(`Stat: ${doc.key}`);
            }
        }

        return NextResponse.json({
            success: true,
            results,
            fixed: fixedItems
        });
    } catch (error) {
        console.error('Fix error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

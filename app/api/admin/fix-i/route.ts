import { NextResponse } from 'next/server';
import { Announcement } from '@/app/lib/models/Announcement';
import { Event } from '@/app/lib/models/Event';
import Department from '@/app/lib/models/Department';
import TeamMember from '@/app/lib/models/TeamMember';
import { Stat } from '@/app/lib/models/Stat';
import connectDB from '@/app/lib/db';

// Force fix ALL English fields - replace İ→I and ı→i regardless of detection
export async function GET() {
    try {
        await connectDB();
        const results = { announcements: 0, events: 0, departments: 0, teamMembers: 0, stats: 0 };

        // Helper function to sanitize - always run replacement
        const sanitize = (text: string | undefined | null) => {
            if (!text) return text;
            return text.replace(/İ/g, 'I').replace(/ı/g, 'i');
        };

        // Update ALL Announcements - force update all English fields
        const announcements = await Announcement.find({});
        for (const doc of announcements) {
            if (doc.titleEn || doc.descriptionEn || doc.contentEn || doc.galleryDescriptionEn) {
                doc.titleEn = sanitize(doc.titleEn);
                doc.descriptionEn = sanitize(doc.descriptionEn);
                doc.contentEn = sanitize(doc.contentEn);
                doc.galleryDescriptionEn = sanitize(doc.galleryDescriptionEn);
                await doc.save();
                results.announcements++;
            }
        }

        // Update ALL Events
        const events = await Event.find({});
        for (const doc of events) {
            if (doc.titleEn || doc.descriptionEn) {
                doc.titleEn = sanitize(doc.titleEn);
                doc.descriptionEn = sanitize(doc.descriptionEn);
                await doc.save();
                results.events++;
            }
        }

        // Update ALL Departments
        const departments = await Department.find({});
        for (const doc of departments) {
            if (doc.nameEn || doc.descriptionEn) {
                doc.nameEn = sanitize(doc.nameEn);
                doc.descriptionEn = sanitize(doc.descriptionEn);
                await doc.save();
                results.departments++;
            }
        }

        // Update ALL Team Members
        const teamMembers = await TeamMember.find({});
        for (const doc of teamMembers) {
            if (doc.titleEn || doc.descriptionEn) {
                doc.titleEn = sanitize(doc.titleEn);
                doc.descriptionEn = sanitize(doc.descriptionEn);
                await doc.save();
                results.teamMembers++;
            }
        }

        // Update ALL Stats
        const stats = await Stat.find({});
        for (const doc of stats) {
            if (doc.labelEn) {
                doc.labelEn = sanitize(doc.labelEn);
                await doc.save();
                results.stats++;
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Force updated all English fields with İ→I sanitization',
            results
        });
    } catch (error) {
        console.error('Fix error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { Announcement } from '@/app/lib/models/Announcement';
import Department from '@/app/lib/models/Department';
import TeamMember from '@/app/lib/models/TeamMember';
import { Stat } from '@/app/lib/models/Stat';
import connectDB from '@/app/lib/db';

// Clear all English fields so backfill can re-translate
export async function GET() {
    try {
        await connectDB();

        // Clear announcements English fields where titleEn equals title (not translated)
        const annResult = await Announcement.updateMany(
            {},
            { $unset: { titleEn: '', descriptionEn: '', contentEn: '', galleryDescriptionEn: '' } }
        );

        // Clear departments
        const deptResult = await Department.updateMany(
            {},
            { $unset: { nameEn: '', descriptionEn: '' } }
        );

        // Clear team members
        const teamResult = await TeamMember.updateMany(
            {},
            { $unset: { titleEn: '', descriptionEn: '' } }
        );

        // Clear stats
        const statResult = await Stat.updateMany(
            {},
            { $unset: { labelEn: '' } }
        );

        return NextResponse.json({
            success: true,
            message: 'All English fields cleared',
            cleared: {
                announcements: annResult.modifiedCount,
                departments: deptResult.modifiedCount,
                teamMembers: teamResult.modifiedCount,
                stats: statResult.modifiedCount
            }
        });
    } catch (error) {
        console.error('Clear error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

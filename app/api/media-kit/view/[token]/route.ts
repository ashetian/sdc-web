import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import MediaKitToken from '@/app/lib/models/MediaKitToken';
import MediaKitSettings from '@/app/lib/models/MediaKitSettings';
import Member from '@/app/lib/models/Member';
import { Event } from '@/app/lib/models/Event';
import { Registration } from '@/app/lib/models/Registration';
import Project from '@/app/lib/models/Project';
import { Announcement } from '@/app/lib/models/Announcement';
import Sponsor from '@/app/lib/models/Sponsor';
import TeamMember from '@/app/lib/models/TeamMember';
import Department from '@/app/lib/models/Department';

// GET - Public media kit page data (token required)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        await connectDB();
        const { token } = await params;

        // Find and validate token
        const mediaKitToken = await MediaKitToken.findOne({ token });

        if (!mediaKitToken) {
            return NextResponse.json({ error: 'invalid_token' }, { status: 404 });
        }

        if (!mediaKitToken.isActive) {
            return NextResponse.json({ error: 'token_inactive' }, { status: 403 });
        }

        if (mediaKitToken.expiresAt < new Date()) {
            return NextResponse.json({ error: 'token_expired' }, { status: 403 });
        }

        // Update view count and last viewed
        await MediaKitToken.findByIdAndUpdate(mediaKitToken._id, {
            $inc: { viewCount: 1 },
            lastViewedAt: new Date(),
        });

        // Calculate semester start (roughly: Sept 1 for fall, Feb 1 for spring)
        const now = new Date();
        const month = now.getMonth();
        let semesterStart: Date;
        if (month >= 8) { // Sept-Dec: Fall semester
            semesterStart = new Date(now.getFullYear(), 8, 1);
        } else if (month >= 1) { // Feb-Aug: Spring semester
            semesterStart = new Date(now.getFullYear(), 1, 1);
        } else { // Jan: Still fall semester from previous year
            semesterStart = new Date(now.getFullYear() - 1, 8, 1);
        }

        // Fetch live statistics
        const [
            totalMembers,
            activeMembers,
            semesterEvents,
            eventTypeAnnouncements,
            totalRegistrations,
            activeProjects,
            totalAnnouncements,
            sponsors,
            boardMembers,
            departments,
        ] = await Promise.all([
            Member.countDocuments(),
            Member.countDocuments({ isActive: true }),
            Event.countDocuments({ eventDate: { $gte: semesterStart } }),
            Announcement.countDocuments({ type: 'event', createdAt: { $gte: semesterStart }, $or: [{ eventId: { $exists: false } }, { eventId: null }, { eventId: '' }] }),
            Registration.countDocuments(),
            Project.countDocuments({ status: 'active' }),
            Announcement.countDocuments({ isActive: true }),
            Sponsor.find({ isActive: true }).sort({ order: 1 }).select('name nameEn logo'),
            // Board members (president, vice_president, secretary, treasurer, board_member)
            TeamMember.find({
                isActive: true,
                showInTeam: true,
                role: { $in: ['president', 'vice_president', 'secretary', 'treasurer', 'board_member'] }
            }).populate('memberId', 'department').sort({ order: 1 }).select('name photo role title titleEn memberId email phone linkedin'),
            // Active departments with full info
            Department.find({ isActive: true }).sort({ order: 1 }).select('name nameEn slug description descriptionEn icon color'),
        ]);

        // Get department heads with member info for university department
        const departmentHeads = await TeamMember.find({
            isActive: true,
            showInTeam: true,
            role: 'head',
            departmentId: { $in: departments.map(d => d._id) }
        }).populate('departmentId', 'name nameEn slug')
            .populate('memberId', 'department')
            .sort({ order: 1 })
            .select('name photo role title titleEn departmentId memberId');

        // Calculate total event participation this semester
        const semesterEventIds = await Event.find({ eventDate: { $gte: semesterStart } }).select('_id');
        const semesterParticipants = await Registration.countDocuments({
            eventId: { $in: semesterEventIds.map(e => e._id) }
        });

        // Get gallery images from announcements marked as gallery
        // Note: isDraft filter removed - gallery items should show regardless of draft status
        const galleryAnnouncements = await Announcement.find({
            isInGallery: true
        }).select('galleryLinks galleryCover');

        // Flatten all gallery images into a single array
        const galleryImages: string[] = [];
        galleryAnnouncements.forEach(a => {
            if (a.galleryCover) galleryImages.push(a.galleryCover);
            if (a.galleryLinks?.length) {
                // Only include images, not videos
                a.galleryLinks.forEach((link: string) => {
                    if (link.match(/\.(jpeg|jpg|gif|png|webp)$/i) || link.includes('image/upload')) {
                        galleryImages.push(link);
                    }
                });
            }
        });

        // Shuffle images randomly (Fisher-Yates shuffle)
        for (let i = galleryImages.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [galleryImages[i], galleryImages[j]] = [galleryImages[j], galleryImages[i]];
        }

        // Fetch global media kit settings for pages
        const globalSettings = await MediaKitSettings.findOne();

        // Fetch pages with their events from global settings
        interface PageWithEvents {
            _id: string;
            title: string;
            titleEn?: string;
            events: Array<{
                _id: string;
                title: string;
                titleEn?: string;
                galleryCover?: string;
                galleryLinks?: string[];
            }>;
        }

        const pagesWithEvents: PageWithEvents[] = [];

        if (globalSettings?.pages && globalSettings.pages.length > 0) {
            for (const page of globalSettings.pages) {
                // Fetch selected events - show regardless of draft status
                // Only require that the event has gallery content
                const events = await Announcement.find({
                    _id: { $in: page.eventIds },
                    galleryLinks: { $exists: true, $not: { $size: 0 } }
                }).select('title titleEn galleryCover galleryLinks').lean();

                pagesWithEvents.push({
                    _id: String(page._id),
                    title: page.title,
                    titleEn: page.titleEn,
                    events: events.map(e => ({
                        _id: String(e._id),
                        title: e.title,
                        titleEn: e.titleEn,
                        galleryCover: e.galleryCover,
                        galleryLinks: e.galleryLinks
                    }))
                });
            }
        }

        return NextResponse.json({
            sponsorName: mediaKitToken.sponsorName,
            defaultLanguage: mediaKitToken.defaultLanguage || 'tr',
            pageTitle: globalSettings?.pageTitle,
            pageTitleEn: globalSettings?.pageTitleEn,
            stats: {
                totalMembers,
                activeMembers,
                semesterEvents: semesterEvents + eventTypeAnnouncements,
                totalRegistrations,
                semesterParticipants,
                activeProjects,
                totalAnnouncements,
            },
            currentSponsors: sponsors,
            boardMembers,
            departments,
            departmentHeads,
            galleryImages: galleryImages.slice(0, 60), // Balanced limit for performance
            pages: pagesWithEvents,
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Media kit data fetch error:', error);
        return NextResponse.json({ error: 'Veriler getirilemedi' }, { status: 500 });
    }
}

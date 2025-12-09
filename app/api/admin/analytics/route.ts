import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Member from '@/app/lib/models/Member';
import { Event } from '@/app/lib/models/Event';
import { Registration } from '@/app/lib/models/Registration';
import { Announcement } from '@/app/lib/models/Announcement';
import Project from '@/app/lib/models/Project';
import ForumTopic from '@/app/lib/models/ForumTopic';
import ForumReply from '@/app/lib/models/ForumReply';
import Comment from '@/app/lib/models/Comment';
import { verifyAuth } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        await connectDB();

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // ========== MEMBER METRICS ==========
        const totalMembers = await Member.countDocuments();
        const activeMembers = await Member.countDocuments({ isActive: true });
        const registeredMembers = await Member.countDocuments({ isRegistered: true });
        const emailConsentMembers = await Member.countDocuments({ emailConsent: true });
        const activeLastWeek = await Member.countDocuments({ lastLogin: { $gte: sevenDaysAgo } });
        const activeLastMonth = await Member.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } });

        // New members this month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newMembersThisMonth = await Member.countDocuments({ createdAt: { $gte: startOfMonth } });

        // ========== EVENT METRICS ==========
        const totalEvents = await Event.countDocuments();
        const completedEvents = await Event.countDocuments({ isEnded: true });
        const openEvents = await Event.countDocuments({ isOpen: true, isEnded: false });

        // Total registrations and attendance
        const totalRegistrations = await Registration.countDocuments();
        const totalAttendance = await Registration.countDocuments({ attendedAt: { $exists: true } });

        // Average rating
        const ratingAgg = await Registration.aggregate([
            { $match: { rating: { $exists: true, $ne: null } } },
            { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
        const averageRating = ratingAgg[0]?.avgRating || 0;
        const ratingCount = ratingAgg[0]?.count || 0;

        // Total event duration (from completed events with actualDuration)
        const durationAgg = await Event.aggregate([
            { $match: { actualDuration: { $exists: true, $ne: null } } },
            { $group: { _id: null, totalDuration: { $sum: '$actualDuration' } } }
        ]);
        const totalEventDuration = durationAgg[0]?.totalDuration || 0;

        // ========== CONTENT METRICS ==========
        const totalAnnouncements = await Announcement.countDocuments();
        const announcementsByType = await Announcement.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        const totalProjects = await Project.countDocuments({ isDeleted: false });
        const approvedProjects = await Project.countDocuments({ status: 'approved', isDeleted: false });
        const pendingProjects = await Project.countDocuments({ status: 'pending', isDeleted: false });

        const totalForumTopics = await ForumTopic.countDocuments({ isDeleted: false });
        const totalForumReplies = await ForumReply.countDocuments({ isDeleted: false });
        const totalComments = await Comment.countDocuments({ isDeleted: false });

        // ========== MONTHLY TRENDS (Last 12 months) ==========
        const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

        // Member registration trend
        const memberTrend = await Member.aggregate([
            { $match: { createdAt: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Event attendance trend
        const attendanceTrend = await Registration.aggregate([
            { $match: { attendedAt: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$attendedAt' }, month: { $month: '$attendedAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Active users trend (by lastLogin)
        const activeUsersTrend = await Member.aggregate([
            { $match: { lastLogin: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$lastLogin' }, month: { $month: '$lastLogin' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Format trends into arrays with month labels
        const formatTrend = (trend: any[]) => {
            const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
            return trend.map(item => ({
                label: `${months[item._id.month - 1]} ${item._id.year}`,
                value: item.count
            }));
        };

        return NextResponse.json({
            members: {
                total: totalMembers,
                active: activeMembers,
                registered: registeredMembers,
                emailConsent: emailConsentMembers,
                activeLastWeek,
                activeLastMonth,
                newThisMonth: newMembersThisMonth,
            },
            events: {
                total: totalEvents,
                completed: completedEvents,
                open: openEvents,
                totalRegistrations,
                totalAttendance,
                averageRating: Math.round(averageRating * 10) / 10,
                ratingCount,
                totalDurationMinutes: totalEventDuration,
                totalDurationHours: Math.round(totalEventDuration / 60 * 10) / 10,
            },
            content: {
                announcements: {
                    total: totalAnnouncements,
                    byType: announcementsByType.reduce((acc, item) => {
                        acc[item._id] = item.count;
                        return acc;
                    }, {} as Record<string, number>),
                },
                projects: {
                    total: totalProjects,
                    approved: approvedProjects,
                    pending: pendingProjects,
                },
                forum: {
                    topics: totalForumTopics,
                    replies: totalForumReplies,
                },
                comments: totalComments,
            },
            trends: {
                memberRegistrations: formatTrend(memberTrend),
                eventAttendance: formatTrend(attendanceTrend),
                activeUsers: formatTrend(activeUsersTrend),
            },
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json(
            { error: 'Analitik verileri alınırken bir hata oluştu' },
            { status: 500 }
        );
    }
}

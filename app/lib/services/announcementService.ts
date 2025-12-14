import connectDB from '@/app/lib/db';
import { Announcement } from '@/app/lib/models/Announcement';

// Tarih ayrıştırma yardımcı fonksiyonu
export function parseDate(dateStr: string): number {
    try {
        // Türkçe ay isimleri haritası
        const turkishMonths: { [key: string]: number } = {
            'ocak': 0, 'şubat': 1, 'mart': 2, 'nisan': 3, 'mayıs': 4, 'haziran': 5,
            'temmuz': 6, 'ağustos': 7, 'eylül': 8, 'ekim': 9, 'kasım': 10, 'aralık': 11,
            'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
            'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
        };

        // Normalize string: lowercase and trim
        const normalized = dateStr.toLowerCase().trim();

        // 1. Format: "1 Nisan 2024" veya "1 April 2024"
        const parts = normalized.split(/\s+/);
        if (parts.length >= 3) {
            const day = parseInt(parts[0]);
            const monthStr = parts[1];
            const year = parseInt(parts[2]);

            if (!isNaN(day) && !isNaN(year) && turkishMonths[monthStr] !== undefined) {
                return new Date(year, turkishMonths[monthStr], day).getTime();
            }
        }

        // 2. Format: Standart tarih formatları (YYYY-MM-DD, vb.)
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.getTime();
        }

        return 0; // Ayrıştırılamayan tarihler en sona
    } catch (e) {
        return 0;
    }
}

export type AnnouncementFilter = {
    activeOnly?: boolean;
    type?: string;
    page?: number;
    limit?: number;
};

export async function getAnnouncements(filter: AnnouncementFilter = {}) {
    await connectDB();

    const { activeOnly, type, page = 1, limit = 0 } = filter;

    // Build query
    const query: any = {};
    if (activeOnly) {
        query.isDraft = { $ne: true };
        query.isArchived = { $ne: true };
    }
    if (type) {
        query.type = type;
    }

    // Get total count
    const total = await Announcement.countDocuments(query);

    // DB Level sorting
    const announcements = await Announcement.find(query)
        .sort({ dateObj: -1, createdAt: -1 })
        .skip(limit > 0 ? (page - 1) * limit : 0)
        .limit(limit > 0 ? limit : 0)
        .lean();

    // Enhancement: Check event status for announcements linked to events
    const eventIds = announcements
        .filter((a: any) => a.eventId)
        .map((a: any) => a.eventId);

    if (eventIds.length > 0) {
        const { Event } = await import('@/app/lib/models/Event');
        const formattedIds = eventIds.filter((id: string) => id.match(/^[0-9a-fA-F]{24}$/)); // Ensure valid ObjectIds

        if (formattedIds.length > 0) {
            const events = await Event.find({
                _id: { $in: formattedIds }
            }).select('_id isOpen isEnded').lean();

            const eventStatusMap = new Map();
            events.forEach((e: any) => {
                eventStatusMap.set(e._id.toString(), { isOpen: e.isOpen, isEnded: e.isEnded });
            });

            // Update announcements: remove eventId if event is closed or ended
            announcements.forEach((a: any) => {
                if (a.eventId) {
                    const status = eventStatusMap.get(a.eventId.toString());
                    // If event is not found, or is not open, or is ended -> remove eventId to hide register button
                    if (!status || !status.isOpen || status.isEnded) {
                        delete a.eventId;
                    }
                }
            });
        }
    }

    // Serialize Mongoose objects deeply (handles nested ObjectIds in contentBlocks)
    const serialized = JSON.parse(JSON.stringify(announcements));

    if (limit > 0) {
        const totalPages = Math.ceil(total / limit);
        return {
            items: serialized,
            total,
            page,
            totalPages,
            hasMore: page < totalPages,
        };
    }

    return serialized;
}

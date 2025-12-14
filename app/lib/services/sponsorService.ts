import connectDB from '@/app/lib/db';
import Sponsor from '@/app/lib/models/Sponsor';

export async function getSponsors({ activeOnly = true }: { activeOnly?: boolean } = {}) {
    await connectDB();

    const query = activeOnly ? { isActive: true } : {};
    const sponsors = await Sponsor.find(query).sort({ order: 1 }).lean();

    // Serialize Mongoose objects deeply
    return JSON.parse(JSON.stringify(sponsors));
}

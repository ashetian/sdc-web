import mongoose from 'mongoose';
import { Announcement } from '../app/lib/models/Announcement';
import * as fs from 'fs';
import * as path from 'path';

// Manual .env parsing
let MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/MONGODB_URI=(.*)/);
        if (match && match[1]) {
            MONGODB_URI = match[1].trim().replace(/^["']|["']$/g, '');
        }
    } catch (e) {
        console.warn('Could not read .env file');
    }
}
MONGODB_URI = MONGODB_URI || 'mongodb://localhost:27017/sdc-web';

// Helper to parse date string
function parseDate(dateStr: string): Date | null {
    try {
        const turkishMonths: { [key: string]: number } = {
            'ocak': 0, 'şubat': 1, 'mart': 2, 'nisan': 3, 'mayıs': 4, 'haziran': 5,
            'temmuz': 6, 'ağustos': 7, 'eylül': 8, 'ekim': 9, 'kasım': 10, 'aralık': 11,
            'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
            'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
        };

        const normalized = dateStr.toLowerCase().trim();
        const parts = normalized.split(/\s+/);

        if (parts.length >= 3) {
            const day = parseInt(parts[0]);
            const monthStr = parts[1];
            const year = parseInt(parts[2]);

            if (!isNaN(day) && !isNaN(year) && turkishMonths[monthStr] !== undefined) {
                return new Date(year, turkishMonths[monthStr], day);
            }
        }

        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date;
        }

        return null;
    } catch (e) {
        return null;
    }
}

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB');

        const announcements = await Announcement.find({});
        console.log(`Found ${announcements.length} announcements`);

        let updated = 0;
        for (const a of announcements) {
            const dateObj = parseDate(a.date);
            if (dateObj) {
                a.dateObj = dateObj;
                await a.save();
                updated++;
                process.stdout.write('.');
            } else {
                console.warn(`\nCould not parse date for: ${a.title} (${a.date})`);
                // Fallback to createdAt if date parse fails
                a.dateObj = a.createdAt;
                await a.save();
                updated++;
            }
        }

        console.log(`\nUpdated ${updated} announcements`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();

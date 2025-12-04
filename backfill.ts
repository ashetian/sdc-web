import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { Announcement } from './app/lib/models/Announcement';
import { Event } from './app/lib/models/Event';
import { translateFields } from './app/lib/translate';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env file');
    process.exit(1);
}

async function backfillTranslations() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB');

        // 1. Backfill Announcements
        const announcements = await Announcement.find({
            $or: [
                { titleEn: { $exists: false } },
                { titleEn: '' },
                { descriptionEn: { $exists: false } },
                { descriptionEn: '' }
            ]
        });

        console.log(`Found ${announcements.length} announcements to translate.`);

        for (const announcement of announcements) {
            console.log(`Translating announcement: ${announcement.title}`);

            const translations = await translateFields({
                title: announcement.title,
                description: announcement.description,
                content: announcement.content,
                galleryDescription: announcement.galleryDescription || ''
            }, 'tr');

            announcement.titleEn = translations.title?.en || announcement.title;
            announcement.descriptionEn = translations.description?.en || announcement.description;
            announcement.contentEn = translations.content?.en || announcement.content;
            if (announcement.galleryDescription) {
                announcement.galleryDescriptionEn = translations.galleryDescription?.en || announcement.galleryDescription;
            }

            await announcement.save();
            console.log(`Saved translation for: ${announcement.title}`);
        }

        // 2. Backfill Events
        const events = await Event.find({
            $or: [
                { titleEn: { $exists: false } },
                { titleEn: '' },
                { descriptionEn: { $exists: false } },
                { descriptionEn: '' }
            ]
        });

        console.log(`Found ${events.length} events to translate.`);

        for (const event of events) {
            console.log(`Translating event: ${event.title}`);

            const translations = await translateFields({
                title: event.title,
                description: event.description
            }, 'tr');

            event.titleEn = translations.title?.en || event.title;
            event.descriptionEn = translations.description?.en || event.description;

            await event.save();
            console.log(`Saved translation for: ${event.title}`);
        }

        console.log('Backfill complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error backfilling translations:', error);
        process.exit(1);
    }
}

backfillTranslations();

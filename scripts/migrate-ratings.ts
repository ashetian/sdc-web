// Migration script to convert 5-star ratings to 10-star ratings
// Run this script once after deployment: npx tsx scripts/migrate-ratings.ts
// Make sure MONGODB_URI is set in your environment

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in environment variables');
    console.error('Run with: MONGODB_URI=your_uri npx tsx scripts/migrate-ratings.ts');
    process.exit(1);
}

async function migrateRatings() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not established');
        }

        // Migration for Registration collection
        const registrationResult = await db.collection('registrations').updateMany(
            { rating: { $exists: true, $lte: 5 } },
            [{ $set: { rating: { $multiply: ['$rating', 2] } } }]
        );
        console.log(`Registrations migrated: ${registrationResult.modifiedCount}`);

        // Migration for GuestRegistration collection
        const guestRegistrationResult = await db.collection('guestregistrations').updateMany(
            { rating: { $exists: true, $lte: 5 } },
            [{ $set: { rating: { $multiply: ['$rating', 2] } } }]
        );
        console.log(`GuestRegistrations migrated: ${guestRegistrationResult.modifiedCount}`);

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

migrateRatings();

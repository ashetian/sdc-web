// Script to seed initial stats data
// Run with: npx tsx scripts/seed-stats.ts

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sdc-web';

interface IStat {
    key: string;
    label: string;
    value: string;
    color: string;
    order: number;
    isActive: boolean;
}

const statSchema = new mongoose.Schema<IStat>(
    {
        key: { type: String, required: true, unique: true },
        label: { type: String, required: true },
        value: { type: String, required: true },
        color: { type: String, required: true, default: 'bg-neo-blue' },
        order: { type: Number, required: true, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Stat = mongoose.models.Stat || mongoose.model<IStat>('Stat', statSchema);

const initialStats = [
    {
        key: 'members',
        label: 'Üye',
        value: '220+',
        color: 'bg-neo-green',
        order: 0,
        isActive: true,
    },
    {
        key: 'projects',
        label: 'Proje',
        value: '2',
        color: 'bg-neo-purple',
        order: 1,
        isActive: true,
    },
    {
        key: 'events',
        label: 'Etkinlik',
        value: '12',
        color: 'bg-neo-orange',
        order: 2,
        isActive: true,
    },
];

async function seedStats() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if stats already exist
        const existingStats = await Stat.countDocuments();
        if (existingStats > 0) {
            console.log(`Found ${existingStats} existing stats. Skipping seed.`);
            console.log('To re-seed, first delete existing stats from the database.');
            await mongoose.connection.close();
            return;
        }

        console.log('Seeding initial stats...');
        await Stat.insertMany(initialStats);
        console.log(`Successfully seeded ${initialStats.length} stats!`);

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding stats:', error);
        process.exit(1);
    }
}

seedStats();

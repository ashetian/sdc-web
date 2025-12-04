import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/app/lib/db';

// Use MongoDB native driver to replace characters directly
export async function GET() {
    try {
        await connectDB();
        const db = mongoose.connection.db;
        if (!db) {
            return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
        }

        const results: Record<string, number> = {};

        // Turkish İ (U+0130) and ı (U+0131)
        const turkishI = String.fromCharCode(0x0130);
        const turkishDotlessI = String.fromCharCode(0x0131);

        // Fix Announcements
        const annCollection = db.collection('announcements');
        const announcements = await annCollection.find({}).toArray();
        let annCount = 0;

        for (const doc of announcements) {
            const updates: Record<string, string> = {};

            for (const field of ['titleEn', 'descriptionEn', 'contentEn', 'galleryDescriptionEn']) {
                const val = doc[field];
                if (typeof val === 'string' && (val.includes(turkishI) || val.includes(turkishDotlessI))) {
                    updates[field] = val.split(turkishI).join('I').split(turkishDotlessI).join('i');
                }
            }

            if (Object.keys(updates).length > 0) {
                await annCollection.updateOne({ _id: doc._id }, { $set: updates });
                annCount++;
            }
        }
        results.announcements = annCount;

        // Fix Departments
        const deptCollection = db.collection('departments');
        const departments = await deptCollection.find({}).toArray();
        let deptCount = 0;

        for (const doc of departments) {
            const updates: Record<string, string> = {};

            for (const field of ['nameEn', 'descriptionEn']) {
                const val = doc[field];
                if (typeof val === 'string' && (val.includes(turkishI) || val.includes(turkishDotlessI))) {
                    updates[field] = val.split(turkishI).join('I').split(turkishDotlessI).join('i');
                }
            }

            if (Object.keys(updates).length > 0) {
                await deptCollection.updateOne({ _id: doc._id }, { $set: updates });
                deptCount++;
            }
        }
        results.departments = deptCount;

        // Fix Stats
        const statsCollection = db.collection('stats');
        const stats = await statsCollection.find({}).toArray();
        let statsCount = 0;

        for (const doc of stats) {
            const val = doc.labelEn;
            if (typeof val === 'string' && (val.includes(turkishI) || val.includes(turkishDotlessI))) {
                const newVal = val.split(turkishI).join('I').split(turkishDotlessI).join('i');
                await statsCollection.updateOne({ _id: doc._id }, { $set: { labelEn: newVal } });
                statsCount++;
            }
        }
        results.stats = statsCount;

        // Fix TeamMembers
        const teamCollection = db.collection('teammembers');
        const teamMembers = await teamCollection.find({}).toArray();
        let teamCount = 0;

        for (const doc of teamMembers) {
            const updates: Record<string, string> = {};

            for (const field of ['titleEn', 'descriptionEn']) {
                const val = doc[field];
                if (typeof val === 'string' && (val.includes(turkishI) || val.includes(turkishDotlessI))) {
                    updates[field] = val.split(turkishI).join('I').split(turkishDotlessI).join('i');
                }
            }

            if (Object.keys(updates).length > 0) {
                await teamCollection.updateOne({ _id: doc._id }, { $set: updates });
                teamCount++;
            }
        }
        results.teamMembers = teamCount;

        return NextResponse.json({
            success: true,
            message: 'MongoDB native update complete',
            results
        });
    } catch (error) {
        console.error('Fix error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

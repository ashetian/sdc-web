import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/app/lib/db';

export async function GET() {
    try {
        await connectDB();
        const results: Record<string, number> = {};

        // Get the raw MongoDB collections
        const db = mongoose.connection.db;
        if (!db) {
            return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
        }

        // Fix announcements
        const announcements = db.collection('announcements');
        const annDocs = await announcements.find({}).toArray();
        let annUpdated = 0;

        for (const doc of annDocs) {
            const updates: Record<string, string> = {};

            if (doc.titleEn && (doc.titleEn.includes('İ') || doc.titleEn.includes('ı'))) {
                updates.titleEn = doc.titleEn.replace(/İ/g, 'I').replace(/ı/g, 'i');
            }
            if (doc.descriptionEn && (doc.descriptionEn.includes('İ') || doc.descriptionEn.includes('ı'))) {
                updates.descriptionEn = doc.descriptionEn.replace(/İ/g, 'I').replace(/ı/g, 'i');
            }
            if (doc.contentEn && (doc.contentEn.includes('İ') || doc.contentEn.includes('ı'))) {
                updates.contentEn = doc.contentEn.replace(/İ/g, 'I').replace(/ı/g, 'i');
            }
            if (doc.galleryDescriptionEn && (doc.galleryDescriptionEn.includes('İ') || doc.galleryDescriptionEn.includes('ı'))) {
                updates.galleryDescriptionEn = doc.galleryDescriptionEn.replace(/İ/g, 'I').replace(/ı/g, 'i');
            }

            if (Object.keys(updates).length > 0) {
                await announcements.updateOne({ _id: doc._id }, { $set: updates });
                annUpdated++;
            }
        }
        results.announcements = annUpdated;

        // Fix departments
        const departments = db.collection('departments');
        const deptDocs = await departments.find({}).toArray();
        let deptUpdated = 0;

        for (const doc of deptDocs) {
            const updates: Record<string, string> = {};

            if (doc.nameEn && (doc.nameEn.includes('İ') || doc.nameEn.includes('ı'))) {
                updates.nameEn = doc.nameEn.replace(/İ/g, 'I').replace(/ı/g, 'i');
            }
            if (doc.descriptionEn && (doc.descriptionEn.includes('İ') || doc.descriptionEn.includes('ı'))) {
                updates.descriptionEn = doc.descriptionEn.replace(/İ/g, 'I').replace(/ı/g, 'i');
            }

            if (Object.keys(updates).length > 0) {
                await departments.updateOne({ _id: doc._id }, { $set: updates });
                deptUpdated++;
            }
        }
        results.departments = deptUpdated;

        // Fix team members
        const teamMembers = db.collection('teammembers');
        const teamDocs = await teamMembers.find({}).toArray();
        let teamUpdated = 0;

        for (const doc of teamDocs) {
            const updates: Record<string, string> = {};

            if (doc.titleEn && (doc.titleEn.includes('İ') || doc.titleEn.includes('ı'))) {
                updates.titleEn = doc.titleEn.replace(/İ/g, 'I').replace(/ı/g, 'i');
            }
            if (doc.descriptionEn && (doc.descriptionEn.includes('İ') || doc.descriptionEn.includes('ı'))) {
                updates.descriptionEn = doc.descriptionEn.replace(/İ/g, 'I').replace(/ı/g, 'i');
            }

            if (Object.keys(updates).length > 0) {
                await teamMembers.updateOne({ _id: doc._id }, { $set: updates });
                teamUpdated++;
            }
        }
        results.teamMembers = teamUpdated;

        // Fix stats
        const stats = db.collection('stats');
        const statDocs = await stats.find({}).toArray();
        let statUpdated = 0;

        for (const doc of statDocs) {
            if (doc.labelEn && (doc.labelEn.includes('İ') || doc.labelEn.includes('ı'))) {
                await stats.updateOne(
                    { _id: doc._id },
                    { $set: { labelEn: doc.labelEn.replace(/İ/g, 'I').replace(/ı/g, 'i') } }
                );
                statUpdated++;
            }
        }
        results.stats = statUpdated;

        return NextResponse.json({
            success: true,
            message: `Fixed Turkish characters`,
            results
        });
    } catch (error) {
        console.error('Fix error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

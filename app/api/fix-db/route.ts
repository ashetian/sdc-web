import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import AdminAccess from '@/app/lib/models/AdminAccess';

export async function GET() {
    try {
        await connectDB();

        // List indexes first for debugging/logging
        const indexes = await AdminAccess.collection.indexes();
        console.log('Current Indexes:', indexes);

        // Attempt to drop the specific offending index
        // The error name was "departmentId_1_role_1"
        if (indexes.some(i => i.name === 'departmentId_1_role_1')) {
            await AdminAccess.collection.dropIndex('departmentId_1_role_1');
            return NextResponse.json({ message: 'Legacy index "departmentId_1_role_1" dropped successfully.' });
        }

        return NextResponse.json({
            message: 'Index not found or already dropped.',
            indexes: indexes
        });

    } catch (error: any) {
        console.error('Fix DB Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

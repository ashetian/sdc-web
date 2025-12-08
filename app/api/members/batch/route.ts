import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Member from '@/app/lib/models/Member';
import { verifyAuth } from '@/app/lib/auth';

// DELETE - Batch delete members (registered members are protected)
export async function DELETE(request: NextRequest) {
    try {
        // Verify authentication
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        await connectDB();

        const body = await request.json();
        const { memberIds } = body;

        if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
            return NextResponse.json({ error: 'Silinecek üye ID\'leri gerekli' }, { status: 400 });
        }

        // Find members that are registered (protected)
        const protectedMembers = await Member.find({
            _id: { $in: memberIds },
            isRegistered: true
        }).select('_id fullName');

        // Only delete non-registered members from the list
        const result = await Member.deleteMany({
            _id: { $in: memberIds },
            isRegistered: { $ne: true }
        });

        const protectedNames = protectedMembers.map(m => m.fullName);

        let message = `${result.deletedCount} üye silindi.`;
        if (protectedMembers.length > 0) {
            message += ` ${protectedMembers.length} kayıtlı üye korundu.`;
        }

        return NextResponse.json({
            message,
            deletedCount: result.deletedCount,
            protectedCount: protectedMembers.length,
            protectedNames
        });
    } catch (error) {
        console.error('Batch delete members error:', error);
        return NextResponse.json({ error: 'Üyeler silinemedi' }, { status: 500 });
    }
}

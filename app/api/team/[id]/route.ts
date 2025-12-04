import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import TeamMember from '@/app/lib/models/TeamMember';
import { deleteFromCloudinary } from '@/app/lib/cloudinaryHelper';

// GET - Get single team member
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const member = await TeamMember.findById(id).populate('departmentId', 'name slug color');

        if (!member) {
            return NextResponse.json({ error: 'Ekip üyesi bulunamadı' }, { status: 404 });
        }

        return NextResponse.json(member);
    } catch (error) {
        console.error('Error fetching team member:', error);
        return NextResponse.json({ error: 'Ekip üyesi alınamadı' }, { status: 500 });
    }
}

// PUT - Update team member
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const data = await request.json();

        // Get old member to check if photo changed
        const oldMember = await TeamMember.findById(id);
        if (oldMember && oldMember.photo && data.photo && oldMember.photo !== data.photo) {
            // Delete old photo from Cloudinary
            await deleteFromCloudinary(oldMember.photo);
        }

        const member = await TeamMember.findByIdAndUpdate(id, data, { new: true })
            .populate('departmentId', 'name slug color');

        if (!member) {
            return NextResponse.json({ error: 'Ekip üyesi bulunamadı' }, { status: 404 });
        }

        return NextResponse.json(member);
    } catch (error) {
        console.error('Error updating team member:', error);
        return NextResponse.json({ error: 'Ekip üyesi güncellenemedi' }, { status: 500 });
    }
}

// DELETE - Delete team member
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const member = await TeamMember.findById(id);
        if (!member) {
            return NextResponse.json({ error: 'Ekip üyesi bulunamadı' }, { status: 404 });
        }

        // Delete photo from Cloudinary if exists
        if (member.photo) {
            await deleteFromCloudinary(member.photo);
        }

        await TeamMember.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Ekip üyesi silindi' });
    } catch (error) {
        console.error('Error deleting team member:', error);
        return NextResponse.json({ error: 'Ekip üyesi silinemedi' }, { status: 500 });
    }
}

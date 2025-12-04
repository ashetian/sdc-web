import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import TeamMember from '@/app/lib/models/TeamMember';
import { Applicant } from '@/app/lib/models/Applicant';
import Department from '@/app/lib/models/Department';

// POST - Create team member from applicant
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const data = await request.json();
        const { applicantId, role, departmentId, title, showInTeam } = data;

        // Find the applicant
        const applicant = await Applicant.findById(applicantId);
        if (!applicant) {
            return NextResponse.json({ error: 'Başvuru bulunamadı' }, { status: 404 });
        }

        // Find department if provided
        let department = null;
        if (departmentId) {
            department = await Department.findById(departmentId);
        } else if (applicant.selectedDepartment) {
            // Try to find department by name from applicant
            department = await Department.findOne({
                name: { $regex: new RegExp(applicant.selectedDepartment, 'i') }
            });
        }

        // Check if team member with same email already exists
        const existingMember = await TeamMember.findOne({ email: applicant.email });
        if (existingMember) {
            return NextResponse.json({
                error: 'Bu kişi zaten ekipte mevcut'
            }, { status: 400 });
        }

        // Create team member from applicant data
        const member = await TeamMember.create({
            name: applicant.fullName,
            email: applicant.email,
            phone: applicant.phone,
            role: role || 'member',
            departmentId: department?._id || departmentId,
            title: title || applicant.selectedDepartment || 'Üye',
            description: applicant.motivation,
            github: applicant.github,
            linkedin: applicant.linkedin,
            showInTeam: showInTeam ?? false,
            isActive: true,
        });

        return NextResponse.json(member, { status: 201 });
    } catch (error) {
        console.error('Error creating team member from applicant:', error);
        return NextResponse.json({ error: 'Ekip üyesi oluşturulamadı' }, { status: 500 });
    }
}

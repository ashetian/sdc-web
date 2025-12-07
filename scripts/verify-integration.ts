
import connectDB from '../app/lib/db.ts';
import Member from '../app/lib/models/Member.ts';
import { Applicant } from '../app/lib/models/Applicant.ts';
import TeamMember from '../app/lib/models/TeamMember.ts';
import Department from '../app/lib/models/Department.ts';

async function verify() {
    await connectDB();
    console.log('Connected to DB');

    // 1. Create Dummy Member
    const member = await Member.create({
        fullName: 'Test Integration Member',
        email: 'test.integration@example.com',
        studentNo: '999999',
        password: 'hash',
        privacyPolicyAccepted: true
    });
    console.log('Created Member:', member._id);

    // 2. Create Applicant
    const applicant = await Applicant.create({
        fullName: member.fullName,
        email: member.email,
        phone: '1234567890',
        faculty: 'Eng',
        department: 'CS',
        classYear: '4',
        selectedDepartment: 'Teknik Departman',
        motivation: 'Test',
        hasExperience: false,
        departmentSpecificAnswers: {},
        kvkkConsent: true,
        communicationConsent: true,
        memberId: member._id
    });
    console.log('Created Applicant:', applicant._id);

    // 3. Simulate "Add to Team" (Copy logic from API)
    // We are testing if Mongoose model handles it correctly basically, 
    // but the API logic I changed was just passing the field.
    // So let's test creating a TeamMember with memberId explicitly.

    const teamMember = await TeamMember.create({
        memberId: applicant.memberId,
        name: applicant.fullName,
        email: applicant.email,
        phone: applicant.phone,
        role: 'member',
        title: 'Developer',
        isActive: true,
        showInTeam: false
    });

    console.log('Created TeamMember:', teamMember._id);
    if (teamMember.memberId?.toString() === member._id.toString()) {
        console.log('✅ TeamMember correctly linked to Member');
    } else {
        console.error('❌ TeamMember NOT linked to Member', teamMember.memberId);
    }

    // 4. Test Department Lead
    const dept = await Department.findOne();
    if (dept) {
        dept.leadId = member._id;
        await dept.save();

        const updatedDept = await Department.findById(dept._id);
        if (updatedDept?.leadId?.toString() === member._id.toString()) {
            console.log('✅ Department Lead correctly saved');
        } else {
            console.error('❌ Department Lead NOT saved');
        }
    } else {
        console.log('Skipping Department test (no departments found)');
    }

    // Cleanup
    await Member.findByIdAndDelete(member._id);
    await Applicant.findByIdAndDelete(applicant._id);
    await TeamMember.findByIdAndDelete(teamMember._id);
    console.log('Cleanup done');
    process.exit(0);
}

verify().catch(console.error);

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Member from '@/app/lib/models/Member';
import PasswordToken from '@/app/lib/models/PasswordToken';

// POST - Reset member profile (clear auth data but keep member info)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const member = await Member.findById(id);

        if (!member) {
            return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 });
        }

        // Clear auth data
        member.passwordHash = undefined;
        member.isRegistered = false;
        member.lastLogin = undefined;
        // Optional: clear nickname or keep it. Clearing it to allow fresh start.
        member.nickname = undefined;

        // Reset profile visibility to default
        member.profileVisibility = {
            showEmail: false,
            showPhone: false,
            showDepartment: true,
            showFullName: false,
        };

        await member.save();

        // Delete all tokens for this member
        await PasswordToken.deleteMany({ memberId: member._id });

        return NextResponse.json({
            message: 'Üye profili başarıyla sıfırlandı. Üye tekrar kayıt olabilir.',
            member: {
                _id: member._id,
                studentNo: member.studentNo,
                fullName: member.fullName,
                isRegistered: false
            }
        });
    } catch (error) {
        console.error('Reset profile error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

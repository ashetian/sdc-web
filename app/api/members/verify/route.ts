import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Member from '@/app/lib/models/Member';

interface VerificationResult {
    isMember: boolean;
    member?: {
        studentNo: string;
        fullName: string;
        email: string;
        phone?: string;
        department?: string;
    };
    matches: {
        studentNo: boolean;
        fullName: boolean;
        email: boolean;
        phone: boolean;
        department: boolean;
    };
}

// POST - Verify if an applicant is a member and check info match
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { studentNo, fullName, email, phone, department } = body;

        if (!studentNo && !email) {
            return NextResponse.json({
                error: 'Öğrenci numarası veya email gerekli'
            }, { status: 400 });
        }

        // Find member by studentNo or email
        let member = null;
        if (studentNo) {
            member = await Member.findOne({
                studentNo: String(studentNo).trim(),
                isActive: true
            });
        }

        if (!member && email) {
            member = await Member.findOne({
                email: String(email).trim().toLowerCase(),
                isActive: true
            });
        }

        if (!member) {
            const result: VerificationResult = {
                isMember: false,
                matches: {
                    studentNo: false,
                    fullName: false,
                    email: false,
                    phone: false,
                    department: false,
                },
            };
            return NextResponse.json(result);
        }

        // Normalize strings for comparison
        const normalize = (str?: string) => (str || '').trim().toLowerCase();
        const normalizePhone = (str?: string) => (str || '').replace(/\D/g, '');

        // Check which fields match
        const matches = {
            studentNo: normalize(studentNo) === normalize(member.studentNo),
            fullName: normalize(fullName) === normalize(member.fullName),
            email: normalize(email) === normalize(member.email),
            phone: normalizePhone(phone) === normalizePhone(member.phone),
            department: normalize(department) === normalize(member.department),
        };

        const result: VerificationResult = {
            isMember: true,
            member: {
                studentNo: member.studentNo,
                fullName: member.fullName,
                email: member.email,
                phone: member.phone,
                department: member.department,
            },
            matches,
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error verifying member:', error);
        return NextResponse.json({ error: 'Doğrulama hatası' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Applicant } from '@/app/lib/models/Applicant';
import { z } from 'zod';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

// Validation schema
const applicantSchema = z.object({
    fullName: z.string().min(1, 'Ad Soyad gereklidir').max(100),
    department: z.string().min(1, 'Bölüm gereklidir').max(100),
    classYear: z.string().min(1, 'Sınıf gereklidir').max(20),
    phone: z.string().min(1, 'Telefon gereklidir').max(20),
    email: z.string().email('Geçerli bir email adresi giriniz'),
    github: z.string().optional(),
    linkedin: z.string().optional(),
    selectedDepartment: z.enum([
        'Proje Departmanı',
        'Teknik Departman',
        'Medya Departmanı',
        'Kurumsal İletişim Departmanı',
    ]),
    motivation: z.string().min(1, 'Motivasyon açıklaması gereklidir'),
    hasExperience: z.boolean(),
    experienceDescription: z.string().optional(),
    departmentSpecificAnswers: z.record(z.string(), z.string()),
    additionalNotes: z.string().optional(),
    kvkkConsent: z.boolean().refine((val) => val === true, {
        message: 'KVKK onayı gereklidir',
    }),
    communicationConsent: z.boolean().refine((val) => val === true, {
        message: 'İletişim onayı gereklidir',
    }),
});

export async function GET() {
    try {
        await connectDB();
        const applicants = await Applicant.find({}).sort({ createdAt: -1 });
        return NextResponse.json(applicants);
    } catch (error) {
        console.error('Başvurular alınırken hata oluştu:', error);
        return NextResponse.json(
            { error: 'Başvurular alınırken bir hata oluştu' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Başvuru yapmak için giriş yapmalısınız.' }, { status: 401 });
        }

        let memberId;
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            memberId = payload.memberId;
        } catch {
            return NextResponse.json({ error: 'Oturum geçersiz.' }, { status: 401 });
        }

        await connectDB();
        const data = await request.json();

        // Zod validation
        const parsed = applicantSchema.safeParse(data);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues.map((i) => i.message).join(', ') },
                { status: 400 }
            );
        }

        // Check if already applied? (Optional, but good practice)
        // const existing = await Applicant.findOne({ memberId });
        // if (existing) return NextResponse.json({ error: 'Zaten bir başvurunuz bulunmaktadır.' }, { status: 400 });

        const applicant = await Applicant.create({
            ...parsed.data,
            memberId, // Link to member
        });

        // --- Notification Trigger ---
        try {
            const { createAdminNotification } = await import('@/app/lib/notifications');
            await createAdminNotification({
                type: 'admin_new_applicant',
                title: 'Yeni ekip başvurusu',
                titleEn: 'New team application',
                message: `${parsed.data.fullName} - ${parsed.data.selectedDepartment}`,
                messageEn: `${parsed.data.fullName} - ${parsed.data.selectedDepartment}`,
                link: '/admin/applicants',
                relatedContentType: 'applicant',
                relatedContentId: applicant._id,
            });
        } catch (notifError) {
            console.error('Notification error:', notifError);
        }
        // --- End Notification Trigger ---

        return NextResponse.json(applicant, { status: 201 });
    } catch (error) {
        console.error('Başvuru eklenirken hata oluştu:', error);
        return NextResponse.json(
            { error: 'Başvuru eklenirken bir hata oluştu' },
            { status: 500 }
        );
    }
}

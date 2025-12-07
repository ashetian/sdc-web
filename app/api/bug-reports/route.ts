import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/app/lib/auth';
import connectDB from '@/app/lib/db';
import BugReport from '@/app/lib/models/BugReport';
import Member from '@/app/lib/models/Member';

// POST - Create a new bug report
export async function POST(request: NextRequest) {
    try {
        // Use verifyAuth for consistent auth checking
        const auth = await verifyAuth(request);
        
        if (!auth || !auth.userId) {
            return NextResponse.json(
                { error: 'Giriş yapmanız gerekiyor' },
                { status: 401 }
            );
        }

        await connectDB();

        // Get member by userId (memberId)
        const member = await Member.findById(auth.userId);
        if (!member) {
            return NextResponse.json(
                { error: 'Kullanıcı bulunamadı' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { title, description, page, browser } = body;

        // Validation
        if (!title || !description || !page) {
            return NextResponse.json(
                { error: 'Başlık, açıklama ve sayfa bilgisi gerekli' },
                { status: 400 }
            );
        }

        // Create bug report
        const bugReport = await BugReport.create({
            reporterId: member._id,
            title: title.trim(),
            description: description.trim(),
            page: page.trim(),
            browser: browser?.trim() || '',
            status: 'pending',
        });

        return NextResponse.json(
            { success: true, bugReport },
            { status: 201 }
        );
    } catch (error) {
        console.error('Bug report creation error:', error);
        return NextResponse.json(
            { error: 'Hata bildirimi gönderilemedi' },
            { status: 500 }
        );
    }
}

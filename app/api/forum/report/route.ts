import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ForumReport from '@/app/lib/models/ForumReport';
import ForumTopic from '@/app/lib/models/ForumTopic';
import ForumReply from '@/app/lib/models/ForumReply';
import Member from '@/app/lib/models/Member';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

// POST - Report content
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Check auth
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
        }

        let memberId: string;
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            memberId = payload.memberId as string;
        } catch {
            return NextResponse.json({ error: 'Oturum geçersiz' }, { status: 401 });
        }

        const member = await Member.findById(memberId);
        if (!member) {
            return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 });
        }

        const body = await request.json();
        const { contentType, contentId, reason, details } = body;

        if (!contentType || !contentId || !reason) {
            return NextResponse.json({ error: 'contentType, contentId ve reason gerekli' }, { status: 400 });
        }

        if (!['topic', 'reply'].includes(contentType)) {
            return NextResponse.json({ error: 'Geçersiz içerik türü' }, { status: 400 });
        }

        if (!['spam', 'harassment', 'inappropriate', 'other'].includes(reason)) {
            return NextResponse.json({ error: 'Geçersiz rapor nedeni' }, { status: 400 });
        }

        // Verify content exists
        if (contentType === 'topic') {
            const topic = await ForumTopic.findById(contentId);
            if (!topic || topic.isDeleted) {
                return NextResponse.json({ error: 'Konu bulunamadı' }, { status: 404 });
            }
        } else {
            const reply = await ForumReply.findById(contentId);
            if (!reply || reply.isDeleted) {
                return NextResponse.json({ error: 'Yanıt bulunamadı' }, { status: 404 });
            }
        }

        // Check if already reported
        const existingReport = await ForumReport.findOne({
            reporterId: memberId,
            contentType,
            contentId,
        });

        if (existingReport) {
            return NextResponse.json({ error: 'Bu içeriği zaten raporladınız' }, { status: 400 });
        }

        await ForumReport.create({
            reporterId: memberId,
            contentType,
            contentId,
            reason,
            details: details?.substring(0, 1000),
        });

        return NextResponse.json({ message: 'Rapor gönderildi. Teşekkürler!' }, { status: 201 });
    } catch (error) {
        console.error('Forum report error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// GET - List reports (admin only)
export async function GET(request: NextRequest) {
    try {
        const adminPassword = request.headers.get('x-admin-password');
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Yetki gerekli' }, { status: 403 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'pending';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const reports = await ForumReport.find({ status })
            .populate('reporterId', 'fullName nickname')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await ForumReport.countDocuments({ status });

        // Populate content details
        const populatedReports = await Promise.all(reports.map(async (report) => {
            let content = null;
            if (report.contentType === 'topic') {
                content = await ForumTopic.findById(report.contentId)
                    .populate('authorId', 'fullName nickname')
                    .select('title content authorId');
            } else {
                content = await ForumReply.findById(report.contentId)
                    .populate('authorId', 'fullName nickname')
                    .select('content authorId');
            }
            return {
                ...report.toObject(),
                content,
            };
        }));

        return NextResponse.json({
            reports: populatedReports,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Forum reports fetch error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

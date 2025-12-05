import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Comment from '@/app/lib/models/Comment';

// GET - All comments for admin
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Check admin password
        const adminPassword = request.headers.get('x-admin-password');
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const contentType = searchParams.get('type');

        const query: { contentType?: string } = {};
        if (contentType && ['project', 'gallery', 'announcement'].includes(contentType)) {
            query.contentType = contentType;
        }

        const comments = await Comment.find(query)
            .populate('memberId', 'fullName nickname studentNo')
            .sort({ createdAt: -1 })
            .limit(100);

        // Get content titles
        const enrichedComments = await Promise.all(comments.map(async (comment) => {
            let contentTitle = 'Bilinmiyor';

            try {
                if (comment.contentType === 'project') {
                    const Project = (await import('@/app/lib/models/Project')).default;
                    const project = await Project.findById(comment.contentId);
                    contentTitle = project?.title || 'Silinmiş Proje';
                } else if (comment.contentType === 'announcement') {
                    const { Announcement } = await import('@/app/lib/models/Announcement');
                    const announcement = await Announcement.findById(comment.contentId);
                    contentTitle = announcement?.title || 'Silinmiş Duyuru';
                } else if (comment.contentType === 'gallery') {
                    const { Announcement } = await import('@/app/lib/models/Announcement');
                    const gallery = await Announcement.findById(comment.contentId);
                    contentTitle = gallery?.title || 'Silinmiş Galeri';
                }
            } catch {
                contentTitle = 'Hata';
            }

            const member = comment.memberId as unknown as {
                fullName: string;
                nickname?: string;
                studentNo: string;
            };

            return {
                _id: comment._id,
                contentType: comment.contentType,
                contentId: comment.contentId,
                contentTitle,
                content: comment.content,
                createdAt: comment.createdAt,
                author: {
                    fullName: member?.fullName || 'Bilinmiyor',
                    nickname: member?.nickname,
                    studentNo: member?.studentNo,
                },
            };
        }));

        return NextResponse.json(enrichedComments);
    } catch (error) {
        console.error('Admin comments fetch error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

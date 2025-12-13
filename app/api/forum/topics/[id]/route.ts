import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ForumTopic from '@/app/lib/models/ForumTopic';
import ForumReply from '@/app/lib/models/ForumReply';
import ForumVote from '@/app/lib/models/ForumVote';
import ForumCategory from '@/app/lib/models/ForumCategory';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

interface RouteParams {
    params: Promise<{ id: string }>;
}

interface UserPayload {
    memberId: string;
    nickname?: string;
    studentNo?: string;
    isAdmin?: boolean;
}

async function getMemberInfo(): Promise<UserPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return {
            memberId: payload.memberId as string,
            nickname: payload.nickname as string,
            studentNo: payload.studentNo as string,
            isAdmin: payload.isAdmin as boolean,
        };
    } catch {
        return null;
    }
}

async function isAdmin(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string; name?: string }> {
    const adminPassword = request.headers.get('x-admin-password');
    if (adminPassword === process.env.ADMIN_PASSWORD) {
        return { isAdmin: true };
    }
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            if (payload.isAdmin === true) {
                return {
                    isAdmin: true,
                    userId: payload.memberId as string,
                    name: (payload.nickname || payload.studentNo) as string,
                };
            }
        } catch {
            return { isAdmin: false };
        }
    }
    return { isAdmin: false };
}

// GET - Get topic with replies
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { id } = await params;

        const topic = await ForumTopic.findById(id)
            .populate('categoryId', 'name nameEn slug icon color')
            .populate('authorId', 'fullName nickname avatar department');

        if (!topic || topic.isDeleted) {
            return NextResponse.json({ error: 'Konu bulunamadı' }, { status: 404 });
        }

        // Get query params
        const { searchParams } = new URL(request.url);
        const incrementView = searchParams.get('view') === 'true';

        // Increment view count only when explicitly requested
        if (incrementView) {
            await ForumTopic.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
        }

        // Get replies
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        const replies = await ForumReply.find({
            topicId: id,
            isDeleted: { $ne: true }
        })
            .populate('authorId', 'fullName nickname avatar department')
            .sort({ isBestAnswer: -1, createdAt: 1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalReplies = await ForumReply.countDocuments({
            topicId: id,
            isDeleted: { $ne: true }
        });

        // Check if current user voted
        const userInfo = await getMemberInfo();
        let userVote = null;
        if (userInfo?.memberId) {
            const vote = await ForumVote.findOne({
                memberId: userInfo.memberId,
                contentType: 'topic',
                contentId: id,
            });
            userVote = vote?.value || null;
        }

        return NextResponse.json({
            topic: { ...topic.toObject(), userVote },
            replies,
            pagination: {
                page,
                limit,
                total: totalReplies,
                totalPages: Math.ceil(totalReplies / limit),
            },
        });
    } catch (error) {
        console.error('Forum topic fetch error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// PUT - Update topic (author or admin)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { id } = await params;

        const userInfo = await getMemberInfo();
        const adminInfo = await isAdmin(request);

        if (!userInfo && !adminInfo.isAdmin) {
            return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
        }

        const topic = await ForumTopic.findById(id);
        if (!topic || topic.isDeleted) {
            return NextResponse.json({ error: 'Konu bulunamadı' }, { status: 404 });
        }

        // Check permission
        if (!adminInfo.isAdmin && topic.authorId.toString() !== userInfo?.memberId) {
            return NextResponse.json({ error: 'Bu konuyu düzenleme yetkiniz yok' }, { status: 403 });
        }

        if (topic.isLocked && !adminInfo.isAdmin) {
            return NextResponse.json({ error: 'Bu konu kilitli' }, { status: 403 });
        }

        const body = await request.json();
        const { title, content, tags, isPinned, isLocked, status, revisionMessage } = body;

        const updateData: Record<string, unknown> = {};
        if (title) updateData.title = title.trim();
        if (content) updateData.content = content.trim();
        if (tags) updateData.tags = tags.map((t: string) => t.toLowerCase().trim());
        if (revisionMessage) updateData.revisionMessage = revisionMessage;

        // Admin-only fields
        if (adminInfo.isAdmin) {
            if (typeof isPinned === 'boolean') updateData.isPinned = isPinned;
            if (typeof isLocked === 'boolean') updateData.isLocked = isLocked;

            if (status && ['pending', 'approved', 'rejected', 'revision_requested', 'resubmitted'].includes(status)) {
                updateData.status = status;

                // Update category count when approving
                if (status === 'approved' && topic.status !== 'approved') {
                    // Auto-translate if DeepL API key is available
                    if (process.env.DEEPL_API_KEY) {
                        try {
                            const { translateContent } = await import('@/app/lib/translate');

                            const titleResult = await translateContent(topic.title, 'tr');
                            updateData.titleEn = titleResult.en || '';

                            const contentResult = await translateContent(topic.content, 'tr');
                            updateData.contentEn = contentResult.en || '';

                            console.log('ForumTopic auto-translation successful on approval');
                        } catch (translateError) {
                            console.error('ForumTopic translation failed:', translateError);
                        }
                    }

                    await ForumCategory.findByIdAndUpdate(topic.categoryId, {
                        $inc: { topicCount: 1 },
                        lastTopicAt: new Date(),
                    });

                    // Audit log for approve
                    if (adminInfo.userId) {
                        await logAdminAction({
                            adminId: adminInfo.userId,
                            adminName: adminInfo.name || 'Admin',
                            action: AUDIT_ACTIONS.APPROVE_TOPIC,
                            targetType: 'ForumTopic',
                            targetId: id,
                            targetName: topic.title,
                        });
                    }
                }
            }
        } else {
            // If user edits, set status to resubmitted if revisions were requested
            if (topic.status === 'revision_requested' || topic.status === 'resubmitted') {
                updateData.status = 'resubmitted';
            } else if (topic.status === 'approved' && (title || content)) {
                // If content changes for approved topic, maybe set to pending again? 
                // For now let's keep it simple, approved topics stay approved unless admin changes it
                // Or maybe revert to pending? 
                // Let's keep it approved for minor edits unless critical
            }
        }

        const updatedTopic = await ForumTopic.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('categoryId', 'name nameEn slug icon color')
            .populate('authorId', 'fullName nickname avatar');

        return NextResponse.json(updatedTopic);
    } catch (error) {
        console.error('Forum topic update error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// DELETE - Delete topic (author or admin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { id } = await params;

        const userInfo = await getMemberInfo();
        const adminInfo = await isAdmin(request);

        if (!userInfo && !adminInfo.isAdmin) {
            return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
        }

        const topic = await ForumTopic.findById(id);
        if (!topic) {
            return NextResponse.json({ error: 'Konu bulunamadı' }, { status: 404 });
        }

        // Check permission
        if (!adminInfo.isAdmin && topic.authorId.toString() !== userInfo?.memberId) {
            return NextResponse.json({ error: 'Bu konuyu silme yetkiniz yok' }, { status: 403 });
        }

        const topicTitle = topic.title;

        // Soft delete
        await ForumTopic.findByIdAndUpdate(id, { isDeleted: true });

        // Decrement category topic count
        await ForumCategory.findByIdAndUpdate(topic.categoryId, {
            $inc: { topicCount: -1 },
        });

        // Audit log for admin delete
        if (adminInfo.isAdmin && adminInfo.userId) {
            await logAdminAction({
                adminId: adminInfo.userId,
                adminName: adminInfo.name || 'Admin',
                action: AUDIT_ACTIONS.DELETE_TOPIC,
                targetType: 'ForumTopic',
                targetId: id,
                targetName: topicTitle,
            });
        }

        return NextResponse.json({ message: 'Konu silindi' });
    } catch (error) {
        console.error('Forum topic delete error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

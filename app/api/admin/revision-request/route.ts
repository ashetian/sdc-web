import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import Project from '@/app/lib/models/Project';
import ForumTopic from '@/app/lib/models/ForumTopic';
import Notification from '@/app/lib/models/Notification';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

async function verifyAdmin(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string; name?: string }> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return { isAdmin: false };

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
    return { isAdmin: false };
}

// POST - Send revision request for pending content
export async function POST(request: NextRequest) {
    try {
        const adminInfo = await verifyAdmin(request);
        if (!adminInfo.isAdmin) {
            return NextResponse.json({ error: 'Yetki gerekli' }, { status: 403 });
        }

        await connectDB();

        const { contentType, contentId, message } = await request.json();

        if (!contentType || !contentId || !message) {
            return NextResponse.json({
                error: 'contentType, contentId ve message gerekli'
            }, { status: 400 });
        }

        if (message.length < 10) {
            return NextResponse.json({
                error: 'Düzenleme mesajı en az 10 karakter olmalı'
            }, { status: 400 });
        }

        let authorId: string | null = null;
        let contentTitle = '';
        let editLink = '';

        if (contentType === 'project') {
            const project = await Project.findById(contentId);
            if (!project) {
                return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
            }

            project.status = 'revision_requested';
            project.revisionMessage = message;
            project.revisionRequestedAt = new Date();
            await project.save();

            authorId = project.memberId.toString();
            contentTitle = project.title;
            editLink = `/profile/projects/${contentId}/edit`;

            // Log admin action
            if (adminInfo.userId) {
                await logAdminAction({
                    adminId: adminInfo.userId,
                    adminName: adminInfo.name || 'Admin',
                    action: AUDIT_ACTIONS.REQUEST_PROJECT_REVISION,
                    targetType: 'Project',
                    targetId: contentId,
                    targetName: contentTitle,
                    details: `Düzenleme isteği: ${message.substring(0, 100)}...`,
                });
            }

            // Create notification
            await Notification.create({
                recipientId: authorId,
                type: 'project_revision_requested',
                title: 'Proje Düzenleme İsteği',
                titleEn: 'Project Revision Request',
                message: `"${contentTitle}" projeniz için düzenleme istendi: ${message.substring(0, 200)}`,
                messageEn: `Revision requested for your project "${contentTitle}": ${message.substring(0, 200)}`,
                link: editLink,
                relatedContentType: 'Project',
                relatedContentId: contentId,
                actorId: adminInfo.userId,
            });

        } else if (contentType === 'forum_topic') {
            const topic = await ForumTopic.findById(contentId);
            if (!topic) {
                return NextResponse.json({ error: 'Konu bulunamadı' }, { status: 404 });
            }

            topic.status = 'revision_requested';
            topic.revisionMessage = message;
            topic.revisionRequestedAt = new Date();
            await topic.save();

            authorId = topic.authorId.toString();
            contentTitle = topic.title;
            editLink = `/forum/topic/${contentId}/edit`;

            // Log admin action
            if (adminInfo.userId) {
                await logAdminAction({
                    adminId: adminInfo.userId,
                    adminName: adminInfo.name || 'Admin',
                    action: AUDIT_ACTIONS.REQUEST_TOPIC_REVISION,
                    targetType: 'ForumTopic',
                    targetId: contentId,
                    targetName: contentTitle,
                    details: `Düzenleme isteği: ${message.substring(0, 100)}...`,
                });
            }

            // Create notification
            await Notification.create({
                recipientId: authorId,
                type: 'forum_topic_revision_requested',
                title: 'Forum Konusu Düzenleme İsteği',
                titleEn: 'Forum Topic Revision Request',
                message: `"${contentTitle}" konunuz için düzenleme istendi: ${message.substring(0, 200)}`,
                messageEn: `Revision requested for your topic "${contentTitle}": ${message.substring(0, 200)}`,
                link: editLink,
                relatedContentType: 'ForumTopic',
                relatedContentId: contentId,
                actorId: adminInfo.userId,
            });

        } else {
            return NextResponse.json({
                error: 'Geçersiz içerik tipi. project veya forum_topic olmalı'
            }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Düzenleme isteği gönderildi',
            contentType,
            contentId,
            authorId,
        });

    } catch (error) {
        console.error('Revision request error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

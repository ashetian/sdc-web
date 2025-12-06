import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ForumVote from '@/app/lib/models/ForumVote';
import ForumTopic from '@/app/lib/models/ForumTopic';
import ForumReply from '@/app/lib/models/ForumReply';
import Member from '@/app/lib/models/Member';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

// POST - Vote on topic or reply
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
        const { contentType, contentId, value } = body;

        if (!contentType || !contentId) {
            return NextResponse.json({ error: 'contentType ve contentId gerekli' }, { status: 400 });
        }

        if (!['topic', 'reply'].includes(contentType)) {
            return NextResponse.json({ error: 'Geçersiz içerik türü' }, { status: 400 });
        }

        if (!value || ![1, -1].includes(value)) {
            return NextResponse.json({ error: 'value 1 veya -1 olmalı' }, { status: 400 });
        }

        // Verify content exists
        if (contentType === 'topic') {
            const topic = await ForumTopic.findById(contentId);
            if (!topic || topic.isDeleted) {
                return NextResponse.json({ error: 'Konu bulunamadı' }, { status: 404 });
            }
            // Can't vote on own content
            if (topic.authorId.toString() === memberId) {
                return NextResponse.json({ error: 'Kendi içeriğinize oy veremezsiniz' }, { status: 400 });
            }
        } else {
            const reply = await ForumReply.findById(contentId);
            if (!reply || reply.isDeleted) {
                return NextResponse.json({ error: 'Yanıt bulunamadı' }, { status: 404 });
            }
            if (reply.authorId.toString() === memberId) {
                return NextResponse.json({ error: 'Kendi içeriğinize oy veremezsiniz' }, { status: 400 });
            }
        }

        // Check existing vote
        const existingVote = await ForumVote.findOne({
            memberId,
            contentType,
            contentId,
        });

        let voteChange = value;
        let message = value === 1 ? 'Beğenildi' : 'Beğenilmedi';

        if (existingVote) {
            if (existingVote.value === value) {
                // Same vote - remove it
                await ForumVote.findByIdAndDelete(existingVote._id);
                voteChange = -value; // Undo the vote
                message = 'Oy kaldırıldı';
            } else {
                // Different vote - change it
                await ForumVote.findByIdAndUpdate(existingVote._id, { value });
                voteChange = value * 2; // Remove old + add new
                message = value === 1 ? 'Beğeniye çevrildi' : 'Beğenmemeye çevrildi';
            }
        } else {
            // New vote
            await ForumVote.create({
                memberId,
                contentType,
                contentId,
                value,
            });
        }

        // Update vote counts
        const Model = contentType === 'topic' ? ForumTopic : ForumReply;
        const updateField = voteChange > 0 
            ? (value === 1 ? 'upvotes' : 'downvotes')
            : (value === 1 ? 'upvotes' : 'downvotes');
        
        if (existingVote && existingVote.value !== value) {
            // Changed vote - update both counters
            if (value === 1) {
                await Model.findByIdAndUpdate(contentId, {
                    $inc: { upvotes: 1, downvotes: -1 }
                });
            } else {
                await Model.findByIdAndUpdate(contentId, {
                    $inc: { upvotes: -1, downvotes: 1 }
                });
            }
        } else if (existingVote) {
            // Removed vote
            await Model.findByIdAndUpdate(contentId, {
                $inc: { [updateField]: -1 }
            });
        } else {
            // New vote
            await Model.findByIdAndUpdate(contentId, {
                $inc: { [updateField]: 1 }
            });
        }

        // Get updated counts
        const content = await Model.findById(contentId).select('upvotes downvotes');

        return NextResponse.json({
            message,
            upvotes: content?.upvotes || 0,
            downvotes: content?.downvotes || 0,
            userVote: existingVote?.value === value ? null : value,
        });
    } catch (error) {
        console.error('Forum vote error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

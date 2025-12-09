import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Election from '@/app/lib/models/Election';
import { verifyAuth } from '@/app/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

// GET - List all elections
export async function GET() {
    try {
        await connectDB();
        const elections = await Election.find()
            .populate('departmentId', 'name')
            .sort({ createdAt: -1 });
        return NextResponse.json(elections);
    } catch (error) {
        console.error('Error fetching elections:', error);
        return NextResponse.json({ error: 'Seçimler alınamadı' }, { status: 500 });
    }
}

// POST - Create new election
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Auth check
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        const data = await request.json();

        // Auto-translate if DeepL API key is available
        let electionData = { ...data };

        if (process.env.DEEPL_API_KEY && (data.title || data.description)) {
            try {
                const { translateContent } = await import('@/app/lib/translate');

                if (data.title) {
                    const titleResult = await translateContent(data.title, 'tr');
                    electionData.titleEn = titleResult.en || '';
                }

                if (data.description) {
                    const descResult = await translateContent(data.description, 'tr');
                    electionData.descriptionEn = descResult.en || '';
                }

                console.log('Election auto-translation successful');
            } catch (translateError) {
                console.error('Election translation failed:', translateError);
            }
        }

        const election = await Election.create(electionData);

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.CREATE_ELECTION,
            targetType: 'Election',
            targetId: election._id.toString(),
            targetName: election.title,
        });

        return NextResponse.json(election, { status: 201 });
    } catch (error) {
        console.error('Error creating election:', error);
        return NextResponse.json({ error: 'Seçim oluşturulamadı' }, { status: 500 });
    }
}

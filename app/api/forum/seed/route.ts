import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ForumCategory from '@/app/lib/models/ForumCategory';
import ForumTopic from '@/app/lib/models/ForumTopic';

const defaultCategories = [
    {
        name: 'Genel Tartışma',
        nameEn: 'General Discussion',
        slug: 'genel',
        description: 'Her konuda serbest tartışma alanı',
        descriptionEn: 'Free discussion area for any topic',
        icon: 'MessageCircle',
        color: 'bg-neo-blue',
        order: 0,
    },
    {
        name: 'Projeler',
        nameEn: 'Projects',
        slug: 'projeler',
        description: 'Projelerini paylaş, geri bildirim al',
        descriptionEn: 'Share your projects, get feedback',
        icon: 'Rocket',
        color: 'bg-neo-green',
        order: 1,
    },
    {
        name: 'Yardım & Destek',
        nameEn: 'Help & Support',
        slug: 'yardim',
        description: 'Teknik sorular ve problem çözümleri',
        descriptionEn: 'Technical questions and problem solving',
        icon: 'HelpCircle',
        color: 'bg-neo-pink',
        order: 2,
    },
    {
        name: 'Etkinlikler',
        nameEn: 'Events',
        slug: 'etkinlikler',
        description: 'Etkinlik duyuruları ve tartışmaları',
        descriptionEn: 'Event announcements and discussions',
        icon: 'Calendar',
        color: 'bg-neo-yellow',
        order: 3,
    },
    {
        name: 'Kariyer',
        nameEn: 'Career',
        slug: 'kariyer',
        description: 'Staj, iş fırsatları ve kariyer tavsiyeleri',
        descriptionEn: 'Internships, job opportunities and career advice',
        icon: 'Briefcase',
        color: 'bg-neo-purple',
        order: 4,
    },
    {
        name: 'Öğrenme Kaynakları',
        nameEn: 'Learning Resources',
        slug: 'kaynaklar',
        description: 'Faydalı kaynaklar, eğitimler ve ipuçları',
        descriptionEn: 'Useful resources, tutorials and tips',
        icon: 'BookOpen',
        color: 'bg-neo-cyan',
        order: 5,
    },
];

// GET - Seed default categories
export async function GET() {
    try {
        await connectDB();

        // Check if categories already exist
        const existingCount = await ForumCategory.countDocuments();
        if (existingCount > 0) {
            return NextResponse.json({
                message: 'Kategoriler zaten mevcut',
                count: existingCount,
            });
        }

        // Create default categories
        const created = await ForumCategory.insertMany(defaultCategories);

        return NextResponse.json({
            message: 'Default kategoriler oluşturuldu',
            categories: created,
        });
    } catch (error) {
        console.error('Seed categories error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// POST - Update existing categories to use Lucide icons
export async function POST() {
    try {
        await connectDB();

        const iconUpdates = [
            { slug: 'genel', icon: 'MessageCircle' },
            { slug: 'projeler', icon: 'Rocket' },
            { slug: 'yardim', icon: 'HelpCircle' },
            { slug: 'etkinlikler', icon: 'Calendar' },
            { slug: 'kariyer', icon: 'Briefcase' },
            { slug: 'kaynaklar', icon: 'BookOpen' },
        ];

        for (const update of iconUpdates) {
            await ForumCategory.updateOne(
                { slug: update.slug },
                { $set: { icon: update.icon } }
            );
        }

        return NextResponse.json({
            message: 'Kategori iconları güncellendi',
        });
    } catch (error) {
        console.error('Update icons error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// PUT - Approve all existing topics (one-time migration)
export async function PUT() {
    try {
        await connectDB();

        const result = await ForumTopic.updateMany(
            { isApproved: { $ne: true } },
            { $set: { isApproved: true } }
        );

        return NextResponse.json({
            message: 'Mevcut konular onaylandı',
            modified: result.modifiedCount,
        });
    } catch (error) {
        console.error('Approve all error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

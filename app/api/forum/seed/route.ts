import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ForumCategory from '@/app/lib/models/ForumCategory';

const defaultCategories = [
    {
        name: 'Genel Tartışma',
        nameEn: 'General Discussion',
        slug: 'genel',
        description: 'Her konuda serbest tartışma alanı',
        descriptionEn: 'Free discussion area for any topic',
        icon: '💬',
        color: 'bg-neo-blue',
        order: 0,
    },
    {
        name: 'Projeler',
        nameEn: 'Projects',
        slug: 'projeler',
        description: 'Projelerini paylaş, geri bildirim al',
        descriptionEn: 'Share your projects, get feedback',
        icon: '🚀',
        color: 'bg-neo-green',
        order: 1,
    },
    {
        name: 'Yardım & Destek',
        nameEn: 'Help & Support',
        slug: 'yardim',
        description: 'Teknik sorular ve problem çözümleri',
        descriptionEn: 'Technical questions and problem solving',
        icon: '🆘',
        color: 'bg-neo-pink',
        order: 2,
    },
    {
        name: 'Etkinlikler',
        nameEn: 'Events',
        slug: 'etkinlikler',
        description: 'Etkinlik duyuruları ve tartışmaları',
        descriptionEn: 'Event announcements and discussions',
        icon: '📅',
        color: 'bg-neo-yellow',
        order: 3,
    },
    {
        name: 'Kariyer',
        nameEn: 'Career',
        slug: 'kariyer',
        description: 'Staj, iş fırsatları ve kariyer tavsiyeleri',
        descriptionEn: 'Internships, job opportunities and career advice',
        icon: '💼',
        color: 'bg-neo-purple',
        order: 4,
    },
    {
        name: 'Öğrenme Kaynakları',
        nameEn: 'Learning Resources',
        slug: 'kaynaklar',
        description: 'Faydalı kaynaklar, eğitimler ve ipuçları',
        descriptionEn: 'Useful resources, tutorials and tips',
        icon: '📚',
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

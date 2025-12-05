import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST - Logout (clear cookie)
export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('auth-token');

        return NextResponse.json({ message: 'Çıkış yapıldı' });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

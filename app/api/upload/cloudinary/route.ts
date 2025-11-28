import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'Dosya yüklenemedi' },
                { status: 400 }
            );
        }

        // Dosya tipi kontrolü - sadece resimler
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Sadece resim dosyaları yüklenebilir (JPEG, PNG, WEBP, GIF).' },
                { status: 400 }
            );
        }

        // Dosya boyutu kontrolü (maksimum 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'Dosya boyutu 10MB\'dan küçük olmalıdır.' },
                { status: 400 }
            );
        }

        // Dosyayı buffer'a çevir
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Cloudinary'ye yükle
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'sdc-web', // Cloudinary'de klasör adı
                    resource_type: 'image',
                    transformation: [
                        { quality: 'auto:good' }, // Otomatik kalite optimizasyonu
                        { fetch_format: 'auto' }, // Otomatik format optimizasyonu
                    ],
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            uploadStream.end(buffer);
        });

        const result = uploadResult as any;

        return NextResponse.json({
            success: true,
            path: result.secure_url,
            publicId: result.public_id,
        });
    } catch (error) {
        console.error('Cloudinary yükleme hatası:', error);
        return NextResponse.json(
            { error: 'Dosya yüklenirken bir hata oluştu' },
            { status: 500 }
        );
    }
}

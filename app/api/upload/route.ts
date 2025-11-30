import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
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

    // Dosya tipi kontrolü
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Sadece resim (JPEG, PNG, WEBP) ve PDF dosyaları yüklenebilir.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // PDF ise yerel kaydet
    if (file.type === 'application/pdf') {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${uniqueSuffix}-${file.name}`;
      const uploadDir = join(process.cwd(), 'public/uploads');
      
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch {
        // Ignore error if directory already exists
      }

      const path = join(uploadDir, filename);
      await writeFile(path, buffer);

      return NextResponse.json({
        success: true,
        path: `/uploads/${filename}`
      });
    } 
    
    // Resim ise Cloudinary'ye yükle
    else {
      // Buffer'ı base64 string'e çevirip yükleyebiliriz veya stream kullanabiliriz.
      // Burada promise wrapper ile upload_stream kullanalım.
      
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'sdc-web-uploads', // Opsiyonel klasör
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      return NextResponse.json({
        success: true,
        path: result.secure_url // Frontend 'path' bekliyor, URL dönüyoruz
      });
    }

  } catch (error) {
    console.error('Dosya yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Dosya yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 
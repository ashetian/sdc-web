import { NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// PDF magic bytes: %PDF-
const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46, 0x2D];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validatePDFMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < PDF_MAGIC_BYTES.length) return false;

  for (let i = 0; i < PDF_MAGIC_BYTES.length; i++) {
    if (buffer[i] !== PDF_MAGIC_BYTES[i]) {
      return false;
    }
  }
  return true;
}

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

    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Dosya boyutu çok büyük. Maksimum ${MAX_FILE_SIZE / 1024 / 1024}MB olmalıdır.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // PDF ise magic bytes kontrolü yap
    if (file.type === 'application/pdf') {
      if (!validatePDFMagicBytes(buffer)) {
        return NextResponse.json(
          { error: 'Geçersiz PDF dosyası. Dosya yapısı bozuk olabilir.' },
          { status: 400 }
        );
      }
    }

    // Tüm dosyaları Cloudinary'ye yükle (PDF dahil)
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'sdc-web-uploads',
          resource_type: 'auto', // PDF ve resimler için otomatik algılama
        },
        (error, result) => {
          if (error || !result) reject(error || new Error("Upload failed"));
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      path: result.secure_url
    });

  } catch (error) {
    console.error('Dosya yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Dosya yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 
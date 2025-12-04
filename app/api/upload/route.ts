import { NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for videos
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = formData.get('type') as string; // 'gallery' | 'receipt' | 'image'

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya yüklenemedi' },
        { status: 400 }
      );
    }

    // Dosya tipi kontrolü
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const validTypes = uploadType === 'gallery' ? [...imageTypes, ...videoTypes] : imageTypes;

    if (!validTypes.includes(file.type)) {
      const allowedFormats = uploadType === 'gallery'
        ? 'resim (JPEG, PNG, WEBP, GIF) veya video (MP4, WEBM, MOV)'
        : 'resim (JPEG, PNG, WEBP)';
      return NextResponse.json(
        { error: `Sadece ${allowedFormats} dosyaları yüklenebilir.` },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü
    const isVideo = videoTypes.includes(file.type);
    const maxSize = isVideo ? MAX_FILE_SIZE : MAX_IMAGE_SIZE;

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Dosya boyutu çok büyük. Maksimum ${maxSize / 1024 / 1024}MB olmalıdır.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const eventId = formData.get('eventId') as string;
    const eventTitle = formData.get('eventTitle') as string;
    const gallerySlug = formData.get('gallerySlug') as string;

    // Folder selection logic
    let folder = 'sdc-web-uploads';

    if (uploadType === 'gallery' && gallerySlug) {
      const { sanitizeFolderName } = await import('@/app/lib/cloudinaryHelper');
      folder = `sdc-web-gallery/${sanitizeFolderName(gallerySlug)}`;
    } else if (eventTitle) {
      const { sanitizeFolderName } = await import('@/app/lib/cloudinaryHelper');
      folder = `sdc-web-receipts/${sanitizeFolderName(eventTitle)}`;
    } else if (eventId) {
      folder = `sdc-web-receipts/${eventId}`;
    }

    // Upload to Cloudinary
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: isVideo ? 'video' : 'image',
        },
        (error, result) => {
          if (error || !result) reject(error || new Error("Upload failed"));
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      path: result.secure_url,
      resourceType: isVideo ? 'video' : 'image'
    });

  } catch (error) {
    console.error('Dosya yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Dosya yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 
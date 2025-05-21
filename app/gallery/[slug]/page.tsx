import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

interface GalleryLink {
  url: string;
  description: string;
}

interface Announcement {
  slug: string;
  title: string;
  date: string;
  description: string;
  type: "event" | "news" | "workshop";
  content: string;
  galleryLinks?: GalleryLink[];
  galleryCover?: string;
}

async function getAnnouncement(slug: string): Promise<Announcement | null> {
  const headersList = headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;
  const res = await fetch(`${baseUrl}/api/announcements/${slug}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.isInGallery ? data : null;
}

function isImage(url: string) {
  return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || url.includes("image/upload");
}

function isVideo(url: string) {
  return url.match(/\.(mp4|webm|mov)$/i) || url.includes("video/upload");
}

export default async function GalleryDetailPage({ params }: { params: { slug: string } }) {
  const announcement = await getAnnouncement(params.slug);

  if (!announcement) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">Galeri etkinliği bulunamadı.</div>
    );
  }

  // galleryLinks'i güvenli şekilde dönüştür
  let galleryLinks: GalleryLink[] = [];
  if (announcement.galleryLinks && Array.isArray(announcement.galleryLinks)) {
    galleryLinks = announcement.galleryLinks.map((item: string | GalleryLink) => {
      if (typeof item === 'string') {
        return { url: item, description: '' };
      } else if (item && typeof item.url === 'string') {
        return { url: item.url, description: item.description || '' };
      } else {
        return { url: '', description: '' };
      }
    });
  }

  return (
    <div className="min-h-screen bg-secondary-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-secondary-800/50 backdrop-blur-sm rounded-xl p-8">
          <Link href="/gallery" className="text-blue-400 hover:underline text-sm mb-4 inline-block">← Galeriye Dön</Link>
          {announcement.galleryCover && (
            <div className="mb-8 overflow-hidden rounded-lg">
              <Image
                src={announcement.galleryCover}
                alt={announcement.title}
                width={800}
                height={400}
                className="w-full object-cover"
              />
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full text-sm font-medium ring-1 ring-inset bg-primary-500/10 text-primary-400 ring-primary-500/30">
              {announcement.type === "event" ? "Etkinlik" : announcement.type === "news" ? "Duyuru" : "Workshop"}
            </span>
            <time className="text-sm text-gray-400">{announcement.date}</time>
          </div>
          <h1 className="text-3xl font-bold text-white mb-6">{announcement.title}</h1>
          {galleryLinks.length > 0 && (
            <div className="space-y-8">
              {galleryLinks.map((item, i) => (
                <div key={i} className="w-full">
                  {item.description && (
                    <div className="mb-2 p-3 rounded bg-secondary-900/80 text-gray-200 text-sm border-l-4 border-primary-500">
                      {item.description}
                    </div>
                  )}
                  {isImage(item.url) ? (
                    <Image
                      src={item.url}
                      alt={`Galeri görseli ${i + 1}`}
                      width={800}
                      height={500}
                      className="w-full rounded-lg object-contain bg-black"
                    />
                  ) : isVideo(item.url) ? (
                    <video
                      src={item.url}
                      controls
                      className="w-full rounded-lg bg-black"
                    />
                  ) : (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Dosyayı Görüntüle</a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
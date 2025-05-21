import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

interface Announcement {
  slug: string;
  title: string;
  date: string;
  description: string;
  type: "event" | "news" | "workshop";
  content: string;
  galleryLinks?: string[];
  galleryCover?: string;
  galleryDescription?: string;
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
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ring-1 ring-inset 
                ${announcement.type === "event" ? "bg-purple-600/20 text-purple-400 ring-purple-500/30" : 
                  announcement.type === "news" ? "bg-blue-600/20 text-blue-400 ring-blue-500/30" : 
                  "bg-green-600/20 text-green-400 ring-green-500/30"}
              `}
            >
              {announcement.type === "event" ? "Etkinlik" : announcement.type === "news" ? "Duyuru" : "Workshop"}
            </span>
            <time className="text-sm text-gray-400">{announcement.date}</time>
          </div>
          <h1 className="text-3xl font-bold text-white mb-6">{announcement.title}</h1>
          {announcement.galleryDescription && (
            <p className="text-primary-200 text-lg mb-6 whitespace-pre-line">{announcement.galleryDescription}</p>
          )}
          {announcement.galleryLinks && announcement.galleryLinks.length > 0 && (
            <div className="space-y-8">
              {announcement.galleryLinks.map((link, i) => (
                <div key={i} className="w-full">
                  {isImage(link) ? (
                    <Image
                      src={link}
                      alt={`Galeri görseli ${i + 1}`}
                      width={800}
                      height={500}
                      className="w-full rounded-lg object-contain bg-black"
                    />
                  ) : isVideo(link) ? (
                    <video
                      src={link}
                      controls
                      className="w-full rounded-lg bg-black"
                    />
                  ) : (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Dosyayı Görüntüle</a>
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
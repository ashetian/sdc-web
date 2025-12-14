import dynamic from "next/dynamic";

// Ana bileşeni statik olarak import edelim
import Home from "./_components/Home";


// Diğer bileşenleri dinamik olarak yükleyelim
const Announcements = dynamic(() => import("./_components/Announcements"), {
  loading: () => <div className="min-h-[400px]" />,
});



const Sponsors = dynamic(() => import("./_components/Sponsors"), {
  loading: () => <div className="min-h-[100px]" />,
});

const Contact = dynamic(() => import("./_components/Contact"), {
  loading: () => <div className="min-h-[400px]" />,
});

const SocialConnect = dynamic(() => import("./_components/SocialConnect"), {
  loading: () => <div className="min-h-[100px]" />,
});

const GalleryPreview = dynamic(() => import("./_components/GalleryPreview"), {
  loading: () => <div className="min-h-[400px]" />,
});

import { getAnnouncements } from "./lib/services/announcementService";
import { getSponsors } from "./lib/services/sponsorService";

export default async function HomePage() {
  // SSR: Fetch announcements and sponsors in parallel for better performance
  const [announcements, sponsors] = await Promise.all([
    getAnnouncements({ activeOnly: true }),
    getSponsors({ activeOnly: true })
  ]);

  // Convert to plain object if needed (handled in service but just to be safe if types mismatch)
  // The service returns serialized object so it should be fine.

  return (
    <div className="overflow-x-hidden w-full max-w-[100vw]">
      <section id="home">
        <Home />
      </section>
      <section id="announcements">
        <Announcements initialData={announcements as any} />
      </section>

      <section id="gallery-preview">
        <GalleryPreview initialData={announcements as any} />
      </section>
      <section id="sponsors">
        <Sponsors initialData={sponsors as any} />
      </section>
      <section id="contact">
        <Contact />
      </section>
      <SocialConnect />
    </div>
  );
}

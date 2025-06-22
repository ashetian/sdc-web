import dynamic from 'next/dynamic';

// Ana bileşenleri statik olarak import et
import Home from './_components/Home';
import About from './_components/About';

// Diğer bileşenleri dinamik olarak yükle ve chunk'ları optimize et
const Announcements = dynamic(() => import('./_components/Announcements'), {
  loading: () => <div className="min-h-[400px]" />,
  ssr: false // Client-side only rendering
});

const Team = dynamic(() => import('./_components/Team'), {
  loading: () => <div className="min-h-[400px]" />,
  ssr: false
});

const Contact = dynamic(() => import('./_components/Contact'), {
  loading: () => <div className="min-h-[400px]" />,
  ssr: false
});

const SocialConnect = dynamic(() => import('./_components/SocialConnect'), {
  loading: () => <div className="min-h-[100px]" />,
  ssr: false
});

const GalleryPreview = dynamic(() => import('./_components/GalleryPreview'), {
  loading: () => <div className="min-h-[400px]" />,
  ssr: false
});

// Sayfa bileşeni
export default function HomePage() {
  return (
    <main>
      <section id="home" className="scroll-mt-16">
        <Home />
      </section>
      <section id="about" className="scroll-mt-16">
        <About />
      </section>
      <section id="announcements" className="scroll-mt-16">
        <Announcements />
      </section>
      <section id="gallery-preview" className="scroll-mt-16">
        <GalleryPreview />
      </section>
      <section id="team" className="scroll-mt-16">
        <Team />
      </section>
      <section id="contact" className="scroll-mt-16">
        <Contact />
      </section>
      <SocialConnect />
    </main>
  );
}
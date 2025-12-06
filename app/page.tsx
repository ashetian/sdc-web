import dynamic from "next/dynamic";

// Ana bileşeni statik olarak import edelim
import Home from "./_components/Home";
import About from "./_components/About";

// Diğer bileşenleri dinamik olarak yükleyelim
const Announcements = dynamic(() => import("./_components/Announcements"), {
  loading: () => <div className="min-h-[400px]" />,
});

const Team = dynamic(() => import("./_components/Team"), {
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

export default function HomePage() {
  return (
    <div className="overflow-x-hidden w-full max-w-[100vw]">
      <section id="home">
        <Home />
      </section>
      <section id="announcements">
        <Announcements />
      </section>
      <section id="about">
        <About />
      </section>
      <section id="gallery-preview">
        <GalleryPreview />
      </section>
      <section id="team">
        <Team />
      </section>
      <section id="sponsors">
        <Sponsors />
      </section>
      <section id="contact">
        <Contact />
      </section>
      <SocialConnect />
    </div>
  );
}

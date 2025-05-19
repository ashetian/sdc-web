import Home from './_components/Home';
import About from './_components/About';
import Announcements from './_components/Announcements';
import Team from './_components/Team';
import Contact from './_components/Contact';
import SocialConnect from './_components/SocialConnect';
import GalleryPreview from './_components/GalleryPreview';

export default function HomePage() {
  return (
    <div>
      <section id="home">
        <Home />
      </section>
      <section id="about">
        <About />
      </section>
      <section id="announcements">
        <Announcements />
      </section>
      <section id="gallery-preview">
        <GalleryPreview />
      </section>
      <section id="team">
        <Team />
      </section>
      <section id="contact">
        <Contact />
      </section>
      <SocialConnect />
    </div>
  );
}
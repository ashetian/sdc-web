"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef(null);
  const menuRef = useRef(null);

  useGSAP(() => {
    gsap.from(navRef.current, {
      y: -100,
      duration: 1,
      ease: "bounce.out",
    });
  }, { scope: navRef });

  useEffect(() => {
    if (isMenuOpen) {
      gsap.to(menuRef.current, {
        height: "auto",
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      gsap.to(menuRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [isMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    if (pathname === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } else {
      router.push(`/?scroll=${sectionId}`);
    }
  };

  return (
    <nav ref={navRef} className="fixed w-full z-50 bg-neo-yellow border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <button
            onClick={() => scrollToSection("home")}
            className="flex items-center group"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white transition-all">
              <Image
                src="/logopng.png"
                alt="KTUSDC Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-black p-2 text-2xl bg-white text-black tracking-tighter uppercase">KTUSDC</span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink onClick={() => scrollToSection("home")} text="Ana Sayfa" />
            <NavLink onClick={() => scrollToSection("about")} text="Hakkımızda" />
            <NavLink onClick={() => scrollToSection("announcements")} text="Duyurular" />
            <NavLink onClick={() => scrollToSection("gallery-preview")} text="Galeri" />
            <NavLink onClick={() => scrollToSection("team")} text="Ekibimiz" />
            <NavLink onClick={() => scrollToSection("contact")} text="İletişim" />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 border-2 border-black bg-white shadow-neo-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
          >
            <div className={`w-6 h-0.5 mb-1.5 bg-black transition-all ${isMenuOpen ? "transform rotate-45 translate-y-2" : ""}`} />
            <div className={`w-6 h-0.5 mb-1.5 bg-black transition-all ${isMenuOpen ? "opacity-0" : ""}`} />
            <div className={`w-6 h-0.5 bg-black transition-all ${isMenuOpen ? "transform -rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        <div ref={menuRef} className="md:hidden overflow-hidden h-0 opacity-0 bg-white border-t-2 border-black">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <MobileNavLink onClick={() => scrollToSection("home")} text="Ana Sayfa" />
            <MobileNavLink onClick={() => scrollToSection("about")} text="Hakkımızda" />
            <MobileNavLink onClick={() => scrollToSection("announcements")} text="Duyurular" />
            <MobileNavLink onClick={() => scrollToSection("gallery-preview")} text="Galeri" />
            <MobileNavLink onClick={() => scrollToSection("team")} text="Ekibimiz" />
            <MobileNavLink onClick={() => scrollToSection("contact")} text="İletişim" />
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ onClick, text }: { onClick: () => void; text: string }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 font-bold text-black border-2 border-transparent hover:border-black hover:bg-white hover:shadow-neo transition-all duration-200"
    >
      {text}
    </button>
  );
}

function MobileNavLink({ onClick, text }: { onClick: () => void; text: string }) {
  return (
    <button
      onClick={onClick}
      className="block w-full text-left px-4 py-3 text-base font-bold text-black border-b-2 border-gray-100 hover:bg-neo-yellow hover:border-black transition-colors duration-200"
    >
      {text}
    </button>
  );
}

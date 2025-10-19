"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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
    <nav className="fixed w-full z-50 bg-transparent backdrop-blur-lg transition-all duration-300 shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <button
            onClick={() => scrollToSection("home")}
            className="flex items-center space-x-3"
          >
            <div className="relative w-10 h-10">
              <Image
                src="/logocircle.png"
                alt="KTUSDC Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-xl text-white">KTUSDC</span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink onClick={() => scrollToSection("home")} text="Ana Sayfa" />
            <NavLink
              onClick={() => scrollToSection("about")}
              text="Hakkımızda"
            />
            <NavLink
              onClick={() => scrollToSection("announcements")}
              text="Duyurular"
            />
            <NavLink
              onClick={() => scrollToSection("gallery-preview")}
              text="Galeri"
            />
            <NavLink onClick={() => scrollToSection("team")} text="Ekibimiz" />
            <NavLink
              onClick={() => scrollToSection("contact")}
              text="İletişim"
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md focus:outline-none"
          >
            <div
              className={`w-6 h-0.5 mb-1.5 transition-all bg-white ${
                isMenuOpen ? "transform rotate-45 translate-y-2" : ""
              }`}
            />
            <div
              className={`w-6 h-0.5 mb-1.5 transition-all bg-white ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <div
              className={`w-6 h-0.5 transition-all bg-white ${
                isMenuOpen ? "transform -rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "h-min opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <MobileNavLink
              onClick={() => scrollToSection("home")}
              text="Ana Sayfa"
            />
            <MobileNavLink
              onClick={() => scrollToSection("about")}
              text="Hakkımızda"
            />
            <MobileNavLink
              onClick={() => scrollToSection("announcements")}
              text="Duyurular"
            />
            <MobileNavLink
              onClick={() => scrollToSection("gallery-preview")}
              text="Galeri"
            />
            <MobileNavLink
              onClick={() => scrollToSection("team")}
              text="Ekibimiz"
            />
            <MobileNavLink
              onClick={() => scrollToSection("contact")}
              text="İletişim"
            />
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
      className="relative group font-semibold text-white"
    >
      {text}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300" />
    </button>
  );
}

function MobileNavLink({
  onClick,
  text,
}: {
  onClick: () => void;
  text: string;
}) {
  return (
    <button
      onClick={onClick}
      className="block w-full text-left px-3 p-2 text-base font-medium text-white transition-colors duration-300"
    >
      {text}
    </button>
  );
}

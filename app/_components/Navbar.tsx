'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    if (pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    } else {
      router.push(`/?scroll=${sectionId}`);
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent backdrop-blur-lg shadow-none'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <button
            onClick={() => scrollToSection('home')}
            className="flex items-center space-x-3"
          >
            <div className="relative w-10 h-10">
              <Image
                src="/sdclogobg.png"
                alt="KTU SDC Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className={`font-bold text-xl ${isScrolled ? 'text-purple-600' : 'text-white'}`}>
              KTU SDC
            </span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink onClick={() => scrollToSection('home')} text="Ana Sayfa" isScrolled={isScrolled} />
            <NavLink onClick={() => scrollToSection('about')} text="Hakkımızda" isScrolled={isScrolled} />
            <NavLink onClick={() => scrollToSection('announcements')} text="Duyurular" isScrolled={isScrolled} />
            <NavLink onClick={() => scrollToSection('gallery-preview')} text="Galeri" isScrolled={isScrolled} />
            <NavLink onClick={() => scrollToSection('team')} text="Ekibimiz" isScrolled={isScrolled} />
            <NavLink onClick={() => scrollToSection('contact')} text="İletişim" isScrolled={isScrolled} />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md focus:outline-none"
          >
            <div className={`w-6 h-0.5 mb-1.5 transition-all ${isScrolled ? 'bg-primary-600' : 'bg-white'} ${
              isMenuOpen ? 'transform rotate-45 translate-y-2' : ''
            }`} />
            <div className={`w-6 h-0.5 mb-1.5 transition-all ${isScrolled ? 'bg-primary-600' : 'bg-white'} ${
              isMenuOpen ? 'opacity-0' : ''
            }`} />
            <div className={`w-6 h-0.5 transition-all ${isScrolled ? 'bg-primary-600' : 'bg-white'} ${
              isMenuOpen ? 'transform -rotate-45 -translate-y-2' : ''
            }`} />
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <MobileNavLink onClick={() => scrollToSection('home')} text="Ana Sayfa" isScrolled={isScrolled} />
            <MobileNavLink onClick={() => scrollToSection('about')} text="Hakkımızda" isScrolled={isScrolled} />
            <MobileNavLink onClick={() => scrollToSection('gallery-preview')} text="Galeri" isScrolled={isScrolled} />
            <MobileNavLink onClick={() => scrollToSection('team')} text="Ekibimiz" isScrolled={isScrolled} />
            <MobileNavLink onClick={() => scrollToSection('announcements')} text="Duyurular" isScrolled={isScrolled} />
            <MobileNavLink onClick={() => scrollToSection('contact')} text="İletişim" isScrolled={isScrolled} />
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ onClick, text, isScrolled }: { onClick: () => void; text: string; isScrolled: boolean }) {
  return (
    <button
      onClick={onClick}
      className="relative group font-semibold"
    >
      <span className={`transition-colors duration-300 ${
        isScrolled ? 'text-secondary-800' : 'text-white'
      }`}>
        {text}
      </span>
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300" />
    </button>
  );
}

function MobileNavLink({ onClick, text, isScrolled }: { onClick: () => void; text: string; isScrolled: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
        isScrolled
          ? 'text-secondary-600 hover:bg-secondary-100'
          : 'text-white hover:bg-white/10'
      }`}
    >
      {text}
    </button>
  );
}
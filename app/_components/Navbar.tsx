"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll lock effect
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isMenuOpen]);

  useGSAP(() => {
    gsap.from(navRef.current, {
      y: -100,
      duration: 1,
      ease: "bounce.out",
    });
  }, { scope: navRef });

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

  const menuVariants = {
    closed: {
      opacity: 0,
      y: "-100%",
      transition: {
        duration: 0.5,
        ease: [0.76, 0, 0.24, 1],
        staggerChildren: 0.1,
        staggerDirection: -1
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.76, 0, 0.24, 1],
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, y: -20 },
    open: { opacity: 1, y: 0 }
  };

  return (
    <>
      <nav ref={navRef} className="fixed w-full z-50 bg-neo-yellow border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center relative z-50 bg-neo-yellow">
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
              <NavLink onClick={() => window.open("/events", "_blank")} text="Etkinlik Takvimi" />
              <NavLink onClick={() => scrollToSection("announcements")} text="Duyurular" />
              <NavLink onClick={() => scrollToSection("gallery-preview")} text="Galeri" />
              <NavLink onClick={() => scrollToSection("team")} text="Ekibimiz" />
              <NavLink onClick={() => scrollToSection("contact")} text="İletişim" />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 border-2 border-black bg-white shadow-neo-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all z-[70] relative"
            >
              <div className={`w-6 h-0.5 mb-1.5 bg-black transition-all ${isMenuOpen ? "transform rotate-45 translate-y-2" : ""}`} />
              <div className={`w-6 h-0.5 mb-1.5 bg-black transition-all ${isMenuOpen ? "opacity-0" : ""}`} />
              <div className={`w-6 h-0.5 bg-black transition-all ${isMenuOpen ? "transform -rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen Mobile Menu Overlay - Portaled to body */}
      {mounted && createPortal(
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="fixed inset-0 bg-white/50 backdrop-blur-md z-[60] flex flex-col items-center justify-center md:hidden touch-none"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex flex-col items-center space-y-8">
                <motion.div variants={itemVariants}>
                  <MobileNavLink onClick={() => scrollToSection("home")} text="Ana Sayfa" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <MobileNavLink onClick={() => scrollToSection("about")} text="Hakkımızda" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <MobileNavLink onClick={() => window.open("/events", "_blank")} text="Etkinlik Takvimi" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <MobileNavLink onClick={() => scrollToSection("announcements")} text="Duyurular" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <MobileNavLink onClick={() => scrollToSection("gallery-preview")} text="Galeri" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <MobileNavLink onClick={() => scrollToSection("team")} text="Ekibimiz" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <MobileNavLink onClick={() => scrollToSection("contact")} text="İletişim" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

function NavLink({ onClick, text }: { onClick: () => void; text: string }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 font-bold bg-white/70 text-black border-2 border-transparent hover:border-black hover:bg-white hover:shadow-neo transition-all duration-200"
    >
      {text}
    </button>
  );
}

function MobileNavLink({ onClick, text }: { onClick: () => void; text: string }) {
  return (
    <button
      onClick={onClick}
      className="text-4xl font-black text-black hover:text-white hover:bg-black px-6 py-3 transition-all uppercase tracking-tighter text-center"
    >
      {text}
    </button>
  );
}

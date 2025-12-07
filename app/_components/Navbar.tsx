"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useLanguage } from "../_context/LanguageContext";
import Link from "next/link";
import NotificationBell from "./NotificationBell";
import BugReportButton from "./BugReportButton";

interface AuthUser {
  nickname: string;
  studentNo: string;
  avatar?: string;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef(null);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    setMounted(true);
    // Check auth status
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || null);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };
    checkAuth();
  }, [pathname]);

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
    if (!navRef.current) return;

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

  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <nav ref={navRef} className="fixed w-full z-50 bg-neo-yellow border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center relative z-50 bg-transparent">
            {/* Left Side: Logo + Links */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => scrollToSection("home")}
                className="flex items-center group"
              >
                <div className="relative w-14 h-14 bg-neo-white border-2 border-neo-black shadow-neo-sm transition-all hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] p-1">
                  <Image
                    src="/logopng.png"
                    alt="KTÜ SDC Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </button>

              {/* Desktop Menu Links */}
              <div className="hidden md:flex items-center space-x-6">
                <NavLink onClick={() => scrollToSection("home")} text={t('nav.home')} />
                <NavLink onClick={() => router.push("/forum")} text="Forum" />
                <NavLink onClick={() => scrollToSection("contact")} text={t('nav.contact')} />

                {/* Club Room Status Indicator */}
                <ClubRoomStatus />
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Right Side: Language + Auth */}
            <div className="hidden md:flex items-center gap-8">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="p-2 bg-white border-2 border-black hover:shadow-neo transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span className="font-bold text-sm">{language.toUpperCase()}</span>
                </button>

                {langMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white border-4 border-black shadow-neo z-50">
                    <button
                      onClick={() => { setLanguage('tr'); setLangMenuOpen(false); }}
                      className={`w-full px-4 py-2 font-bold text-left hover:bg-neo-yellow ${language === 'tr' ? 'bg-neo-yellow' : ''}`}
                    >
                      Türkçe
                    </button>
                    <button
                      onClick={() => { setLanguage('en'); setLangMenuOpen(false); }}
                      className={`w-full px-4 py-2 font-bold text-left hover:bg-neo-yellow ${language === 'en' ? 'bg-neo-yellow' : ''}`}
                    >
                      English
                    </button>
                  </div>
                )}
              </div>

              {/* Auth Buttons */}
              {user ? (
                <div className="flex items-center gap-3">
                  <NotificationBell />
                  <BugReportButton />
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-white border-2 border-black hover:shadow-neo transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-black overflow-hidden relative">
                      <Image
                        src={user.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.nickname}`}
                        alt="Avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-bold text-black">
                      {user.nickname || (language === 'tr' ? 'Profil' : 'Profile')}
                    </span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 font-bold bg-white text-black border-2 border-black hover:shadow-neo transition-all"
                  >
                    {t('auth.login') || 'Giriş'}
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 font-bold bg-neo-yellow text-black border-2 border-black hover:shadow-neo transition-all"
                  >
                    {t('auth.signup') || 'Kayıt'}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Right Side: Notification + Bug Report + Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              {user && (
                <>
                  <NotificationBell />
                  <BugReportButton />
                </>
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 border-2 border-black bg-white shadow-neo-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all z-[70] relative"
              >
                <div className={`w-6 h-0.5 mb-1.5 bg-black transition-all ${isMenuOpen ? "transform rotate-45 translate-y-2" : ""}`} />
                <div className={`w-6 h-0.5 mb-1.5 bg-black transition-all ${isMenuOpen ? "opacity-0" : ""}`} />
                <div className={`w-6 h-0.5 bg-black transition-all ${isMenuOpen ? "transform -rotate-45 -translate-y-2" : ""}`} />
              </button>
            </div>
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
              className="fixed inset-0 bg-white z-[60] flex flex-col items-center md:hidden overflow-y-auto pt-24 pb-12"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsMenuOpen(false);
              }}
            >
              {/* Logo in Mobile Menu */}
              <motion.div variants={itemVariants} className="mb-8">
                <div className="relative w-24 h-24 mx-auto bg-white border-4 border-black shadow-neo p-2">
                  <Image
                    src="/logopng.png"
                    alt="KTÜ SDC Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </motion.div>

              <div className="flex flex-col items-center space-y-3 w-full px-6">
                <motion.div variants={itemVariants}>
                  <MobileNavLink onClick={() => scrollToSection("home")} text={t('nav.home')} color="bg-neo-yellow" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <MobileNavLink onClick={() => { router.push("/forum"); setIsMenuOpen(false); }} text="Forum" color="bg-neo-green" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <MobileNavLink onClick={() => scrollToSection("contact")} text={t('nav.contact')} color="bg-neo-purple" />
                </motion.div>

                {/* Mobile Room Status */}
                <ClubRoomStatusMobile />

                {/* Language Switcher Mobile */}
                <motion.div variants={itemVariants} className="flex gap-4 mt-8">
                  <button
                    onClick={() => { setLanguage('tr'); setIsMenuOpen(false); }}
                    className={`px-6 py-3 border-4 border-black font-black text-xl ${language === 'tr' ? 'bg-black text-white' : 'bg-white'}`}
                  >
                    TR
                  </button>
                  <button
                    onClick={() => { setLanguage('en'); setIsMenuOpen(false); }}
                    className={`px-6 py-3 border-4 border-black font-black text-xl ${language === 'en' ? 'bg-black text-white' : 'bg-white'}`}
                  >
                    EN
                  </button>
                </motion.div>

                {/* Auth Buttons Mobile */}
                <motion.div variants={itemVariants} className="flex flex-col gap-4 mt-6">
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-4 px-8 py-4 bg-white border-4 border-black shadow-neo active:shadow-none transition-all"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-black overflow-hidden relative">
                          <Image
                            src={user.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.nickname}`}
                            alt="Avatar"
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <span className="font-black text-xl text-black">
                          {user.nickname || (language === 'tr' ? 'Profil' : 'Profile')}
                        </span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="px-8 py-4 bg-white text-black font-black text-xl border-4 border-black text-center"
                      >
                        {t('auth.login') || 'Login'}
                      </Link>
                      <Link
                        href="/auth/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className="px-8 py-4 bg-neo-yellow text-black font-black text-xl border-4 border-black text-center"
                      >
                        {t('auth.signup') || 'Sign Up'}
                      </Link>
                    </>
                  )}
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
      className="px-4 py-2 font-bold bg-white text-black border-2 hover:border-black hover:bg-white/70 hover:shadow-neo transition-all duration-200"
    >
      {text}
    </button>
  );
}

function MobileNavLink({ onClick, text, color = "bg-white" }: { onClick: () => void; text: string; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={`text-2xl font-black text-black px-8 py-4 transition-all uppercase tracking-tighter text-center border-4 border-black shadow-neo active:shadow-none active:translate-x-1 active:translate-y-1 ${color}`}
    >
      {text}
    </button>
  );
}

function ClubRoomStatus() {
  const [status, setStatus] = useState<{ exists: boolean; isOpen: boolean } | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          // Only set status if room exists
          if (data.club_room_exists === 'true') {
            setStatus({
              exists: true,
              isOpen: data.club_room_is_open === 'true'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching room status:', error);
      }
    };

    fetchStatus();
    // Poll every 60 seconds
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!status || !status.exists) return null;

  return (
    <div className={`
      hidden lg:flex items-center gap-2 px-3 py-1.5 border-2 border-black font-bold text-xs shadow-neo-sm
      ${status.isOpen ? 'bg-neo-green text-black' : 'bg-red-500 text-white'}
    `}>
      <span className={`w-2 h-2 rounded-full border border-black ${status.isOpen ? 'bg-green-300 animate-pulse' : 'bg-red-200'}`} />
      <span>{status.isOpen ? 'KULÜP ODASI AÇIK' : 'KULÜP ODASI KAPALI'}</span>
    </div>
  );
}

function ClubRoomStatusMobile() {
  const [status, setStatus] = useState<{ exists: boolean; isOpen: boolean } | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.club_room_exists === 'true') {
            setStatus({
              exists: true,
              isOpen: data.club_room_is_open === 'true'
            });
          }
        }
      } catch (error) {
        console.error('Mobile status error:', error);
      }
    };
    fetchStatus();
  }, []);

  if (!status || !status.exists) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
          flex items-center gap-3 px-6 py-3 border-4 border-black font-black text-lg shadow-neo mt-4 w-full justify-center
          ${status.isOpen ? 'bg-neo-green text-black' : 'bg-red-500 text-white'}
        `}
    >
      <span className={`w-4 h-4 rounded-full border-2 border-black ${status.isOpen ? 'bg-green-300 animate-pulse' : 'bg-red-200'}`} />
      <span>{status.isOpen ? 'KULÜP ODASI AÇIK' : 'KULÜP ODASI KAPALI'}</span>
    </motion.div>
  );
}

// TeamModal.tsx
// @eslint-disable
"use client";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { TeamMember } from "./Team";
import {
  Github,
  Instagram,
  Linkedin,
  Mail,
  Twitter,
  User,
  Globe,
  Briefcase,
} from "lucide-react";

interface TeamModalProps {
  open: boolean;
  onClose: () => void;
  member: TeamMember;
  color?: string;
}

export default function TeamModal({
  open,
  onClose,
  member,
  color,
}: TeamModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) closeBtnRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${member.name} profili`}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4" 
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* panel */}
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-2xl border-4 border-black shadow-neo-lg bg-white overflow-hidden text-black"
      >
        {/* üst renk şeridi */}
        <div className="h-4 w-full border-b-4 border-black" style={{ background: color }} />

        {/* kapat */}
        <button
          ref={closeBtnRef}
          onClick={onClose}
          className="absolute right-4 top-6 inline-flex h-10 w-10 items-center justify-center bg-black text-white border-2 border-transparent hover:bg-white hover:text-black hover:border-black hover:shadow-neo transition-all z-20 font-bold"
          aria-label="Kapat"
          title="Kapat"
        >
          ✕
        </button>

        {/* içerik */}
        <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] overflow-y-auto flex-1 min-h-0">
          {/* sol: görsel */}
          <div className="relative bg-gray-100 border-r-0 sm:border-r-4 border-b-4 sm:border-b-0 border-black max-h-[45vh] overflow-hidden group">
            {member.image ? (
              <Image
                src={member.image}
                alt={member.name}
                width={800}
                height={800}
                className="w-full h-full aspect-square object-cover sm:aspect-auto transition-all"
              />
            ) : (
              <div className="w-full h-full aspect-square sm:aspect-auto flex items-center justify-center text-black">
                <User size={64} />
              </div>
            )}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none sm:hidden" />

            {/* Text Overlay */}
            <div className="absolute bottom-0 left-0 p-4 w-full text-white z-10 sm:hidden">
              <h3 className="text-2xl font-black leading-tight uppercase mb-2 drop-shadow-md">{member.name}</h3>
              {(member.role || member.subtitle) && (
                <p className="font-bold text-base inline-block px-2 py-1 border-2 border-white bg-black/30 backdrop-blur-sm shadow-sm">
                  {member.role || member.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* sağ: metinler */}
          <div className="p-4 sm:p-8 bg-white">
            <div className="hidden sm:block">
              <h3 className="text-3xl font-black leading-tight uppercase mb-2">{member.name}</h3>

              {(member.role || member.subtitle) && (
                <p className="font-bold text-lg mb-4 inline-block px-2 py-1 border-2 border-black shadow-neo-sm" style={{ backgroundColor: color }}>
                  {member.role || member.subtitle}
                </p>
              )}
            </div>

            {(member.handle || member.email || member.location) && (
              <div className="mt-1 sm:mt-2 text-sm font-bold text-gray-600 flex flex-wrap gap-2 sm:gap-4">
                {member.handle && <span>{member.handle}</span>}
                {member.email && (
                  <a
                    className="hover:underline"
                    href={`mailto:${member.email}`}
                  >
                    {member.email}
                  </a>
                )}
                {member.location && (
                  <span className="opacity-80">• {member.location}</span>
                )}
              </div>
            )}

            {member.description && (
              <p className="text-black mt-3 sm:mt-6 text-sm sm:text-base font-medium border-l-4 border-black pl-4">
                {member.description}
              </p>
            )}

            {/* sosyal/aksiyonlar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 sm:mt-8">
              {member.website && (
                <a
                  href={member.website}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 sm:p-2 bg-black text-white hover:bg-white hover:text-black border-2 border-black hover:shadow-neo transition-all"
                >
                  <Globe size={20} />
                </a>
              )}
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 sm:p-2 bg-black text-white hover:bg-white hover:text-black border-2 border-black hover:shadow-neo transition-all"
                >
                  <Linkedin size={20} />
                </a>
              )}
              {member.github && (
                <a
                  href={member.github}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 sm:p-2 bg-black text-white hover:bg-white hover:text-black border-2 border-black hover:shadow-neo transition-all"
                >
                  <Github size={20} />
                </a>
              )}
              {member.x && (
                <a
                  href={member.x}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 sm:p-2 bg-black text-white hover:bg-white hover:text-black border-2 border-black hover:shadow-neo transition-all"
                >
                  <Twitter size={20} />
                </a>
              )}
              {member.instagram && (
                <a
                  href={member.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 sm:p-2 bg-black text-white hover:bg-white hover:text-black border-2 border-black hover:shadow-neo transition-all"
                >
                  <Instagram size={20} />
                </a>
              )}
              {member.freelance && (
                <a
                  href={member.freelance}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base bg-neo-green text-black font-bold border-2 border-black hover:shadow-neo transition-all inline-flex items-center gap-2"
                >
                  <Briefcase size={18} />
                  <span>Hizmet Al</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* alt bar */}
        <div className="flex justify-end gap-2 sm:gap-4 p-4 border-t-4 border-black bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm sm:px-6 sm:py-2 sm:text-base bg-white text-black font-bold border-2 border-black hover:shadow-neo transition-all"
          >
            <span>Kapat</span>
          </button>
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="px-4 py-1.5 text-sm sm:px-6 sm:py-2 sm:text-base bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black hover:shadow-neo transition-all inline-flex items-center gap-2"
            >
              <Mail size={18} />
              <span>İletişime Geç</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(content, document.body)
    : content;
}

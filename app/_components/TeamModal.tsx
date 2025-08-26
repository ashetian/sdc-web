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

const isGradient = (c?: string) =>
  !!c &&
  (c.includes("gradient(") ||
    c.includes("linear-gradient") ||
    c.includes("radial-gradient"));

export default function TeamModal({
  open,
  onClose,
  member,
  color,
}: TeamModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // body scroll kilidi
  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [open]);

  // ESC ve basit focus trap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;
        const nodes = panel.querySelectorAll<HTMLElement>(
          'a[href],button,textarea,input,select,[tabindex]:not([tabindex="-1"])'
        );
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // açıldığında odağı kapat butonuna taşı
  useEffect(() => {
    if (open) closeBtnRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const headStyle: React.CSSProperties = color
    ? isGradient(color)
      ? { background: color }
      : { background: color }
    : { background: "linear-gradient(135deg,#111827,#000)" };

  // text color from border color
  const textstyle: React.CSSProperties = member.borderColor
    ? { color: member.borderColor }
    : { color: "white" };

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${member.name} profili`}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* panel */}
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden text-white"
        style={{ background: "rgba(24,24,27,0.92)" }} // zinc-900/90 benzeri
      >
        {/* üst renk şeridi */}
        <div className="h-2 w-full" style={headStyle} />

        {/* kapat */}
        <button
          ref={closeBtnRef}
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-800/60 hover:bg-red-800/80 focus:outline-none focus:ring-0"
          aria-label="Kapat"
          title="Kapat"
        >
          ✕
        </button>

        {/* içerik */}
        <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr]">
          {/* sol: görsel */}
          <div className="relative bg-black">
            {member.image ? (
              <Image
                src={member.image}
                alt={member.name}
                width={800}
                height={800}
                className="w-full h-full aspect-square object-cover sm:aspect-auto"
              />
            ) : (
              <div className="w-full h-full aspect-square sm:aspect-auto flex items-center justify-center text-zinc-400">
                <User size={64} />
              </div>
            )}
          </div>

          {/* sağ: metinler */}
          <div className="p-5 sm:p-6">
            <h3 className="text-2xl font-bold leading-tight">{member.name}</h3>

            {(member.role || member.subtitle) && (
              <p className="font-medium mt-1" style={textstyle}>
                {member.role || member.subtitle}
              </p>
            )}

            {(member.handle || member.email || member.location) && (
              <div className="mt-1 text-sm text-zinc-400 flex flex-wrap gap-2">
                {member.handle && <span>{member.handle}</span>}
                {member.email && (
                  <a
                    className="underline/30 hover:underline"
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
              <p className="text-zinc-200 mt-4 text-warp">
                {member.description}
              </p>
            )}

            {/* sosyal/aksiyonlar */}
            <div className="flex flex-wrap items-center gap-2 mt-6">
              {member.website && (
                <a
                  href={member.website}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-sm inline-flex items-center gap-2"
                >
                  <Globe size={16} />
                </a>
              )}
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-sm inline-flex items-center gap-2"
                >
                  <Linkedin size={16} />
                </a>
              )}
              {member.github && (
                <a
                  href={member.github}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-sm inline-flex items-center gap-2"
                >
                  <Github size={16} />
                </a>
              )}
              {member.x && (
                <a
                  href={member.x}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-sm inline-flex items-center gap-2"
                >
                  <Twitter size={16} />
                </a>
              )}
              {member.instagram && (
                <a
                  href={member.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-sm inline-flex items-center gap-2"
                >
                  <Instagram size={16} />
                </a>
              )}
              {member.freelance && (
                <a
                  href={member.freelance}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-sm inline-flex items-center gap-2"
                >
                  <Briefcase size={16} />
                  <span>Hizmet Al</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* alt bar */}
        <div className="flex justify-end gap-2 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 inline-flex items-center gap-2"
          >
            <span>Kapat</span>
          </button>
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="px-4 py-2 rounded-lg inline-flex items-center gap-2"
              style={headStyle}
            >
              <Mail size={16} />
              <span>İletişime Geç</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );

  // portal: tam ekran & layout'tan bağımsız
  return typeof document !== "undefined"
    ? createPortal(content, document.body)
    : content;
}

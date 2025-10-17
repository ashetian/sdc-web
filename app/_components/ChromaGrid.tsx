// @eslint-disable
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import TeamModal from "./TeamModal";

export interface ChromaItem {
  image: string;
  name: string;
  subtitle?: string;
  description?: string;
  handle?: string;
  location?: string;
  borderColor?: string;
  email?: string;
  gradient?: string;
  url?: string;
}

export interface ChromaGridProps {
  items?: ChromaItem[];
  className?: string;
}

const demo: ChromaItem[] = [
  {
    image: "https://i.pravatar.cc/300?img=8",
    name: "Alex Rivera",
    subtitle: "Full Stack Developer",
    description:
      "Merhaba ben Alex. KTÜ Yazılım Geliştirme Bölümü öğrencisiyim.",
    handle: "@alexrivera",
    borderColor: "#4F46E5",
    gradient: "linear-gradient(145deg,#4F46E5,#000)",
    url: "https://github.com/",
  },
  {
    image: "https://i.pravatar.cc/300?img=11",
    name: "Jordan Chen",
    subtitle: "DevOps Engineer",
    description:
      "Merhaba ben Alex. KTÜ Yazılım Geliştirme Bölümü öğrencisiyim.",
    handle: "@jordanchen",
    borderColor: "#10B981",
    gradient: "linear-gradient(210deg,#10B981,#000)",
    url: "https://linkedin.com/in/",
  },
  {
    image: "https://i.pravatar.cc/300?img=3",
    name: "Morgan Blake",
    subtitle: "UI/UX Designer",
    handle: "@morganblake",
    description:
      "Merhaba ben Alex. KTÜ Yazılım Geliştirme Bölümü öğrencisiyim.",
    borderColor: "#F59E0B",
    gradient: "linear-gradient(165deg,#F59E0B,#000)",
    url: "https://dribbble.com/",
  },
];

const ChromaGrid: React.FC<ChromaGridProps> = ({ items, className = "" }) => {
  const data = items?.length ? items : demo;

  // Modal state (layout aynı, sadece modal eklendi)
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openModal = (idx: number) => {
    setSelectedIndex(idx);
    setOpen(true);
    if (typeof document !== "undefined")
      document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    setOpen(false);
    setSelectedIndex(null);
    if (typeof document !== "undefined") document.body.style.overflow = "";
  };

  // ESC ile kapat
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const selected = selectedIndex != null ? data[selectedIndex] : null;

  return (
    <>
      <div
        className={[
          "grid gap-5 mx-6",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          className,
        ].join(" ")}
        role="grid"
        aria-label="Team grid"
      >
        {data.map((c, i) => (
          <article
            key={i}
            role="gridcell"
            tabIndex={0}
            onClick={() => openModal(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openModal(i);
              }
            }}
            className={[
              "group relative inset-0 flex flex-col rounded-2xl overflow-hidden",
              "cursor-pointer focus:outline-none",
              "transition-all duration-200 hover:-translate-y-1 hover:shadow-xl",
            ].join(" ")}
            style={{
              background: c.gradient || "linear-gradient(145deg,#06b6d4,#000)",
              border: `2px solid ${c.borderColor || "transparent"}`,
            }}
          >
            <div className="relative">
              <Image
                src={c.image}
                alt={c.name}
                width={600}
                height={600}
                className="w-full aspect-square object-cover"
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 44vw, 30vw"
              />
            </div>

            <footer className="p-4 flex flex-row items-center justify-between text-white ">
              <h3 className="m-0 text-lg font-semibold leading-tight">
                {c.name}
              </h3>
              <p className="m-0 text-sm opacity-90">{c.subtitle}</p>
            </footer>
            <div className="flex flex-row items-center justify-between text-white ">
              {c.location && (
                <span className="text-sm p-4 opacity-75 text-right">
                  {c.location}
                </span>
              )}
              <span className="text-sm p-4 opacity-80 text-right">
                {c.email ? c.email : c.handle}
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Modal entegrasyonu — renk bilgisini karttan alıyoruz */}
      {open && selected && (
        <TeamModal
          open={open}
          onClose={closeModal}
          member={selected}
          color={selected.gradient || selected.borderColor || "#111827"}
        />
      )}
    </>
  );
};

export default ChromaGrid;

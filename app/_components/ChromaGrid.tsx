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
    description: "Merhaba ben Alex. KTÜ Yazılım Geliştirme Bölümü öğrencisiyim.",
    handle: "@alexrivera",
    borderColor: "#000000",
    gradient: "#FFDE00",
    url: "https://github.com/",
  },
];

const ChromaGrid: React.FC<ChromaGridProps> = ({ items, className = "" }) => {
  const data = items?.length ? items : demo;

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
          "grid gap-8 mx-6",
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
              "group relative flex flex-col border-4 border-black shadow-neo bg-white",
              "cursor-pointer focus:outline-none",
              "transition-all duration-200 hover:-translate-y-2 hover:shadow-neo-lg",
            ].join(" ")}
          >
            <div className="relative border-b-4 border-black">
              <Image
                src={c.image}
                alt={c.name}
                width={600}
                height={600}
                className="w-full aspect-square object-cover transition-all duration-300"
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 44vw, 30vw"
              />
            </div>

            <div className="p-4 flex flex-col items-center justify-center text-center" style={{ backgroundColor: c.gradient }}>
              <h3 className="m-0 text-xl font-black text-black leading-tight uppercase">
                {c.name}
              </h3>
              <p className="m-0 text-sm font-bold text-black opacity-80 mt-1">{c.subtitle}</p>
            </div>
          </article>
        ))}
      </div>

      {open && selected && (
        <TeamModal
          open={open}
          onClose={closeModal}
          member={selected}
          color={selected.gradient || "#FFDE00"}
        />
      )}
    </>
  );
};

export default ChromaGrid;

"use client";
//*aga eski scroll to top bi değişik çalışıyordu basic bir remake
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 200); // show after 200px
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollTop}
      className="
        fixed bottom-6 right-6 z-50
        p-3 rounded-full shadow-lg
        bg-indigo-600 text-white
        hover:bg-indigo-700
        animate-fade-in
        animate-fade-out
        transition-all
      "
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} />
    </button>
  );
}

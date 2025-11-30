import React from "react";

export default function Footer() {
  return (
    <footer className="bg-neo-black text-white py-8 border-t-4 border-black relative z-50">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
          <p className="text-lg font-bold text-neo-yellow mb-2">
            &copy; {new Date().getFullYear()} KTUSDC
          </p>
          <p className="text-sm opacity-80">All rights reserved.</p>
        </div>

        <div className="flex flex-row gap-2 items-center md:items-end">
          <span className="text-sm font-bold bg-neo-pink text-black px-2 py-1 border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] mb-2">
            Developed by
          </span>
          <span className="text-sm font-bold bg-neo-blue text-black px-2 py-1 border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] mb-2">
            Caner
          </span><span className="text-sm font-bold bg-neo-green text-black px-2 py-1 border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] mb-2">
            Cihan
          </span><span className="text-sm font-bold bg-neo-purple text-black px-2 py-1 border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] mb-2">
            Murat
          </span>
        </div>
      </div>
    </footer>
  );
}

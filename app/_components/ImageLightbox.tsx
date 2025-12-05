"use client";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface ImageLightboxProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    containerClassName?: string;
    fill?: boolean;
}

export default function ImageLightbox({
    src,
    alt,
    width = 400,
    height = 300,
    className = "",
    containerClassName = "",
    fill = false,
}: ImageLightboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, handleKeyDown]);

    const modalContent = (
        <div
            className="fixed inset-0 z-[50000] flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
            style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
            {/* Blurred Backdrop */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)'
                }}
            />

            {/* Close Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                }}
                className="absolute top-6 right-6 z-[50002] bg-white text-black w-12 h-12 rounded-full border-4 border-black shadow-neo flex items-center justify-center font-black text-2xl hover:bg-red-500 hover:text-white hover:border-red-600 transition-all duration-200"
                aria-label="Kapat"
            >
                ×
            </button>

            {/* Image Container */}
            <div
                className="relative z-[50001]"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'scaleIn 0.3s ease-out' }}
            >
                <div className="border-4 border-black shadow-neo-lg bg-white">
                    <Image
                        src={src}
                        alt={alt}
                        width={1920}
                        height={1080}
                        className="block max-w-[95vw] max-h-[95vh] w-auto h-auto"
                        style={{ display: 'block' }}
                        priority
                    />

                </div>
            </div>
            <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </div>
    );

    return (
        <>
            {/* Clickable Image */}
            <div
                className={`cursor-zoom-in ${fill ? 'absolute inset-0' : 'relative'} ${containerClassName}`}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                style={{ zIndex: 1 }}
            >
                {fill ? (
                    <Image src={src} alt={alt} fill className={className} />
                ) : (
                    <Image src={src} alt={alt} width={width} height={height} className={className} />
                )}
            </div>

            {/* Portal Modal - Renders at document.body for full page blur */}
            {mounted && isOpen && createPortal(modalContent, document.body)}
        </>
    );
}

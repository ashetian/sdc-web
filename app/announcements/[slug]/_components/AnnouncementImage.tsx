"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

interface AnnouncementImageProps {
    src: string;
    alt: string;
}

export default function AnnouncementImage({ src, alt }: AnnouncementImageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <div
                className="mb-6 sm:mb-4 sm:ml-6 sm:float-right w-full sm:w-1/3 border-4 border-black shadow-neo cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setIsOpen(true)}
            >
                <Image
                    src={src}
                    alt={alt}
                    width={400}
                    height={300}
                    className="w-full object-cover"
                />
            </div>

            {mounted && isOpen && createPortal(
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4 cursor-zoom-out overflow-hidden"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className={`relative transition-transform duration-300 ease-in-out ${isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'}`}
                        style={{ width: '90%', height: '90%' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsZoomed(!isZoomed);
                        }}
                    >
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 bg-black bg-opacity-50 rounded-full p-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                            setIsZoomed(false);
                        }}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>,
                document.body
            )}
        </>
    );
}

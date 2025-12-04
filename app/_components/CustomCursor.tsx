"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Only show custom cursor on devices with a fine pointer (mouse)
        const mediaQuery = window.matchMedia("(pointer: fine)");
        setIsVisible(mediaQuery.matches);

        const handleMediaChange = (e: MediaQueryListEvent) => {
            setIsVisible(e.matches);
        };

        mediaQuery.addEventListener("change", handleMediaChange);

        const updateCursor = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", updateCursor);

        return () => {
            window.removeEventListener("mousemove", updateCursor);
            mediaQuery.removeEventListener("change", handleMediaChange);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className="fixed top-0 left-0 w-[10px] h-[10px] bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-out"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: `translate(-50%, -50%)`,
                borderRadius: "50%",
            }}
        />
    );
}

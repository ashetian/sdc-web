"use client";

import Image from "next/image";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export default function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-16 h-16",
        lg: "w-24 h-24",
    };

    const ringClasses = {
        sm: "w-10 h-10",
        md: "w-20 h-20",
        lg: "w-32 h-32",
    };

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Logo */}
            <div className="animate-bounce-slow">
                <div className={`relative ${sizeClasses[size]} animate-pulse-scale`}>
                    <Image
                        src="/sdclogo.png"
                        alt="Yükleniyor"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            {/* Animated ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`${ringClasses[size]} border-2 border-neo-purple/30 animate-ping-slow rounded-full`} />
            </div>

            <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-pulse-scale {
          animation: pulse-scale 1.5s ease-in-out infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 2s ease-out infinite;
        }
      `}</style>
        </div>
    );
}

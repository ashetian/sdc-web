"use client";
import Image from "next/image";

export default function AdminLoading() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="relative">
                {/* Animated Logo */}
                <div className="animate-bounce-slow">
                    <div className="relative w-20 h-20 animate-pulse-scale">
                        <Image
                            src="/sdclogo.png"
                            alt="SDC Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Animated ring */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-24 h-24 border-2 border-neo-purple/30 animate-ping-slow" />
                </div>
            </div>

            <style jsx>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes pulse-scale {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes ping-slow {
                    0% { transform: scale(1); opacity: 0.5; }
                    100% { transform: scale(1.5); opacity: 0; }
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

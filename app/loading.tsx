"use client";
import Image from "next/image";

export default function Loading() {
    return (
        <div className="min-h-screen bg-neo-mint flex items-center justify-center">
            <div className="relative">
                {/* Animated Logo */}
                <div className="animate-bounce-slow">
                    <div className="relative w-32 h-32 animate-pulse-scale">
                        <Image
                            src="/sdclogo.png"
                            alt="SDC Logo"
                            fill
                            className="object-contain drop-shadow-2xl"
                            priority
                        />
                    </div>
                </div>

                {/* Animated rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-40 h-40 border-4 border-black/20 animate-ping-slow" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-black/10 animate-ping-slower" />
                </div>
            </div>

            <style jsx>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes pulse-scale {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes ping-slow {
                    0% { transform: scale(1); opacity: 0.5; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                @keyframes ping-slower {
                    0% { transform: scale(1); opacity: 0.3; }
                    100% { transform: scale(1.8); opacity: 0; }
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
                .animate-ping-slower {
                    animation: ping-slower 2.5s ease-out infinite;
                }
            `}</style>
        </div>
    );
}

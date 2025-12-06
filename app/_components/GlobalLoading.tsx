'use client';

import Image from 'next/image';

interface GlobalLoadingProps {
    message?: string;
    fullScreen?: boolean;
}

export default function GlobalLoading({ message = 'YÜKLENİYOR...', fullScreen = true }: GlobalLoadingProps) {
    const containerClasses = fullScreen
        ? 'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-neo-yellow overflow-hidden'
        : 'flex flex-col items-center justify-center min-h-[400px] bg-neo-yellow rounded-lg overflow-hidden border-4 border-black shadow-neo';

    return (
        <div className={containerClasses}>
            {/* Background Geometric Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neo-pink rounded-full blur-3xl opacity-40 animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neo-green rounded-full blur-3xl opacity-40 animate-pulse-slow delay-1000" />
                <div className="absolute top-[20%] right-[10%] w-20 h-20 border-8 border-black rotate-12 animate-float" />
                <div className="absolute bottom-[20%] left-[10%] w-16 h-16 bg-black rotate-45 animate-float delay-500" />
            </div>

            {/* Central Spinner Container */}
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                    {/* Outer Square Spinner */}
                    <div className="absolute inset-0 border-8 border-black animate-spin-slow bg-white" />

                    {/* Inner Circle Spinner */}
                    <div className="absolute inset-2 border-8 border-neo-pink rounded-full animate-reverse-spin border-t-transparent border-l-transparent" />

                    {/* Logo Container */}
                    <div className="relative w-20 h-20 animate-bounce-custom z-20 bg-white border-2 border-black p-2 shadow-neo-sm transform rotate-3">
                        <Image
                            src="/sdclogo.png"
                            alt="SDC Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Loading Text */}
                <div className="bg-black text-white px-6 py-3 font-black text-xl tracking-widest uppercase shadow-neo transform -skew-x-12">
                    <span className="inline-block transform skew-x-12 animate-pulse">{message}</span>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin-slow {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes reverse-spin {
                    0% { transform: rotate(360deg); }
                    100% { transform: rotate(0deg); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(var(--tw-rotate)); }
                    50% { transform: translateY(-20px) rotate(var(--tw-rotate)); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.1); }
                }
                @keyframes bounce-custom {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(0.8); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
                .animate-reverse-spin {
                    animation: reverse-spin 3s linear infinite;
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }
                .animate-bounce-custom {
                    animation: bounce-custom 1s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

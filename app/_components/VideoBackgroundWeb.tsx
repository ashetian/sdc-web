// components/VideoBackgroundWeb.tsx
'use client';
import React from 'react';
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface VideoBackgroundProps {
    children?: React.ReactNode;
}

const VideoBackgroundWeb: React.FC<VideoBackgroundProps> = ( { children }: VideoBackgroundProps) => {

    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const hls = new Hls();
        hls.loadSource('/videos/video.m3u8');
        if (videoRef.current) {
        hls.attachMedia(videoRef.current);
        videoRef.current.play();
        }
    }, []);

    return (
        <div className="relative flex items-center justify-center w-full h-screen overflow-hidden">
        <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
        >

        </video>
        <div className="relative">
            {children}
        </div>
        </div>
    );
};

export default VideoBackgroundWeb;

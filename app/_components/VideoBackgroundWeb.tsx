'use client';
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function VideoBackgroundWeb() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hls = new Hls();
    hls.loadSource('/videos/sun.m3u8');
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(error => {
        console.log("Video otomatik oynatılamadı:", error);
      });
    });

    return () => {
      hls.destroy();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="absolute w-full h-full object-cover"
      playsInline
      autoPlay
      muted
      loop
    />
  );
}

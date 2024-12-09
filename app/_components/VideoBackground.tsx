'use client';
import { useEffect, useState } from 'react';
import VideoBackgroundWeb from './VideoBackgroundWeb';
import VideoBackgroundİos from './VideoBackgroundİos';

const VIDEO_SOURCE = '/videos/video.m3u8';

export default function VideoBackground() {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full">
      {isIOS ? (
        <VideoBackgroundİos vidsource={VIDEO_SOURCE} />
      ) : (
        <VideoBackgroundWeb />
      )}
    </div>
  );
}

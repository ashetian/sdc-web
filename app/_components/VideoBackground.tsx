'use client';
import React, { useEffect, useState } from 'react';
import VideoBackgroundWeb from './VideoBackgroundWeb';
import VideoBackgroundİos from './VideoBackgroundİos';

const vidsource = '/videos/video.m3u8';

const VideoBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check if the platform is iOS
    const iOS = () => {
      return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
      ].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    };

    if (isClient) {
      setIsIOS(iOS());
    }
  }, [isClient]);

  if (!isClient) {
    return null; // Optionally return a loading state or null until the client is ready
  }

  return isIOS ? (
    <VideoBackgroundİos vidsource={vidsource}>{children}</VideoBackgroundİos>
  ) : (
    <VideoBackgroundWeb>{children}</VideoBackgroundWeb>
  );
};

export default VideoBackground;

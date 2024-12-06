// components/VideoBackgroundİos.tsx
import React from 'react';

interface VideoBackgroundProps {
    vidsource:string,
    children?: React.ReactNode; // Optional children prop
}

const VideoBackgroundİos: React.FC<VideoBackgroundProps> = ( { children, vidsource }: VideoBackgroundProps) => {

  return (
    <div className="relative flex items-center justify-center w-full h-screen overflow-hidden">
    <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        src={vidsource}
    >

      </video>
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default VideoBackgroundİos;

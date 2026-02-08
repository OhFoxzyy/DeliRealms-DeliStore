'use client';

import React, { useState } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface VideoPlayerProps {
  element: PageElement;
}

export function VideoPlayer({ element }: VideoPlayerProps) {
  const src = element.content.src || '';
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: 'var(--page-background, #0a0a0a)',
        ...(element.style as React.CSSProperties),
      }}
      className="video-player-component"
    >
      <video
        ref={videoRef}
        src={src}
        controls={element.content.controls !== false}
        style={{ width: '100%', height: 'auto' }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}

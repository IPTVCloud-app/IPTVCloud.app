"use client";

import { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import { Play } from 'lucide-react';

interface ChannelThumbnailProps {
  channelId: string;
  name: string;
  className?: string;
}

export function ChannelThumbnail({ channelId, name, className = "" }: ChannelThumbnailProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [failed, setFailed] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    // Reset state when channelId changes
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");
    setImgSrc(`${apiUrl}/api/channels/thumbnail?id=${channelId}`);
    setFailed(false);
    setIsCapturing(false);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channelId]);

  const handleImageError = () => {
    if (failed || isCapturing) return; // Prevent infinite loops
    setFailed(true);
    setIsCapturing(true);
    captureFallbackFrame();
  };

  const captureFallbackFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");
    const streamUrl = `${apiUrl}/api/channels/${channelId}?res=480p`;

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 5,
        maxMaxBufferLength: 10,
        enableWorker: true,
      });
      hlsRef.current = hls;
      
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.muted = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch((e) => {
                console.log("Play failed, ignoring", e);
            });
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.muted = true;
      video.play().catch(() => {});
    }

    let captured = false;

    const captureFrame = () => {
      if (captured) return;
      
      // Wait until we actually have some video dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setImgSrc(dataUrl);
        setIsCapturing(false);
        captured = true;
        
        // Cleanup HLS stream to save bandwidth
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    };

    // Try to capture after a couple of seconds of playback
    video.addEventListener('timeupdate', () => {
        if (!captured && video.currentTime > 2) {
            captureFrame();
        }
    });

    // Fallback timeout in case timeupdate doesn't fire or stream is stuck
    setTimeout(() => {
      if (!captured) {
        setIsCapturing(false);
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      }
    }, 15000); // 15 seconds max wait
  };

  return (
    <div className={`relative bg-surface border border-border overflow-hidden group ${className}`}>
      {/* Hidden elements for fallback capture */}
      <video ref={videoRef} className="hidden" crossOrigin="anonymous" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {isCapturing && !imgSrc.startsWith('data:') ? (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/50 backdrop-blur-sm z-10">
          <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : null}

      {imgSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={imgSrc} 
          alt={`${name} thumbnail`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-full bg-page flex items-center justify-center">
          <span className="text-tertiary text-xs">No Signal</span>
        </div>
      )}
      
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
        <div className="w-12 h-12 rounded-full bg-brand/90 flex items-center justify-center text-white shadow-lg backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-all duration-300">
          <Play className="w-5 h-5 ml-1" />
        </div>
      </div>
    </div>
  );
}

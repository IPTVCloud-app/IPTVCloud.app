"use client";

import { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';

interface ChannelThumbnailProps {
  channelId: string;
  name: string;
  className?: string;
  logoUrl?: string; // Optional direct URL if available in parent data
}

export function ChannelThumbnail({ channelId, name, className = "", logoUrl }: ChannelThumbnailProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [failed, setFailed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

  useEffect(() => {
    const finalUrl = logoUrl || `${apiUrl}/api/channels/thumbnail?id=${channelId}`;
    Promise.resolve().then(() => {
      setImgSrc(finalUrl);
      setFailed(false);
    });
  }, [channelId, logoUrl, apiUrl]);

  // Hover timer effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isHovering) {
      timeout = setTimeout(() => {
        setShowPreview(true);
      }, 5000); // 5 seconds hover
    } else {
      setShowPreview(false);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    }
    return () => clearTimeout(timeout);
  }, [isHovering]);

  // HLS stream preview effect
  useEffect(() => {
    if (showPreview && videoRef.current) {
      const streamUrl = `${apiUrl}/api/channels/stream?id=${channelId}`;
      const video = videoRef.current;

      const initHls = async () => {
        const Hls = (await import('hls.js')).default;
        if (Hls.isSupported()) {
          const hls = new Hls({
            startLevel: 0,
            capLevelToPlayerSize: true, // optimize for thumbnail
            autoStartLoad: true
          });
          hlsRef.current = hls;
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.play().catch(() => {});
        }
      };

      initHls();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [showPreview, channelId, apiUrl]);

  const BROKEN_ICON = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="12" fill="#141414"/><path d="M35 35L65 65M65 35L35 65" stroke="#333" stroke-width="4" stroke-linecap="round"/></svg>')}`;

  return (
    <div 
      className={`relative bg-surface border border-border overflow-hidden group ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {showPreview && (
        <video 
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover z-10"
          muted 
          playsInline
        />
      )}

      <div className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${showPreview ? 'opacity-0' : 'opacity-100'}`}>
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={failed ? BROKEN_ICON : imgSrc} 
            alt={`${name} logo`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="w-full h-full bg-page flex items-center justify-center p-4">
            <div className="text-center">
               <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-2">
                  <Play className="w-4 h-4 text-brand" />
               </div>
               <span className="text-tertiary text-[10px] uppercase font-bold tracking-widest">{name.substring(0, 3)}</span>
            </div>
          </div>
        )}
      </div>
      
      {!showPreview && (
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-brand/90 flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
            <Play className="w-5 h-5 ml-1" />
          </div>
        </div>
      )}
    </div>
  );
}

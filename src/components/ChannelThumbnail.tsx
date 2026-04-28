"use client";

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const apiUrl = (process.env.PUBLIC_API_URL || "").replace(/\/$/, "");
    // Favor provided logoUrl, then fallback to optimized thumbnail API
    setImgSrc(logoUrl || `${apiUrl}/api/channels/thumbnail?id=${channelId}`);
    setFailed(false);
  }, [channelId, logoUrl]);

  return (
    <div className={`relative bg-surface border border-border overflow-hidden group ${className}`}>
      {imgSrc && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={imgSrc} 
          alt={`${name} logo`}
          className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
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
      
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 backdrop-blur-[2px]">
        <div className="w-12 h-12 rounded-full bg-brand/90 flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
          <Play className="w-5 h-5 ml-1" />
        </div>
      </div>
    </div>
  );
}

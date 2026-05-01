import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ChannelThumbnail } from './ChannelThumbnail';

interface Channel {
  id: string;
  name: string;
  logo: string;
  category?: string;
  country?: string;
}

interface ChannelSliderProps {
  title: string;
  channels: Channel[];
}

export function ChannelSlider({ title, channels }: ChannelSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!channels || channels.length === 0) return null;

  return (
    <div className="w-full my-8 relative group">
      <h2 className="text-xl font-bold mb-4 text-primary">{title}</h2>
      
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-[60%] -translate-y-1/2 z-10 w-10 h-10 bg-surface/90 backdrop-blur border border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl hover:bg-page hover:text-brand"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div 
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x pb-4"
      >
        {channels.map((channel, idx) => (
          <Link key={idx} href={`/channels/watch?id=${channel.id}`} className="min-w-[240px] md:min-w-[280px] snap-start group/card block">
            <div className="card">
              <div className="relative w-full pt-[56.25%] bg-elevated">
                <div className="absolute inset-0">
                  <ChannelThumbnail 
                    channelId={channel.id} 
                    name={channel.name} 
                    logoUrl={channel.logo}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="p-3 flex items-start gap-3">
                 {channel.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={channel.logo} alt="" className="w-10 h-10 object-contain shrink-0 rounded-full bg-white/5 border border-border/50" />
                 ) : (
                    <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold uppercase shrink-0">
                       {channel.name.substring(0, 1)}
                    </div>
                 )}
                <div>
                  <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover/card:text-brand transition-colors text-primary">{channel.name}</h3>
                  <div className="mt-1 flex flex-col text-[11px] text-tertiary">
                    <span>{channel.category || 'General'} • {channel.country || 'International'}</span>
                    <span>Live now</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-[60%] -translate-y-1/2 z-10 w-10 h-10 bg-surface/90 backdrop-blur border border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl hover:bg-page hover:text-brand"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useMusic, Movie } from '@/context/MusicContext';
import { Server, Info } from 'lucide-react';

interface StreamPlayerProps {
  movie: Movie;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ movie }) => {
  const [embedServer, setEmbedServer] = useState<'vidsrc_to' | 'vidsrc_me' | 'embed_su' | 'autoembed'>('vidsrc_to');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Embed URLs using TMDB ID
  const getEmbedUrl = () => {
    switch (embedServer) {
      case 'vidsrc_to':
        return `https://vidsrc.to/embed/movie/${movie.id}`;
      case 'vidsrc_me':
        return `https://vidsrc.me/embed/movie?tmdb=${movie.id}`;
      case 'embed_su':
        return `https://embed.su/embed/movie/${movie.id}`;
      case 'autoembed':
        return `https://autoembed.co/movie/tmdb/${movie.id}`;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Player Area */}
      <div className="flex-1 flex flex-col bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Player Screen */}
        <div className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center">
          <iframe 
            ref={iframeRef}
            src={getEmbedUrl()}
            className="w-full h-full border-none"
            allowFullScreen
            scrolling="no"
            referrerPolicy="no-referrer" // Layer 1 Ad-Blocker: Referrer Stripping
            allow="autoplay; encrypted-media"
          />
        </div>

        {/* Player Controls Bar */}
        <div className="p-4 bg-zinc-900 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Server size={14} className="text-primary" />
            <span className="font-bold">Select Streaming Server:</span>
          </div>

          {/* Embed Server Switcher */}
          <div className="flex flex-wrap gap-2">
            {(['vidsrc_to', 'vidsrc_me', 'embed_su', 'autoembed'] as const).map((srv) => (
              <button
                key={srv}
                onClick={() => setEmbedServer(srv)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${embedServer === srv ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
              >
                {srv === 'vidsrc_to' ? 'VidSrc.to' : srv === 'vidsrc_me' ? 'VidSrc.me' : srv === 'embed_su' ? 'Embed.su' : 'AutoEmbed'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/60 leading-relaxed">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <p>If the video doesn't load or is slow, try switching to a different streaming server above. Referrer stripping is active to minimize popups and ads.</p>
      </div>
    </div>
  );
};
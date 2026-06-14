"use client";

import React, { useState, useRef } from 'react';
import { Movie } from '@/context/MusicContext';
import { Server, Info, Shield } from 'lucide-react';

interface StreamPlayerProps {
  movie: Movie;
}

type EmbedServerType = 
  | 'xplay' 
  | 'superembed' 
  | 'cinext' 
  | 'vidzee' 
  | 'vidzee_v2'
  | 'videasy' 
  | 'anyembed' 
  | 'vidsync' 
  | 'vidsrc' 
  | 'multiembed' 
  | 'twoembed' 
  | 'autoembed' 
  | 'embedsu';

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ movie }) => {
  const [embedServer, setEmbedServer] = useState<EmbedServerType>('xplay');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Exact Embed URLs using TMDB ID
  const getEmbedUrl = () => {
    switch (embedServer) {
      case 'xplay':
        return `https://play.xpass.top/e/movie/${movie.id}`;
      case 'superembed':
        return `https://play.superembed.cc/?video_id=${movie.id}&tmdb=1`;
      case 'cinext':
        return `https://cinextma-app.netlify.app/movie/${movie.id}/player`;
      case 'vidzee':
        return `https://player.vidzee.wtf/embed/movie/${movie.id}`;
      case 'vidzee_v2':
        return `https://player.vidzee.wtf/v2/embed/movie/${movie.id}`;
      case 'videasy':
        return `https://player.videasy.net/movie/${movie.id}`;
      case 'anyembed':
        return `https://anyembed.xyz/embed/tmdb-movie-${movie.id}`;
      case 'vidsync':
        return `https://vidsync.xyz/embed/movie/${movie.id}`;
      case 'vidsrc':
        return `https://vidsrc.to/embed/movie/${movie.id}`;
      case 'multiembed':
        return `https://multiembed.mov/?video_id=${movie.id}&tmdb=1`;
      case 'twoembed':
        return `https://www.2embed.online/embed/movie/${movie.id}`;
      case 'autoembed':
        return `https://player.autoembed.cc/embed/movie/${movie.id}`;
      case 'embedsu':
        return `https://embed.su/embed/movie/${movie.id}`;
    }
  };

  const servers: { id: EmbedServerType; label: string }[] = [
    { id: 'xplay', label: 'XPlay Cinema' },
    { id: 'superembed', label: 'SuperEmbed' },
    { id: 'cinext', label: 'Cinext' },
    { id: 'vidzee', label: 'VidZee' },
    { id: 'vidzee_v2', label: 'VidZee V2' },
    { id: 'videasy', label: 'VidEasy' },
    { id: 'anyembed', label: 'AnyEmbed' },
    { id: 'vidsync', label: 'VidSync' },
    { id: 'vidsrc', label: 'VidSrc' },
    { id: 'multiembed', label: 'MultiEmbed' },
    { id: 'twoembed', label: '2Embed' },
    { id: 'autoembed', label: 'AutoEmbed' },
    { id: 'embedsu', label: 'Embed.su' },
  ];

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
            referrerPolicy="no-referrer"
            allow="autoplay; encrypted-media"
          />
        </div>

        {/* Player Controls Bar */}
        <div className="p-4 bg-zinc-900 border-t border-white/5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Server size={14} className="text-primary" />
            <span className="font-bold">Select Streaming Server:</span>
          </div>

          {/* Embed Server Switcher */}
          <div className="flex flex-wrap gap-2">
            {servers.map((srv) => (
              <button
                key={srv.id}
                onClick={() => setEmbedServer(srv.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${embedServer === srv.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
              >
                {srv.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/60 leading-relaxed">
          <Info size={16} className="text-primary shrink-0 mt-0.5" />
          <p>If the video doesn't load or is slow, try switching to a different streaming server above. Referrer stripping is active to minimize tracking.</p>
        </div>
        <div className="flex gap-2 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-xs text-primary-foreground/80 leading-relaxed">
          <Shield size={16} className="text-primary shrink-0 mt-0.5" />
          <p><strong>Privacy Protection Active:</strong> Referrer stripping is enabled to hide your connection details from third-party ad networks.</p>
        </div>
      </div>
    </div>
  );
};
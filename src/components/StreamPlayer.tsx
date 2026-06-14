"use client";

import React, { useState, useRef } from 'react';
import { Movie } from '@/context/MusicContext';
import { Server, Info, Shield, RefreshCcw } from 'lucide-react';

interface StreamPlayerProps {
  movie: Movie;
}

type EmbedServerType = 
  | 'vidzee'
  | 'vidsrc'
  | 'twoembed' 
  | 'autoembed' 
  | 'nxsha'
  | 'multiembed' 
  | 'superembed' 
  | 'xplay' 
  | 'vidzee_v2'
  | 'videasy' 
  | 'vidsync' 
  | 'anyembed';

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ movie }) => {
  const [embedServer, setEmbedServer] = useState<EmbedServerType>('vidzee');
  const [key, setKey] = useState(0);

  const getEmbedUrl = () => {
    const id = movie.id;
    switch (embedServer) {
      case 'vidzee':
        return `https://player.vidzee.wtf/embed/movie/${id}`;
      case 'vidsrc':
        return `https://vidsrc.to/embed/movie/${id}`;
      case 'twoembed':
        return `https://www.2embed.cc/embed/${id}`;
      case 'autoembed':
        return `https://autoembed.app/embed/movie/${id}`;
      case 'nxsha':
        // Use the provided URL format with autoplay and language query params
        return `https://web.nxsha.app/embed/movie/${id}?lang=tamil&autoplay=true`;
      case 'multiembed':
        return `https://multiembed.mov/?video_id=${id}&tmdb=1`;
      case 'superembed':
        return `https://multiembed.sbs/embed.php?tmdb=${id}`;
      case 'xplay':
        return `https://play.xpass.top/e/movie/${id}`;
      case 'vidzee_v2':
        return `https://player.vidzee.wtf/v2/embed/movie/${id}`;
      case 'videasy':
        return `https://player.videasy.net/movie/${id}`;
      case 'vidsync':
        return `https://vidsync.xyz/embed/movie/${id}`;
      case 'anyembed':
        return `https://anyembed.xyz/embed/tmdb-movie-${id}?theme=purple&logo=false`;
      default:
        return `https://player.vidzee.wtf/embed/movie/${id}`;
    }
  };

  const servers: { id: EmbedServerType; label: string; priority?: boolean }[] = [
    { id: 'vidzee', label: 'VidZee (Stable)', priority: true },
    { id: 'vidsrc', label: 'VidSrc (Fast)', priority: true },
    { id: 'twoembed', label: '2Embed', priority: true },
    { id: 'autoembed', label: 'AutoEmbed' },
    { id: 'nxsha', label: 'NXSHA' },
    { id: 'multiembed', label: 'MultiEmbed' },
    { id: 'superembed', label: 'SuperEmbed' },
    { id: 'xplay', label: 'XPlay Cinema' },
    { id: 'anyembed', label: 'AnyEmbed' },
  ];

  const refreshPlayer = () => setKey(prev => prev + 1);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex-1 flex flex-col bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center">
          <iframe 
            key={`${embedServer}-${movie.id}-${key}`}
            src={getEmbedUrl()}
            className="w-full h-full border-none"
            allowFullScreen
            scrolling="no"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
          />
        </div>

        <div className="p-4 bg-zinc-900 border-t border-white/5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Server size={14} className="text-primary" />
              <span className="font-bold">Streaming Sources:</span>
            </div>
            <button 
              onClick={refreshPlayer}
              className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors"
            >
              <RefreshCcw size={12} />
              Reload Player
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {servers.map((srv) => (
              <button
                key={srv.id}
                onClick={() => setEmbedServer(srv.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  embedServer === srv.id 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                } ${srv.priority && embedServer !== srv.id ? 'border border-purple-500/20' : ''}`}
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
          <p>
            If a server plays the wrong movie, please switch to <strong>VidZee</strong> or <strong>VidSrc</strong>. These servers have the most accurate movie-to-ID mapping.
          </p>
        </div>
        <div className="flex gap-2 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-xs text-primary-foreground/80 leading-relaxed">
          <Shield size={16} className="text-primary shrink-0 mt-0.5" />
          <p>
            <strong>Connection Tip:</strong> Some servers might require you to click a 'Play' button twice inside the frame. Ad-blockers are recommended for the best experience.
          </p>
        </div>
      </div>
    </div>
  );
};
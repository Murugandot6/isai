"use client";

import React, { useState } from 'react';
import { Movie } from '@/context/MusicContext';
import { Server, Info, Shield, RefreshCcw, ExternalLink, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StreamPlayerProps {
  movie: Movie;
}

type EmbedServerType = 
  | 'vidsrc'
  | 'vidsrc_me'
  | 'vidsrc_pro'
  | 'twoembed' 
  | 'autoembed' 
  | 'filmu'
  | 'vidzee'
  | 'nxsha'
  | 'videasy' 
  | 'vidsync';

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ movie }) => {
  const isImdb = movie.id.startsWith('tt');
  // Default to vidsrc (VidSrc.to) for IMDb IDs as it has the best compatibility
  const [embedServer, setEmbedServer] = useState<EmbedServerType>(isImdb ? 'vidsrc' : 'filmu');
  const [key, setKey] = useState(0);

  const getEmbedUrl = () => {
    const id = movie.id;
    switch (embedServer) {
      case 'vidsrc':
        return `https://vidsrc.to/embed/movie/${id}`;
      case 'vidsrc_me':
        return isImdb 
          ? `https://vidsrc.me/embed/movie?imdb=${id}`
          : `https://vidsrc.me/embed/movie?tmdb=${id}`;
      case 'vidsrc_pro':
        return `https://vidsrc.pro/embed/movie/${id}`;
      case 'twoembed':
        return `https://www.2embed.cc/embed/${id}`;
      case 'autoembed':
        return isImdb
          ? `https://player.autoembed.cc/embed/movie/${id}`
          : `https://player.autoembed.cc/embed/movie/${id}`;
      case 'filmu':
        return `https://embed.filmu.in/embed/movie/${id}`;
      case 'vidzee':
        return `https://player.vidzee.wtf/embed/movie/${id}`;
      case 'nxsha':
        return `https://web.nxsha.app/embed/movie/${id}?lang=tamil&autoplay=true`;
      case 'videasy':
        return `https://player.videasy.net/movie/${id}`;
      case 'vidsync':
        return `https://vidsync.xyz/embed/movie/${id}`;
      default:
        return `https://vidsrc.to/embed/movie/${id}`;
    }
  };

  const servers: { id: EmbedServerType; label: string; priority?: boolean; supportsImdb?: boolean }[] = [
    { id: 'vidsrc', label: 'VidSrc.to (Best for Stremio)', priority: true, supportsImdb: true },
    { id: 'vidsrc_me', label: 'VidSrc.me (Highly Stable)', priority: true, supportsImdb: true },
    { id: 'vidsrc_pro', label: 'VidSrc.pro', priority: true, supportsImdb: true },
    { id: 'twoembed', label: '2Embed', supportsImdb: true },
    { id: 'autoembed', label: 'AutoEmbed', supportsImdb: true },
    { id: 'filmu', label: 'Filmu (Premium TMDb)', supportsImdb: false },
    { id: 'vidzee', label: 'VidZee (TMDb)', supportsImdb: false },
    { id: 'nxsha', label: 'NXSHA (Tamil TMDb)', supportsImdb: false },
  ];

  const refreshPlayer = () => setKey(prev => prev + 1);

  const handleOpenExternal = () => {
    window.open(getEmbedUrl(), '_blank', 'noopener,noreferrer');
  };

  // Filter servers based on whether they support the current ID type
  const activeServers = servers.filter(srv => !isImdb || srv.supportsImdb);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex-1 flex flex-col bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Iframe Container */}
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

        {/* Controls & Server Switcher */}
        <div className="p-4 bg-zinc-900 border-t border-white/5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Server size={14} className="text-purple-400" />
              <span className="font-bold">
                Streaming Sources ({isImdb ? 'IMDb Mode' : 'TMDb Mode'}):
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={refreshPlayer}
                className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors"
              >
                <RefreshCcw size={12} />
                Reload Player
              </button>

              <Button 
                onClick={handleOpenExternal}
                variant="outline" 
                size="sm"
                className="h-8 rounded-lg border-purple-500/20 hover:bg-purple-500/10 text-purple-300 hover:text-white text-[10px] font-bold gap-1.5"
              >
                <ExternalLink size={12} />
                Open in New Tab
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeServers.map((srv) => (
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

      {/* Tips & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/60 leading-relaxed">
          <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
          <p>
            Stremio content uses IMDb IDs. We have automatically selected <strong>VidSrc.to</strong> as your default server for maximum compatibility.
          </p>
        </div>
        <div className="flex gap-2 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-xs text-purple-200 leading-relaxed">
          <Shield size={16} className="text-purple-400 shrink-0 mt-0.5" />
          <p>
            <strong>Adblocker Tip:</strong> If the player is blocked or shows a blank screen, click the <strong>"Open in New Tab"</strong> button above to bypass iframe restrictions.
          </p>
        </div>
      </div>
    </div>
  );
};
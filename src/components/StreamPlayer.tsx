"use client";

import React, { useState } from 'react';
import { Movie } from '@/context/MusicContext';
import { Server, Info, Shield, RefreshCcw, ExternalLink, Play, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StreamPlayerProps {
  movie: Movie;
}

type EmbedServerType = 
  | 'vidsrc'
  | 'vidsrc_xyz'
  | 'embed_su'
  | 'vidsrc_me'
  | 'vidsrc_pro'
  | 'twoembed' 
  | 'autoembed' 
  | 'filmu'
  | 'vidzee'
  | 'nxsha';

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ movie }) => {
  const isImdb = movie.id.startsWith('tt');
  const isTv = movie.genre?.toLowerCase().includes('tv') || movie.genre?.toLowerCase().includes('series');
  
  // Default to vidsrc_xyz or vidsrc for IMDb IDs
  const [embedServer, setEmbedServer] = useState<EmbedServerType>(isImdb ? 'vidsrc_xyz' : 'filmu');
  const [season, setSeason] = useState('1');
  const [episode, setEpisode] = useState('1');
  const [key, setKey] = useState(0);

  const getEmbedUrl = () => {
    const id = movie.id;
    switch (embedServer) {
      case 'vidsrc_xyz':
        return isTv
          ? `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`
          : `https://vidsrc.xyz/embed/movie/${id}`;
      case 'embed_su':
        return isTv
          ? `https://embed.su/embed/tv/${id}/${season}/${episode}`
          : `https://embed.su/embed/movie/${id}`;
      case 'vidsrc':
        return isTv 
          ? `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
          : `https://vidsrc.to/embed/movie/${id}`;
      case 'vidsrc_me':
        if (isTv) {
          return isImdb 
            ? `https://vidsrc.me/embed/tv?imdb=${id}&season=${season}&episode=${episode}`
            : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
        }
        return isImdb 
          ? `https://vidsrc.me/embed/movie?imdb=${id}`
          : `https://vidsrc.me/embed/movie?tmdb=${id}`;
      case 'vidsrc_pro':
        return isTv
          ? `https://vidsrc.pro/embed/tv/${id}/${season}/${episode}`
          : `https://vidsrc.pro/embed/movie/${id}`;
      case 'twoembed':
        return isTv
          ? `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`
          : `https://www.2embed.cc/embed/${id}`;
      case 'autoembed':
        return isTv
          ? `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`
          : `https://player.autoembed.cc/embed/movie/${id}`;
      case 'filmu':
        return `https://embed.filmu.in/embed/movie/${id}`;
      case 'vidzee':
        return `https://player.vidzee.wtf/embed/movie/${id}`;
      case 'nxsha':
        return `https://web.nxsha.app/embed/movie/${id}?lang=tamil&autoplay=true`;
      default:
        return `https://vidsrc.xyz/embed/movie/${id}`;
    }
  };

  const servers: { id: EmbedServerType; label: string; priority?: boolean; supportsImdb?: boolean; supportsTv?: boolean }[] = [
    { id: 'vidsrc_xyz', label: 'VidSrc.xyz (Highly Recommended)', priority: true, supportsImdb: true, supportsTv: true },
    { id: 'embed_su', label: 'Embed.su (Fast & Stable)', priority: true, supportsImdb: true, supportsTv: true },
    { id: 'vidsrc', label: 'VidSrc.to', supportsImdb: true, supportsTv: true },
    { id: 'vidsrc_me', label: 'VidSrc.me', supportsImdb: true, supportsTv: true },
    { id: 'vidsrc_pro', label: 'VidSrc.pro', supportsImdb: true, supportsTv: true },
    { id: 'twoembed', label: '2Embed', supportsImdb: true, supportsTv: true },
    { id: 'autoembed', label: 'AutoEmbed', supportsImdb: true, supportsTv: true },
    { id: 'filmu', label: 'Filmu (Premium TMDb)', supportsImdb: false, supportsTv: false },
    { id: 'vidzee', label: 'VidZee (TMDb)', supportsImdb: false, supportsTv: false },
    { id: 'nxsha', label: 'NXSHA (Tamil TMDb)', supportsImdb: false, supportsTv: false },
  ];

  const refreshPlayer = () => setKey(prev => prev + 1);

  const handleOpenExternal = () => {
    window.open(getEmbedUrl(), '_blank', 'noopener,noreferrer');
  };

  // Filter servers based on whether they support the current ID type and TV/Movie format
  const activeServers = servers.filter(srv => {
    const imdbMatch = !isImdb || srv.supportsImdb;
    const tvMatch = !isTv || srv.supportsTv;
    return imdbMatch && tvMatch;
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* TV Show Season/Episode Selectors */}
      {isTv && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Season:</span>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="w-[100px] bg-zinc-900 border-none rounded-xl font-bold text-xs h-9">
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                {Array.from({ length: 15 }).map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()} className="font-bold text-xs cursor-pointer">
                    Season {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Episode:</span>
            <Select value={episode} onValueChange={setEpisode}>
              <SelectTrigger className="w-[100px] bg-zinc-900 border-none rounded-xl font-bold text-xs h-9">
                <SelectValue placeholder="Episode" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                {Array.from({ length: 30 }).map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()} className="font-bold text-xs cursor-pointer">
                    Episode {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Iframe Container - Removed restrictive sandbox attribute to allow video players to load correctly */}
        <div className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center">
          <iframe 
            key={`${embedServer}-${movie.id}-${season}-${episode}-${key}`}
            src={getEmbedUrl()}
            className="w-full h-full border-none"
            allowFullScreen
            scrolling="no"
            referrerPolicy="origin"
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>

        {/* Controls & Server Switcher */}
        <div className="p-4 bg-zinc-900 border-t border-white/5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Server size={14} className="text-purple-400" />
              <span className="font-bold">
                Streaming Sources ({isImdb ? 'IMDb' : 'TMDb'} • {isTv ? 'TV Series' : 'Movie'}):
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
            Stremio content uses IMDb IDs. We have automatically selected <strong>VidSrc.xyz</strong> as your default server for maximum compatibility.
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
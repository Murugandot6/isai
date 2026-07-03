"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '@/context/MusicContext';
import { Server, RefreshCcw, ExternalLink, Play, AlertTriangle, ChevronRight, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface StreamPlayerProps {
  movie: Movie;
}

interface VideoSource {
  id: string;
  name: string;
  getMovieUrl: (id: string) => string;
  getTvUrl: (id: string, season: string, episode: string) => string;
}

const PLAYER_ACCENT = '9333ea';

const VIDEO_SOURCES: VideoSource[] = [
  {
    id: 'vyla',
    name: 'Vyla (Primary)',
    getMovieUrl: (id) => {
      const isImdb = id.startsWith('tt');
      return `https://player.vyla.cc/?id=${id}${!isImdb ? '&tmdb=1' : ''}&color=${PLAYER_ACCENT}`;
    },
    getTvUrl: (id, s, e) => {
      const isImdb = id.startsWith('tt');
      return `https://player.vyla.cc/?id=${id}${!isImdb ? '&tmdb=1' : ''}&s=${s}&e=${e}&color=${PLAYER_ACCENT}`;
    }
  },
  {
    id: 'vidcore',
    name: 'VidCore',
    getMovieUrl: (id) => `https://vidcore.net/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidcore.net/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'cinesrc',
    name: 'CineSRC',
    getMovieUrl: (id) => `https://cinesrc.st/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://cinesrc.st/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'vidlux',
    name: 'VidLux',
    getMovieUrl: (id) => `https://vidlux.xyz/embed/movie/${id}?autoplay=true`,
    getTvUrl: (id, s, e) => `https://vidlux.xyz/embed/tv/${id}/${s}/${e}?autoplay=true`
  },
  {
    id: 'vidsrcto',
    name: 'VidSrc.to',
    getMovieUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'smashystream',
    name: 'SmashyStream',
    getMovieUrl: (id) => `https://embed.smashystream.com/playere.php?tmdb=${id}`,
    getTvUrl: (id, s, e) => `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`
  }
];

const FALLBACK_TIMEOUT_MS = 25000;

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ movie }) => {
  const lowerGenre = movie.genre?.toLowerCase() || '';
  const isTv = lowerGenre.includes('tv') || lowerGenre.includes('series');

  const [activeSourceIdx, setActiveSourceIdx] = useState(0);
  const [season, setSeason] = useState('1');
  const [episode, setEpisode] = useState('1');
  const [key, setKey] = useState(0);
  const [timeLeft, setTimeLeft] = useState(FALLBACK_TIMEOUT_MS / 1000);
  const [autoFallbackEnabled, setAutoFallbackEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setActiveSourceIdx(0);
    resetFallbackTimer();
  }, [movie.id, season, episode]);

  useEffect(() => {
    if (!autoFallbackEnabled) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextSource();
          return FALLBACK_TIMEOUT_MS / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [autoFallbackEnabled, activeSourceIdx]);

  const resetFallbackTimer = () => {
    setTimeLeft(FALLBACK_TIMEOUT_MS / 1000);
    setAutoFallbackEnabled(true);
  };

  const getEmbedUrl = (): string => {
    const source = VIDEO_SOURCES[activeSourceIdx];
    if (!source) return '';
    return isTv ? source.getTvUrl(movie.id, season, episode) : source.getMovieUrl(movie.id);
  };

  const handleNextSource = () => {
    const nextIdx = (activeSourceIdx + 1) % VIDEO_SOURCES.length;
    setActiveSourceIdx(nextIdx);
    resetFallbackTimer();
  };

  const handleOpenExternal = () => {
    window.open(getEmbedUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Viewport Area */}
      <div className="relative flex-1 group">
        <iframe
          key={`${activeSourceIdx}-${movie.id}-${season}-${episode}-${key}`}
          src={getEmbedUrl()}
          className="w-full h-full border-none"
          allowFullScreen
          scrolling="no"
          referrerPolicy="origin"
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
        />
        
        {/* TV Controls Floating Overlay */}
        {isTv && (
          <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="w-[110px] bg-black/60 backdrop-blur-xl border-white/10 text-white font-black text-[10px] h-9 rounded-full uppercase tracking-widest">
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                {Array.from({ length: 15 }).map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()} className="font-bold text-xs">Season {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={episode} onValueChange={setEpisode}>
              <SelectTrigger className="w-[110px] bg-black/60 backdrop-blur-xl border-white/10 text-white font-black text-[10px] h-9 rounded-full uppercase tracking-widest">
                <SelectValue placeholder="Episode" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                {Array.from({ length: 30 }).map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()} className="font-bold text-xs">Episode {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Controller Bar */}
      <div className="p-4 md:p-6 bg-zinc-950 border-t border-white/5 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Live Station</span>
            </div>
            <div className="flex items-center gap-2">
              <Server size={14} className="text-purple-500" />
              <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
                Server: <span className="text-purple-400">{VIDEO_SOURCES[activeSourceIdx].name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {autoFallbackEnabled && (
              <div className="hidden sm:flex items-center gap-2.5 px-4 py-1.5 bg-purple-600/10 border border-purple-500/20 rounded-full">
                <Clock size={12} className="text-purple-400" />
                <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider">Fallback in {Math.round(timeLeft)}s</span>
                <button onClick={() => setAutoFallbackEnabled(false)} className="text-[9px] font-black text-white hover:text-red-400 uppercase tracking-widest ml-1">Cancel</button>
              </div>
            )}
            <button onClick={() => setKey(k => k + 1)} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors" title="Reload Player">
              <RefreshCcw size={16} />
            </button>
            <Button onClick={handleOpenExternal} variant="outline" className="rounded-full border-white/10 h-10 px-5 text-[10px] font-black uppercase tracking-widest gap-2 bg-white/5">
              <ExternalLink size={14} />
              Popout
            </Button>
          </div>
        </div>

        {/* Server Switcher Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Switch Station Node</p>
            <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-bold">
              <ShieldCheck size={12} className="text-green-500" />
              SECURE TLS ACTIVE
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {VIDEO_SOURCES.map((source, idx) => (
              <button
                key={source.id}
                onClick={() => {
                  setActiveSourceIdx(idx);
                  setAutoFallbackEnabled(false);
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                  activeSourceIdx === idx 
                    ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20" 
                    : "bg-white/5 border-white/5 text-zinc-500 hover:text-zinc-200 hover:border-white/10"
                )}
              >
                {source.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamPlayer;
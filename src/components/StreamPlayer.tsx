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

// Accent Color: Pink-600
const PLAYER_ACCENT = 'db2777';

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
    name: 'VidCore (Fast)',
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
    id: 'smashystream',
    name: 'SmashyStream',
    getMovieUrl: (id) => `https://embed.smashystream.com/playere.php?tmdb=${id}`,
    getTvUrl: (id, s, e) => `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`
  },
  {
    id: 'rivestream',
    name: 'Rivestream',
    getMovieUrl: (id) => `https://www.rivestream.app/api/v1/player/${id}`,
    getTvUrl: (id, s, e) => `https://www.rivestream.app/api/v1/player/${id}?season=${s}&episode=${e}`
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
          <div className="absolute top-6 left-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="w-[120px] bg-black/80 backdrop-blur-xl border-white/10 text-white font-bold text-[11px] h-10 rounded-full uppercase tracking-[0.1em]">
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                {Array.from({ length: 15 }).map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()} className="font-bold text-xs uppercase">Season {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={episode} onValueChange={setEpisode}>
              <SelectTrigger className="w-[120px] bg-black/80 backdrop-blur-xl border-white/10 text-white font-bold text-[11px] h-10 rounded-full uppercase tracking-[0.1em]">
                <SelectValue placeholder="Episode" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                {Array.from({ length: 40 }).map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()} className="font-bold text-xs uppercase">Episode {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Controller Bar */}
      <div className="p-6 md:p-8 bg-zinc-950 border-t border-white/5 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Broadcast Station</span>
            <div className="flex items-center gap-2">
              <Server size={14} className="text-pink-500" />
              <p className="text-xs font-bold text-zinc-300 uppercase tracking-[0.15em]">
                Active Node: <span className="text-pink-500">{VIDEO_SOURCES[activeSourceIdx].name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {autoFallbackEnabled && (
              <div className="hidden sm:flex items-center gap-3 px-5 py-2 bg-pink-600/10 border border-pink-500/20 rounded-full">
                <Clock size={14} className="text-pink-400" />
                <span className="text-[10px] font-bold text-pink-300 uppercase tracking-widest">Auto-Node in {Math.round(timeLeft)}s</span>
                <button onClick={() => setAutoFallbackEnabled(false)} className="text-[9px] font-bold text-white/50 hover:text-white uppercase tracking-widest ml-2 border-l border-white/10 pl-3">Stop</button>
              </div>
            )}
            <button 
              onClick={() => setKey(k => k + 1)} 
              className="p-3 rounded-full bg-white/5 hover:bg-pink-600 hover:text-white transition-all border border-white/5"
              title="Refresh Stream"
            >
              <RefreshCcw size={16} />
            </button>
            <Button 
              onClick={() => window.open(getEmbedUrl(), '_blank')} 
              variant="outline" 
              className="rounded-full border-white/10 h-12 px-6 text-[10px] font-bold uppercase tracking-[0.2em] gap-2 bg-white/5 hover:bg-white/10"
            >
              <ExternalLink size={14} />
              Theater Popout
            </Button>
          </div>
        </div>

        {/* Server Selection Pills */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Channel Selection</p>
            <div className="flex items-center gap-1.5 text-[9px] text-zinc-600 font-bold tracking-widest uppercase">
              <ShieldCheck size={12} className="text-green-500" />
              End-to-End SSL Active
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {VIDEO_SOURCES.map((source, idx) => (
              <button
                key={source.id}
                onClick={() => {
                  setActiveSourceIdx(idx);
                  setAutoFallbackEnabled(false);
                }}
                className={cn(
                  "px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all border",
                  activeSourceIdx === idx 
                    ? "bg-pink-600 border-pink-500 text-white shadow-xl shadow-pink-600/20" 
                    : "bg-white/[0.02] border-white/5 text-zinc-500 hover:text-zinc-200 hover:border-white/10"
                )}
              >
                {source.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamPlayer;
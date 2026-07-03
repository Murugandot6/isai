"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '@/context/MusicContext';
import { Server, RefreshCcw, ExternalLink, Play, AlertTriangle, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface StreamPlayerProps {
  movie: Movie;
}

interface VideoSource {
  id: string;
  name: string;
  getMovieUrl: (id: string) => string;
  getTvUrl: (id: string, season: string, episode: string) => string;
}

const VIDEO_SOURCES: VideoSource[] = [
  // 1. VidCore (Primary 1)
  {
    id: 'vidcore',
    name: 'VidCore (Primary 1)',
    getMovieUrl: (id) => `https://vidcore.net/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidcore.net/embed/tv/${id}/${s}/${e}`
  },
  // 2. CineSRC (Primary 2)
  {
    id: 'cinesrc',
    name: 'CineSRC (Primary 2)',
    getMovieUrl: (id) => `https://cinesrc.st/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://cinesrc.st/embed/tv/${id}/${s}/${e}`
  },
  // 3. VidLux (Primary 3)
  {
    id: 'vidlux',
    name: 'VidLux (Primary 3)',
    getMovieUrl: (id) => `https://vidlux.xyz/embed/movie/${id}?autoplay=true`,
    getTvUrl: (id, s, e) => `https://vidlux.xyz/embed/tv/${id}/${s}/${e}?autoplay=true`
  },
  // 4. ZXCSTREAM (Primary 4)
  {
    id: 'zxcstream',
    name: 'ZXCSTREAM (Primary 4)',
    getMovieUrl: (id) => `https://a.zxcstream.xyz/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://a.zxcstream.xyz/embed/tv/${id}/${s}/${e}`
  },
  // Fallbacks & Mirrors
  {
    id: 'vidsrcto',
    name: 'VidSrc.to (Fastest)',
    getMovieUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'vidsrccc',
    name: 'VidSrc.cc (No Ads)',
    getMovieUrl: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'autoembed',
    name: 'AutoEmbed',
    getMovieUrl: (id) => `https://player.autoembed.app/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://player.autoembed.app/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'smashystream',
    name: 'SmashyStream',
    getMovieUrl: (id) => `https://embed.smashystream.com/playere.php?tmdb=${id}`,
    getTvUrl: (id, s, e) => `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`
  },
  {
    id: 'multiembed',
    name: 'MultiEmbed',
    getMovieUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    getTvUrl: (id, s, e) => `https://multiembed.mov/?video_id=${id}&s=${s}&e=${e}`
  },
  {
    id: 'vidfast',
    name: 'VidFast',
    getMovieUrl: (id) => `https://vidfast.pro/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidfast.pro/tv/${id}/${s}/${e}`
  },
  {
    id: '1embed',
    name: '1Embed',
    getMovieUrl: (id) => `https://1embed.cc/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://1embed.cc/embed/tv/${id}/${s}/${e}`
  },
  {
    id: '2embed',
    name: '2Embed',
    getMovieUrl: (id) => `https://www.2embed.cc/embed/${id}`,
    getTvUrl: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
  },
  {
    id: 'vixsrc',
    name: 'VixSrc',
    getMovieUrl: (id) => `https://vixsrc.to/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vixsrc.to/tv/${id}/${s}/${e}`
  },
  {
    id: 'vidlink',
    name: 'VidLink.pro',
    getMovieUrl: (id) => `https://vidlink.pro/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}`
  },
  {
    id: 'vidsrccx',
    name: 'VidSrc.cx',
    getMovieUrl: (id) => `https://vidsrc.cx/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.cx/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'vidsrcco',
    name: 'VidSrc.co',
    getMovieUrl: (id) => `https://vidsrc.co/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.co/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'vidsrcme',
    name: 'VidSrc.me',
    getMovieUrl: (id) => `https://vidsrcme.ru/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrcme.ru/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'vidsrcrip',
    name: 'VidSrc.rip',
    getMovieUrl: (id) => `https://vidsrc.rip/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.rip/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'primesrc',
    name: 'PrimeSRC',
    getMovieUrl: (id) => `https://primesrc.me/movie/${id}`,
    getTvUrl: (id, s, e) => `https://primesrc.me/tv/${id}/${s}/${e}`
  },
  {
    id: 'goatapi',
    name: 'GoatAPI',
    getMovieUrl: (id) => `https://goatapi.imreallydagoatt.workers.dev/movie/${id}`,
    getTvUrl: (id, s, e) => `https://goatapi.imreallydagoatt.workers.dev/tv/${id}/${s}/${e}`
  },
  {
    id: 'cinemaos',
    name: 'Cinemaos',
    getMovieUrl: (id) => `https://cinemaos.tech/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://cinemaos.tech/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'gomo',
    name: 'GoMo',
    getMovieUrl: (id) => `https://gomo.to/movie/${id}`,
    getTvUrl: (id, s, e) => `https://gomo.to/tv/${id}/${s}/${e}`
  }
];

const FALLBACK_TIMEOUT_MS = 25000; // 25 seconds before auto-fallback

const DIRECT_VIDEO_EXTENSIONS = ['.mp4', '.m3u8', '.mpd', '.webm', '.ogg', '.mov', '.mkv'];

const isPlayableDirectUrl = (url: string) => {
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.startsWith('blob:') || cleanUrl.startsWith('data:video') || DIRECT_VIDEO_EXTENSIONS.some(ext => cleanUrl.endsWith(ext));
};

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ movie }) => {
  const lowerGenre = movie.genre?.toLowerCase() || '';
  const isTv = lowerGenre.includes('tv') || lowerGenre.includes('series');

  const [manualStreamUrl, setManualStreamUrl] = useState<string | null>(null);
  const effectiveStreamUrl = manualStreamUrl || movie.streamUrl;
  const hasStreamUrl = Boolean(effectiveStreamUrl);
  const isDirectVideo = Boolean(effectiveStreamUrl && isPlayableDirectUrl(effectiveStreamUrl));

  const [activeSourceIdx, setActiveSourceIdx] = useState(0);
  const [isDirectMode, setIsDirectMode] = useState(hasStreamUrl && isDirectVideo);
  const [season, setSeason] = useState('1');
  const [episode, setEpisode] = useState('1');
  const [key, setKey] = useState(0);
  const [magnetInput, setMagnetInput] = useState('');
  
  // Fallback Timer State
  const [timeLeft, setTimeLeft] = useState(FALLBACK_TIMEOUT_MS / 1000);
  const [autoFallbackEnabled, setAutoFallbackEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsDirectMode(hasStreamUrl && isDirectVideo);
    setActiveSourceIdx(0);
    resetFallbackTimer();
  }, [effectiveStreamUrl, isDirectVideo, movie.id, season, episode]);

  // Handle auto-fallback countdown
  useEffect(() => {
    if (!autoFallbackEnabled || isDirectMode) {
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
  }, [autoFallbackEnabled, activeSourceIdx, isDirectMode]);

  const resetFallbackTimer = () => {
    setTimeLeft(FALLBACK_TIMEOUT_MS / 1000);
    setAutoFallbackEnabled(true);
  };

  const getEmbedUrl = (): string => {
    const source = VIDEO_SOURCES[activeSourceIdx];
    if (!source) return '';
    return isTv 
      ? source.getTvUrl(movie.id, season, episode) 
      : source.getMovieUrl(movie.id);
  };

  const handleNextSource = () => {
    const nextIdx = (activeSourceIdx + 1) % VIDEO_SOURCES.length;
    setActiveSourceIdx(nextIdx);
    setIsDirectMode(false);
    resetFallbackTimer();
    toast.info(`Auto-fallback: Switching to ${VIDEO_SOURCES[nextIdx].name}`);
  };

  const refreshPlayer = () => {
    setKey(prev => prev + 1);
    resetFallbackTimer();
    toast.success("Reloading player...");
  };

  const handleOpenExternal = () => {
    const url = isDirectMode && effectiveStreamUrl ? effectiveStreamUrl : getEmbedUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDirectPlay = () => {
    if (!magnetInput.trim()) return;
    setManualStreamUrl(magnetInput.trim());
    setIsDirectMode(true);
    setKey(prev => prev + 1);
    setAutoFallbackEnabled(false);
    toast.success("Playing custom direct link!");
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {isTv && !isDirectMode && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Season:</span>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="w-[100px] bg-zinc-900 border-none rounded-xl font-bold text-xs h-9">
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                {Array.from({ length: 15 }).map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()} className="font-bold text-xs">Season {i + 1}</SelectItem>
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
                  <SelectItem key={i + 1} value={(i + 1).toString()} className="font-bold text-xs">Episode {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Video Player Frame */}
        <div className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center">
          {isDirectMode && effectiveStreamUrl ? (
            isDirectVideo ? (
              <video
                key={`${effectiveStreamUrl}-${key}`}
                src={effectiveStreamUrl}
                className="w-full h-full"
                controls
                autoPlay
                preload="auto"
                playsInline
              />
            ) : (
              <iframe
                key={`${effectiveStreamUrl}-${key}`}
                src={effectiveStreamUrl}
                className="w-full h-full border-none"
                allowFullScreen
                scrolling="auto"
                referrerPolicy="origin"
                allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
              />
            )
          ) : (
            <iframe
              key={`${activeSourceIdx}-${movie.id}-${season}-${episode}-${key}`}
              src={getEmbedUrl()}
              className="w-full h-full border-none"
              allowFullScreen
              scrolling="no"
              referrerPolicy="origin"
              allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
            />
          )}
        </div>

        {/* Controls & Fallback Bar */}
        <div className="p-4 bg-zinc-900 border-t border-white/5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Server size={14} className="text-purple-400" />
              <span className="font-bold">
                Active Server: <span className="text-purple-400">{isDirectMode ? 'Direct Link' : VIDEO_SOURCES[activeSourceIdx].name}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {autoFallbackEnabled && !isDirectMode && (
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-600/10 border border-purple-500/20 rounded-lg">
                  <Clock size={12} className="text-purple-400" />
                  <span className="text-[10px] font-black text-purple-300">Switching in {Math.round(timeLeft)}s</span>
                  <button 
                    onClick={() => setAutoFallbackEnabled(false)}
                    className="text-[10px] font-black text-white hover:text-red-400 underline underline-offset-2 ml-1"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <button onClick={refreshPlayer} className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors">
                <RefreshCcw size={12} /> Reload Player
              </button>
              <Button onClick={handleOpenExternal} variant="outline" size="sm" className="h-8 rounded-lg border-purple-500/20 hover:bg-purple-500/10 text-purple-300 hover:text-white text-[10px] font-bold gap-1.5">
                <ExternalLink size={12} /> Open in New Tab
              </Button>
            </div>
          </div>

          {/* Fallback & Server Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
            <div className="flex items-start gap-2.5 text-left">
              <AlertTriangle size={16} className="text-purple-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-purple-300">Server not loading or giving ads?</p>
                <p className="text-[10px] text-zinc-400 leading-normal">
                  Our system defaults to the premier servers (VidCore, CineSRC, VidLux, ZXCSTREAM) and automatically cycles through mirrors if they fail.
                </p>
              </div>
            </div>
            <Button 
              onClick={handleNextSource}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9 px-4 rounded-xl shrink-0 gap-1.5"
            >
              Try Next Server
              <ChevronRight size={14} />
            </Button>
          </div>

          {/* Manual Server Selection */}
          <div className="space-y-2">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Select Server Manually</p>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1 bg-white/5 rounded-xl">
              {hasStreamUrl && isDirectVideo && (
                <button
                  onClick={() => {
                    setIsDirectMode(true);
                    setAutoFallbackEnabled(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${isDirectMode ? 'bg-green-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-green-500/20'}`}
                >
                  Direct Video
                </button>
              )}
              {VIDEO_SOURCES.map((source, idx) => (
                <button
                  key={source.id}
                  onClick={() => {
                    setActiveSourceIdx(idx);
                    setIsDirectMode(false);
                    setAutoFallbackEnabled(false);
                    toast.success(`Switched to ${source.name}`);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${(!isDirectMode && activeSourceIdx === idx) ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-purple-500/20'}`}
                >
                  {source.name}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Direct Link Input */}
          <div className="pt-2 border-t border-white/5">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Paste Custom Direct Link</p>
            <div className="flex gap-2 mt-1">
              <Input
                value={magnetInput}
                onChange={e => setMagnetInput(e.target.value)}
                placeholder="https://example.com/video.mp4 or blob:... "
                className="bg-white/5 border-white/10 text-xs text-white placeholder:text-zinc-600 h-8 rounded-xl flex-1"
              />
              <Button onClick={handleDirectPlay} className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-8 px-3 rounded-xl shrink-0">
                <Play size={12} fill="currentColor" className="mr-1" /> Play
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamPlayer;
"use client";

import React, { useState, useEffect } from 'react';
import { Movie } from '@/context/MusicContext';
import { Play, Pause, Radio, Heart, Server, Settings, RefreshCw, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface StreamPlayerProps {
  movie: Movie;
}

// Define the structure for sources more accurately if possible, or use index for key
interface Source {
  name: string;
  url: string;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ movie }) => {
  const [activeSourceIdx, setActiveSourceIdx] = useState(0);
  const [key, setKey] = useState(0);
  const [isTv, setIsTv] = useState(false);
  const [season, setSeason] = useState<number>(1); // Explicitly type state as number
  const [episode, setEpisode] = useState<number>(1); // Explicitly type state as number
  const isMobile = useIsMobile();

  // Multi-source streaming nodes for reliability
  const sources: Source[] = [
    { name: "SuperEmbed", url: `https://multiembed.to/get.php?video_id=${movie.id}&tmdb=1` },
    { name: "Vidsrc.to", url: `https://vidsrc.to/embed/movie/${movie.id}` },
    { name: "Vidsrc.me", url: `https://vidsrc.xyz/embed/movie/${movie.id}` },
    { name: "Embed.su", url: `https://embed.su/embed/movie/${movie.id}` }
  ];

  const tvSources: Source[] = [
    { name: "SuperEmbed", url: `https://multiembed.to/get.php?video_id=${movie.id}&tmdb=1&s=${season}&e=${episode}` },
    { name: "Vidsrc.to", url: `https://vidsrc.to/embed/tv/${movie.id}/${season}/${episode}` },
    { name: "Vidsrc.me", url: `https://vidsrc.xyz/embed/tv/${movie.id}/${season}/${episode}` },
    { name: "Embed.su", url: `https://embed.su/embed/tv/${movie.id}/${season}/${episode}` }
  ];

  useEffect(() => {
    // Detect if it's a TV series based on genre label
    if (movie.genre && (movie.genre.toLowerCase().includes('tv') || movie.genre.toLowerCase().includes('series'))) {
      setIsTv(true);
    } else {
      setIsTv(false);
    }
  }, [movie]);

  const activeSources = isTv ? tvSources : sources;
  const currentSource = activeSources[activeSourceIdx] || activeSources[0];

  const handleReload = () => {
    setKey(prev => prev + 1);
  };

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSeason(parseInt(e.target.value, 10));
  };

  const handleEpisodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEpisode(parseInt(e.target.value, 10));
  };

  return (
    <div className="flex flex-col w-full bg-zinc-950 rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Video Viewport */}
      <div className="relative w-full aspect-video bg-black group">
        <iframe
          key={`${activeSourceIdx}-${movie.id}-${season}-${episode}-${key}`}
          src={currentSource.url}
          className="w-full h-full border-none"
          allowFullScreen
          scrolling="no"
          referrerPolicy="origin"
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
        />
        
        {/* TV Episode Selector Overlay */}
        {isTv && (
          <div className="absolute top-3 left-3 flex gap-1.5 bg-black/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider px-1">S</span>
              <select 
                value={season} 
                onChange={handleSeasonChange}
                className="bg-zinc-900 text-white font-bold text-[10px] rounded px-1.5 py-0.5 border border-white/10 focus:outline-none appearance-none"
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <option key={i + 1} value={(i + 1).toString()}>{i + 1}</option>
                ))}
              </select>
            </div>
            <div className="w-px bg-white/10 my-1" />
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider px-1">E</span>
              <select 
                value={episode} 
                onChange={handleEpisodeChange}
                className="bg-zinc-900 text-white font-bold text-[10px] rounded px-1.5 py-0.5 border border-white/10 focus:outline-none appearance-none"
              >
                {Array.from({ length: 30 }).map((_, i) => (
                  <option key={i + 1} value={(i + 1).toString()}>{i + 1}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Compact Controller Bar */}
      <div className="p-4 md:p-6 bg-zinc-900/90 border-t border-white/5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Streaming Node</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Server size={12} className="text-pink-500" />
              <p className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider">
                Active: <span className="text-pink-500">{currentSource.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button 
              onClick={handleReload} 
              className="p-2 rounded-xl bg-white/5 hover:bg-pink-600 hover:text-white transition-all border border-white/5 text-zinc-300"
              title="Refresh Stream"
            >
              <RefreshCw size={14} />
            </button>
            <button 
              onClick={() => window.open(currentSource.url, '_blank')} 
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-wider transition-all"
            >
              <span>Popout</span>
            </button>
          </div>
        </div>

        {/* Server Selection Pills */}
        <div className="space-y-2 text-left">
          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Select Server Node (If video fails to load)</p>
          <div className="flex flex-wrap gap-1.5">
            {activeSources.map((source, idx) => (
              <button
                key={idx} // Use idx as the key since source objects don't have unique IDs
                onClick={() => setActiveSourceIdx(idx)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border",
                  activeSourceIdx === idx 
                    ? "bg-pink-600 border-pink-500 text-white shadow-md shadow-pink-600/10" 
                    : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10"
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
"use client";

import React, { useState, useEffect } from 'react';
import { Movie } from '@/context/MusicContext';
import { Server, RefreshCw, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreamPlayerProps {
  movie: Movie;
}

interface Source {
  name: string;
  url: string;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ movie }) => {
  const [activeSourceIdx, setActiveSourceIdx] = useState(0);
  const [key, setKey] = useState(0);
  const [isTv, setIsTv] = useState(false);
  const [season, setSeason] = useState<number>(1);
  const [episode, setEpisode] = useState<number>(1);

  // Updated multi-source streaming nodes for reliability across all devices
  const sources: Source[] = [
    { name: "RiveStream", url: `https://www.rivestream.app/embed?type=movie&id=${movie.id}` },
    { name: "Vyla", url: `http://player.vyla.cc/?id=${movie.id}` },
    { name: "Nxsha", url: `https://web.nxsha.app/embed/movie/${movie.id}` },
    { name: "VidCore", url: `https://vidcore.net/embed/movie/${movie.id}` },
    { name: "CineSrc", url: `https://cinesrc.st/embed/movie/${movie.id}` },
    { name: "VidLux", url: `https://vidlux.xyz/embed/movie/${movie.id}` },
    { name: "ZXCSTREAM", url: `https://a.zxcstream.xyz/embed/movie/${movie.id}` }
  ];

  const tvSources: Source[] = [
    { name: "RiveStream", url: `https://www.rivestream.app/embed?type=tv&id=${movie.id}&season=${season}&episode=${episode}` },
    { name: "Vyla", url: `http://player.vyla.cc/?id=${movie.id}&season=${season}&episode=${episode}` },
    { name: "Nxsha", url: `https://web.nxsha.app/embed/tv/${movie.id}/${season}/${episode}` },
    { name: "VidCore", url: `https://vidcore.net/embed/tv/${movie.id}/${season}/${episode}` },
    { name: "CineSrc", url: `https://cinesrc.st/embed/tv/${movie.id}/${season}/${episode}` },
    { name: "VidLux", url: `https://vidlux.xyz/embed/tv/${movie.id}/${season}/${episode}` },
    { name: "ZXCSTREAM", url: `https://a.zxcstream.xyz/embed/tv/${movie.id}&season=${season}&episode=${episode}` }
  ];

  useEffect(() => {
    // Determine if it's a TV series to switch source patterns
    const genreStr = movie.genre?.toLowerCase() || '';
    if (genreStr.includes('tv') || genreStr.includes('series') || movie.id.startsWith('tv-')) {
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
          <div className="absolute top-3 left-3 flex gap-1.5 bg-black/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 z-10">
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider px-1">S</span>
              <select 
                value={season} 
                onChange={(e) => setSeason(parseInt(e.target.value, 10))}
                className="bg-zinc-900 text-white font-bold text-[10px] rounded px-1.5 py-0.5 border border-white/10 focus:outline-none appearance-none cursor-pointer"
              >
                {Array.from({ length: 15 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
            <div className="w-px bg-white/10 my-1" />
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider px-1">E</span>
              <select 
                value={episode} 
                onChange={(e) => setEpisode(parseInt(e.target.value, 10))}
                className="bg-zinc-900 text-white font-bold text-[10px] rounded px-1.5 py-0.5 border border-white/10 focus:outline-none appearance-none cursor-pointer"
              >
                {Array.from({ length: 50 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Controller Bar */}
      <div className="p-4 md:p-6 bg-zinc-900/90 border-t border-white/5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button 
              onClick={handleReload} 
              className="p-2.5 rounded-xl bg-white/5 hover:bg-pink-600 hover:text-white transition-all border border-white/5 text-zinc-300 group"
              title="Refresh Stream"
            >
              <RefreshCw size={14} className="group-active:rotate-180 transition-transform duration-500" />
            </button>
            <button 
              onClick={() => window.open(currentSource.url, '_blank')} 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <ExternalLink size={12} />
              <span>External Player</span>
            </button>
          </div>
        </div>

        {/* Server Selection Grid */}
        <div className="space-y-2 text-left">
          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Select Server Node (If video fails to load)</p>
          <div className="flex flex-wrap gap-2">
            {activeSources.map((source, idx) => (
              <button
                key={`${source.name}-${idx}`}
                onClick={() => setActiveSourceIdx(idx)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm",
                  activeSourceIdx === idx 
                    ? "bg-pink-600 border-pink-500 text-white shadow-pink-600/20" 
                    : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/20"
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
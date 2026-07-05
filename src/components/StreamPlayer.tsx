"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '@/context/MusicContext';
import { Server, RefreshCw, ExternalLink, Play, Pause, Volume2, VolumeX, Maximize, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface StreamPlayerProps {
  movie: Movie;
}

interface Source {
  name: string;
  url?: string;
  isDirect?: boolean;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ movie }) => {
  const [activeSourceIdx, setActiveSourceIdx] = useState(0);
  const [key, setKey] = useState(0);
  const [isTv, setIsTv] = useState(false);
  const [season, setSeason] = useState<number>(1);
  const [episode, setEpisode] = useState<number>(1);

  // States for custom direct media playback
  const [directStreamUrl, setDirectStreamUrl] = useState<string | null>(null);
  const [loadingDirectStream, setLoadingDirectStream] = useState(false);
  const [vylaSources, setVylaSources] = useState<Source[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Fallback iframe players
  const iframeSources: Source[] = [
    { name: "RiveStream", url: isTv 
      ? `https://www.rivestream.app/embed?type=tv&id=${movie.id}&season=${season}&episode=${episode}`
      : `https://www.rivestream.app/embed?type=movie&id=${movie.id}`
    },
    { name: "VidSrc To", url: isTv 
      ? `https://vidsrc.to/embed/tv/${movie.id}/${season}/${episode}`
      : `https://vidsrc.to/embed/movie/${movie.id}`
    },
    { name: "EmbedSu", url: isTv 
      ? `https://embed.su/embed/tv/${movie.id}/${season}/${episode}`
      : `https://embed.su/embed/movie/${movie.id}`
    },
    { name: "CineSrc", url: isTv 
      ? `https://cinesrc.st/embed/tv/${movie.id}/${season}/${episode}`
      : `https://cinesrc.st/embed/movie/${movie.id}`
    },
    { name: "Nxsha", url: isTv 
      ? `https://web.nxsha.app/embed/tv/${movie.id}/${season}/${episode}`
      : `https://web.nxsha.app/embed/movie/${movie.id}`
    }
  ];

  useEffect(() => {
    const genreStr = movie.genre?.toLowerCase() || '';
    if (genreStr.includes('tv') || genreStr.includes('series') || movie.id.startsWith('tv-')) {
      setIsTv(true);
    } else {
      setIsTv(false);
    }
  }, [movie]);

  // Attempt to load direct streams using securely proxied Vyla API
  useEffect(() => {
    const fetchVylaStreams = async () => {
      setLoadingDirectStream(true);
      setDirectStreamUrl(null);
      setVylaSources([]);

      try {
        const typeParam = isTv ? 'tv' : 'movie';
        const proxyUrl = `https://aidjrytwdvhwgfjgkxyb.supabase.co/functions/v1/vyla-stream?id=${movie.id}&type=${typeParam}&s=${season}&e=${episode}`;
        
        console.log(`Fetching stream sources from proxy: ${proxyUrl}`);
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          throw new Error(`Proxy error status ${response.status}`);
        }

        const data = await response.json();
        
        // Match streams returned from Vyla deployment
        if (data && Array.isArray(data.streams) && data.streams.length > 0) {
          const directSources: Source[] = data.streams.map((stream: any, index: number) => ({
            name: `Vyla Direct ${stream.quality || ''} (${stream.type || 'hls'})`,
            url: stream.url,
            isDirect: true
          }));

          setVylaSources(directSources);
          
          // Default to the first found direct stream url
          if (directSources[0]?.url) {
            setDirectStreamUrl(directSources[0].url);
            toast.success(`Premium ad-free direct stream resolved via Vyla API!`);
          }
        }
      } catch (error) {
        console.log("Vyla Direct Stream unavailable (likely missing secure VYLA_API_KEY secret on Supabase). Falling back to embed iframes.");
      } finally {
        setLoadingDirectStream(false);
      }
    };

    fetchVylaStreams();
  }, [movie, isTv, season, episode]);

  // Combine custom direct streams and iframe fallback providers
  const allAvailableSources = [...vylaSources, ...iframeSources];
  const currentSource = allAvailableSources[activeSourceIdx] || allAvailableSources[0];

  useEffect(() => {
    // If we switch sources, set direct stream URL accordingly
    if (currentSource?.isDirect && currentSource.url) {
      setDirectStreamUrl(currentSource.url);
    } else {
      setDirectStreamUrl(null);
    }
  }, [activeSourceIdx, currentSource]);

  const handleReload = () => {
    setKey(prev => prev + 1);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  return (
    <div className="flex flex-col w-full bg-zinc-950 rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Video / Iframe Viewport */}
      <div className="relative w-full aspect-video bg-black group">
        {loadingDirectStream ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 text-zinc-400 gap-3">
            <Loader2 className="animate-spin text-pink-500 w-8 h-8" />
            <span className="text-xs font-bold uppercase tracking-wider">Securing premium direct streams...</span>
          </div>
        ) : directStreamUrl ? (
          // Direct HTML5 Video Player Mode for premium, ad-free direct stream links
          <video
            ref={videoRef}
            key={`${directStreamUrl}-${key}`}
            src={directStreamUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
            poster={movie.backdrop}
          />
        ) : (
          // Robust Iframe Fallback Mode
          <iframe
            key={`${activeSourceIdx}-${movie.id}-${season}-${episode}-${key}`}
            src={currentSource?.url}
            className="w-full h-full border-none"
            allowFullScreen
            scrolling="no"
            referrerPolicy="origin"
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
          />
        )}
        
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
                Active Player: <span className="text-pink-500">{currentSource?.name || 'Default Player'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button 
              onClick={handleReload} 
              className="p-2.5 rounded-xl bg-white/5 hover:bg-pink-600 hover:text-white transition-all border border-white/5 text-zinc-300 group"
              title="Refresh / Reload Media Source"
            >
              <RefreshCw size={14} className="group-active:rotate-180 transition-transform duration-500" />
            </button>
            {currentSource?.url && (
              <button 
                onClick={() => window.open(currentSource.url, '_blank')} 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <ExternalLink size={12} />
                <span>External Player</span>
              </button>
            )}
          </div>
        </div>

        {/* Server Selection Grid */}
        <div className="space-y-2 text-left">
          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Select Server Node (Switch source if video fails to load)</p>
          <div className="flex flex-wrap gap-2">
            {allAvailableSources.map((source, idx) => (
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
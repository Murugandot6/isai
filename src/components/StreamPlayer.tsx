"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '@/context/MusicContext';
import { RefreshCw, ExternalLink, Play, Pause, Volume2, VolumeX, Maximize, Sliders, ChevronDown, Sparkles, AlertCircle, Loader2, Video, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface StreamPlayerProps {
  movie: Movie;
}

interface StreamSource {
  name: string;
  url: string;
  type: 'mp4' | 'hls' | 'embed';
  params?: string;
  quality?: string;
}

interface VylaSubtitle {
  label: string;
  file: string;
  type: string;
}

const DEMO_SOURCES: StreamSource[] = [
  {
    name: "Vyla (1080p Demo)",
    url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    type: "hls",
    quality: "1080p (Demo)"
  },
  {
    name: "Vyla (720p Demo)",
    url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    type: "hls",
    quality: "720p (Demo)"
  }
];

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ movie }) => {
  const [key, setKey] = useState(0);
  const [isTv, setIsTv] = useState(false);
  const [season, setSeason] = useState<number>(1);
  const [episode, setEpisode] = useState<number>(1);

  const [availableSources, setAvailableSources] = useState<StreamSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<StreamSource | null>(null);
  const [loadingSource, setLoadingSource] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [subtitles, setSubtitles] = useState<VylaSubtitle[]>([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsInstanceRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const genreStr = movie.genre?.toLowerCase() || '';
    const titleLower = movie.title?.toLowerCase() || '';
    // Enhanced TV detection
    setIsTv(genreStr.includes('tv') || genreStr.includes('series') || movie.id.startsWith('tv-') || movie.genre === 'TV Series');
  }, [movie]);

  const isDirectMediaUrl = (url: string): boolean => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.m3u8') || url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.m3u8');
  };

  const fetchStreamSources = async () => {
    setLoadingSource(true);
    setSourceError(null);
    setAvailableSources([]);
    setSelectedSource(null);
    setIsDemoMode(false);

    // Primary logic: construct all requested endpoints
    const embedSources: StreamSource[] = [
      {
        name: "NXSHA (Primary)",
        url: isTv 
          ? `https://web.nxsha.app/embed/tv/${movie.id}/${season}/${episode}`
          : `https://web.nxsha.app/embed/movie/${movie.id}`,
        type: "embed",
        quality: "Ultra"
      },
      {
        name: "VidCore",
        url: isTv 
          ? `https://vidcore.net/embed/tv/${movie.id}/${season}/${episode}`
          : `https://vidcore.net/embed/movie/${movie.id}`,
        type: "embed",
        quality: "Fast"
      },
      {
        name: "CineSrc",
        url: isTv
          ? `https://cinesrc.st/embed/tv/${movie.id}/${season}/${episode}`
          : `https://cinesrc.st/embed/movie/${movie.id}`,
        type: "embed",
        quality: "Ad-Lite"
      },
      {
        name: "VidLux",
        url: isTv
          ? `https://vidlux.xyz/embed/tv/${movie.id}/${season}/${episode}`
          : `https://vidlux.xyz/embed/movie/${movie.id}`,
        type: "embed",
        quality: "Custom"
      },
      {
        name: "ZXCSTREAM",
        url: isTv
          ? `https://a.zxcstream.xyz/embed/tv/${movie.id}/${season}/${episode}`
          : `https://a.zxcstream.xyz/embed/movie/${movie.id}`,
        type: "embed",
        quality: "Global"
      }
    ];

    try {
      // Also attempt the Vyla Node proxy for premium direct streams
      const type = isTv ? 'tv' : 'movie';
      const proxyUrl = `https://aidjrytwdvhwgfjgkxyb.supabase.co/functions/v1/vyla-proxy?id=${movie.id}&type=${type}${isTv ? `&s=${season}&e=${episode}` : ''}`;
      
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        if (reader) {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const cleaned = line.trim();
              if (cleaned.startsWith("data:")) {
                const jsonStr = cleaned.slice(5).trim();
                try {
                  const parsed = JSON.parse(jsonStr);
                  if (parsed.type === 'source' && isDirectMediaUrl(parsed.source.url)) {
                    const newSource: StreamSource = {
                      name: `Vyla Node (${parsed.source.label || parsed.source.source})`,
                      url: parsed.source.url,
                      type: parsed.source.url.endsWith('.m3u8') ? 'hls' : 'mp4',
                      quality: parsed.source.label
                    };
                    setAvailableSources(prev => {
                      if (prev.some(s => s.url === newSource.url)) return prev;
                      return [...prev, newSource];
                    });
                  }
                } catch (e) {}
              }
            }
          }
        }
      }

      // Add the static embed sources to the end of the list
      setAvailableSources(prev => {
        const combined = [...prev, ...embedSources];
        if (!selectedSource && combined.length > 0) {
          setSelectedSource(combined[0]);
        }
        return combined;
      });

    } catch (error: any) {
      console.warn("Vyla fetch handshake failed, defaulting to embed nodes.");
      setAvailableSources(embedSources);
      if (!selectedSource) setSelectedSource(embedSources[0]);
    } finally {
      setLoadingSource(false);
    }
  };

  useEffect(() => {
    fetchStreamSources();
  }, [movie.id, isTv, season, episode, key]);

  const handleActivateDemoMode = () => {
    setSourceError(null);
    setIsDemoMode(true);
    setAvailableSources(DEMO_SOURCES);
    setSelectedSource(DEMO_SOURCES[0]);
    toast.success("Demo stream connected!");
  };

  useEffect(() => {
    if (!selectedSource || selectedSource.type === 'embed' || !videoRef.current) return;

    const video = videoRef.current;
    const streamUrl = selectedSource.url;
    const isHls = selectedSource.type === 'hls';

    if (!isHls) {
      if (hlsInstanceRef.current) { hlsInstanceRef.current.destroy(); hlsInstanceRef.current = null; }
      video.src = streamUrl;
      video.load();
      video.play().catch(() => {});
      setIsPlaying(true);
      return;
    }

    const loadHls = async () => {
      if (!(window as any).Hls) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.4.12/dist/hls.min.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }
      const Hls = (window as any).Hls;
      if (Hls.isSupported()) {
        if (hlsInstanceRef.current) hlsInstanceRef.current.destroy();
        const hls = new Hls();
        hlsInstanceRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); setIsPlaying(true); });
      }
    };
    loadHls();

    return () => { if (hlsInstanceRef.current) { hlsInstanceRef.current.destroy(); hlsInstanceRef.current = null; } };
  }, [selectedSource]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => { if (isPlaying) setShowControls(false); }, 3000);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col w-full bg-zinc-950 rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full aspect-video bg-black group select-none overflow-hidden flex items-center justify-center"
      >
        {loadingSource ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-pink-500 w-10 h-10" />
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Syncing with Node...</p>
          </div>
        ) : selectedSource?.type === 'embed' ? (
          <iframe 
            src={selectedSource.url}
            className="w-full h-full border-none"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        ) : selectedSource ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              onClick={() => isPlaying ? videoRef.current?.pause() : videoRef.current?.play()}
              onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
              onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
              className="w-full h-full object-contain"
              playsInline
            />

            <div className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 flex flex-col justify-between p-4 md:p-6 transition-opacity duration-300",
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <span className={cn(
                    "text-[10px] tracking-[0.2em] font-black uppercase px-3 py-1 rounded-full border border-pink-500/20",
                    isDemoMode ? "text-cyan-400 bg-cyan-500/10" : "text-pink-500 bg-pink-500/10"
                  )}>
                    {isDemoMode ? "Direct Demo Simulator" : `${selectedSource.name}`}
                  </span>
                  <h3 className="text-sm md:text-base font-black truncate max-w-sm mt-1">{movie.title}</h3>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <button 
                  onClick={() => { isPlaying ? videoRef.current?.pause() : videoRef.current?.play(); setIsPlaying(!isPlaying); }}
                  className="w-16 h-16 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-2xl pointer-events-auto"
                >
                  {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-zinc-400 w-10 text-right">{formatTime(currentTime)}</span>
                  <Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={([v]) => { if (videoRef.current) videoRef.current.currentTime = v; }} className="flex-1 cursor-pointer" />
                  <span className="text-[10px] font-bold text-zinc-400 w-10">{formatTime(duration)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <button onClick={() => { isPlaying ? videoRef.current?.pause() : videoRef.current?.play(); setIsPlaying(!isPlaying); }} className="text-zinc-300 hover:text-white"><Pause size={20} /></button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { if (videoRef.current) { videoRef.current.muted = !isMuted; setIsMuted(!isMuted); } }} className="text-zinc-300 hover:text-white">{isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
                      <Slider value={[isMuted ? 0 : volume * 100]} max={100} onValueChange={([v]) => { setVolume(v / 100); if (videoRef.current) videoRef.current.volume = v / 100; }} className="w-20 hidden md:block" />
                    </div>
                  </div>
                  <button onClick={() => containerRef.current?.requestFullscreen()} className="text-zinc-300 hover:text-white"><Maximize size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 space-y-4">
             <AlertCircle className="mx-auto text-zinc-600" />
             <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">No Sources Loaded</p>
             <button onClick={() => setKey(k => k + 1)} className="text-pink-500 text-[10px] font-black uppercase">Refresh Stream</button>
          </div>
        )}

        {isTv && (
          <div className="absolute top-3 left-3 flex gap-1.5 bg-black/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10 z-20">
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider px-1">S</span>
              <select value={season} onChange={(e) => setSeason(parseInt(e.target.value, 10))} className="bg-zinc-900 text-white font-bold text-[10px] rounded px-1.5 py-0.5 border border-white/10 outline-none">
                {Array.from({ length: 15 }).map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider px-1">E</span>
              <select value={episode} onChange={(e) => setEpisode(parseInt(e.target.value, 10))} className="bg-zinc-900 text-white font-bold text-[10px] rounded px-1.5 py-0.5 border border-white/10 outline-none">
                {Array.from({ length: 50 }).map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 bg-zinc-900/90 border-t border-white/5 flex flex-col gap-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5 text-left">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Stream Connection Manager</span>
            <p className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Selected Server: <span className="text-pink-500 font-black uppercase">{selectedSource?.name || "Auto"}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setKey(k => k + 1)} className="p-2.5 rounded-xl bg-white/5 hover:bg-pink-600 transition-all border border-white/5 text-zinc-300"><RefreshCw size={14} /></button>
            <button onClick={handleActivateDemoMode} className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest">Demo</button>
          </div>
        </div>

        {availableSources.length > 0 && (
          <div className="space-y-2 text-left pt-2 border-t border-white/5">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Available Nodes</p>
            <div className="flex flex-wrap gap-2">
              {availableSources.map((source) => (
                <button
                  key={source.url}
                  onClick={() => setSelectedSource(source)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                    selectedSource?.url === source.url ? "bg-pink-600 border-pink-500 text-white shadow-pink-600/20" : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  {source.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
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

interface VylaSource {
  url: string;
  quality: string;
}

interface VylaSubtitle {
  label: string;
  file: string;
  type: string;
}

interface StreamSource {
  name: string;
  url: string;
  type: 'mp4' | 'hls' | 'embed';
  params?: string;
}

// Demo sources for fallback and testing
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
  },
  {
    name: "Vyla (480p Demo)",
    url: "https://playertest.longtailvideo.com/adaptive/bipbop/bipbop.m3u8",
    type: "hls",
    quality: "480p (Demo)"
  }
];

// Publicly available embeds that directly serve media
const EMBED_SOURCES: Record<string, string> = {
  vidcore: "https://vidcore.net/embed/movie/",
  cinesrc: "https://cinesrc.st/embed/movie/",
  vidlux: "https://vidlux.xyz/embed/movie/",
  zxcstream: "https://a.zxcstream.xyz/embed/movie/"
};

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ movie }) => {
  const [key, setKey] = useState(0);
  const [isTv, setIsTv] = useState(false);
  const [season, setSeason] = useState<number>(1);
  const [episode, setEpisode] = useState<number>(1);

  // Streaming Source Management
  const [availableSources, setAvailableSources] = useState<StreamSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<StreamSource | null>(null);
  const [loadingSource, setLoadingSource] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);

  // Subtitle Management
  const [subtitles, setSubtitles] = useState<VylaSubtitle[]>([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);

  // HTML5 Video Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsInstanceRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const genreStr = movie.genre?.toLowerCase() || '';
    if (genreStr.includes('tv') || genreStr.includes('series') || movie.id.startsWith('tv-')) {
      setIsTv(true);
    } else {
      setIsTv(false);
    }
  }, [movie]);

  // Check if a URL points strictly to a playable MP4 or M3U8 stream file
  const isDirectMediaUrl = (url: string): boolean => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return (
      cleanUrl.endsWith('.mp4') || 
      cleanUrl.endsWith('.m3u8') || 
      url.toLowerCase().includes('.mp4') ||
      url.toLowerCase().includes('.m3u8')
    );
  };

  // Fetches streaming sources from Supabase Edge Function Proxy
  const fetchStreamSources = async () => {
    setLoadingSource(true);
    setSourceError(null);
    setAvailableSources([]);
    setSelectedSource(null);
    setSubtitles([]);
    setSelectedSubtitle(null);

    const supabaseProjectUrl = "https://aidjrytwdvhwgfjgkxyb.supabase.co";
    const proxyUrl = `${supabaseProjectUrl}/functions/vyla-proxy?id=${movie.id}&type=${isTv ? 'tv' : 'movie'}${isTv ? `&s=${season}&e=${episode}` : ''}`;

    try {
      console.log("[StreamPlayer] Handshaking streaming SSE with Proxy Node...");
      const response = await fetch(proxyUrl);

      if (response.status === 404) {
        throw new Error("PROXY_NOT_DEPLOYED");
      }
      if (!response.ok) {
        throw new Error(`Proxy server error: ${response.statusText}`);
      }

      // Process the Server-Sent Events stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (!reader) {
        throw new Error("Unable to read streaming body.");
      }

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
              const parsed = JSON.JSON.parse(jsonStr);
              if (parsed.type === 'meta') {
                if (parsed.subtitles && Array.isArray(parsed.subtitles)) {
                  setSubtitles(parsed.subtitles);
                  const defaultSub = parsed.subtitles.find((s: VylaSubtitle) => s.label.toLowerCase() === 'english');
                  if (defaultSub) setSelectedSubtitle(defaultSub.label);
                }
              } else if (parsed.type === 'source') {
                const streamUrl = parsed.source.url;
                if (isDirectMediaUrl(streamUrl)) {
                  const newSource: StreamSource = {
                    name: parsed.source.label || parsed.source.source,
                    url: streamUrl,
                    type: streamUrl.endsWith('.m3u8') ? 'hls' : 'mp4',
                    params: parsed.source.params
                  };
                  setAvailableSources(prev => {
                    if (prev.some(s => s.url === newSource.url)) return prev;
                    const nextSources = [...prev, newSource];
                    if (!selectedSource) setSelectedSource(newSource); // Select the first valid source
                    return nextSources;
                  });
                }
              }
            } catch (e) { /* Ignore partial parsing errors */ }
          }
        }
      }
    } catch (error: any) {
      console.error("[StreamPlayer] Source fetching failed:", error);
      setSourceError(error.message);
    } finally {
      setLoadingSource(false);
    }
  };

  useEffect(() => {
    fetchStreamSources();
  }, [movie.id, isTv, season, episode, key]);

  const handleActivateDemoMode = () => {
    setSourceError(null);
    setAvailableSources(DEMO_SOURCES);
    setSelectedSource(DEMO_SOURCES[0]);
    setSubtitles([]);
    setSelectedSubtitle(null);
    toast.success("Simulated direct demo stream connected!");
  };

  const loadHlsScript = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).Hls) {
        resolve((window as any).Hls);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.4.12/dist/hls.min.js';
      script.onload = () => {
        if ((window as any).Hls) resolve((window as any).Hls);
        else reject(new Error('Hls not loaded.'));
      };
      script.onerror = () => reject(new Error('Hls script error'));
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    if (!selectedSource || !videoRef.current) return;

    const video = videoRef.current;
    const streamUrl = selectedSource.url;
    const isHls = selectedSource.type === 'hls';
    let isActive = true;

    if (!isHls) {
      console.log("[StreamPlayer] Playing direct MP4 stream...");
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }
      video.src = streamUrl;
      video.load();
      video.play().catch(() => {});
      setIsPlaying(true);
      return;
    }

    console.log("[StreamPlayer] Initializing HLS.js video streaming engine...");
    loadHlsScript()
      .then((HlsClass) => {
        if (!isActive) return;
        if (HlsClass.isSupported()) {
          if (hlsInstanceRef.current) hlsInstanceRef.current.destroy();
          const hls = new HlsClass({ enableWorker: true, lowLatencyMode: true });
          hlsInstanceRef.current = hls;
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
            if (isActive) { video.play().catch(() => {}); setIsPlaying(true); }
          });
          hls.on(HlsClass.Events.ERROR, (event: any, data: any) => {
            if (data.fatal) {
              switch (data.type) {
                case HlsClass.ErrorTypes.NETWORK_ERROR: hls.startLoad(); break;
                case HlsClass.ErrorTypes.MEDIA_ERROR: hls.recoverMediaError(); break;
                default: hls.destroy(); setSourceError("Direct streaming thread aborted. Please reload."); break;
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.addEventListener('loadedmetadata', () => {
            if (isActive) { video.play().catch(() => {}); setIsPlaying(true); }
          });
        }
      })
      .catch((err) => { console.error("Player injection exception:", err); });

    return () => {
      isActive = false;
      if (hlsInstanceRef.current) { hlsInstanceRef.current.destroy(); hlsInstanceRef.current = null; }
    };
  }, [selectedVylaSource]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => { if (isPlaying) setShowControls(false); }, 3000);
  };

  useEffect(() => { return () => { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); }; }, []);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => { if (videoRef.current) setCurrentTime(videoRef.current.currentTime); };
  const handleLoadedMetadata = () => { if (videoRef.current) setDuration(videoRef.current.duration); };
  const handleSeek = (time: number) => { if (videoRef.current) { videoRef.current.currentTime = time; setCurrentTime(time); } };
  const handleVolumeChange = (volValue: number) => {
    setVolume(volValue);
    if (videoRef.current) {
      videoRef.current.volume = volValue;
      videoRef.current.muted = volValue === 0;
    }
    setIsMuted(volValue === 0);
  };
  const handleToggleMute = () => { if (videoRef.current) { const targetMute = !isMuted; videoRef.current.muted = targetMute; setIsMuted(targetMute); } };
  const handleFullscreen = () => { if (containerRef.current) document.fullscreenElement ? document.exitFullscreen() : containerRef.current.requestFullscreen().catch(() => {}); };
  const handleReload = () => { setKey(prev => prev + 1); };

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
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className="relative w-full aspect-video bg-black group select-none overflow-hidden flex items-center justify-center"
      >
        {loadingSource ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-pink-500 w-10 h-10" />
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Booting secure Edge Node...</p>
          </div>
        ) : sourceError && availableSources.length === 0 ? (
          <div className="p-6 md:p-12 text-center max-w-md space-y-5 animate-in fade-in duration-300">
            <div className="inline-flex items-center justify-center p-3 bg-pink-500/10 rounded-full border border-pink-500/20 text-pink-400"><AlertCircle size={32} /></div>
            <div className="space-y-1 text-center">
              <h4 className="text-base font-black uppercase tracking-wider text-white">Stream Server Unavailable</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">Could not connect to any valid media sources. Please try again later or use a different selection.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={handleReload} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg"><RefreshCw size={14} /> <span>Retry Connection</span></button>
              <button onClick={handleActivateDemoMode} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs uppercase tracking-widest transition-all border border-white/10"><Sparkles size={14} className="text-cyan-400 animate-pulse" /> <span>Play Demo Stream</span></button>
            </div>
          </div>
        ) : selectedSource ? (
          <div className="relative w-full h-full animate-in fade-in duration-500">
            <video
              ref={videoRef}
              onClick={handlePlayPause}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full h-full object-contain"
              playsInline
            >
              {subtitles.map((sub, idx) => (
                <track
                  key={`${sub.label}-${idx}`}
                  kind="subtitles"
                  src={sub.file}
                  srcLang={sub.label.slice(0, 2).toLowerCase()}
                  label={sub.label}
                  default={selectedSubtitle === sub.label}
                />
              ))}
            </video>

            <div className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 flex flex-col justify-between p-4 md:p-6 transition-opacity duration-300 z-30",
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
              <div className="flex items-center justify-between">
                <div className="text-left space-y-1">
                  <span className={cn(
                    "text-[10px] tracking-[0.2em] font-black uppercase bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20",
                    isDemoMode ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" : "text-pink-500"
                  )}>
                    {isDemoMode ? "Direct Demo Simulator" : `${selectedSource.name} Stream`}
                  </span>
                  <h3 className="text-sm md:text-base font-black truncate max-w-sm mt-1">{movie.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">{/* Quality Selector Menu */}</div>
                  {subtitles.length > 0 && (
                    <div className="relative">{/* Subtitle Selector Menu */}</div>
                  )}
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <button 
                  onClick={handlePlayPause}
                  className="w-16 h-16 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300 pointer-events-auto"
                >
                  {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-zinc-400 w-10 text-right">{formatTime(currentTime)}</span>
                  <Slider 
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={([val]) => handleSeek(val)}
                    className="flex-1 cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-zinc-400 w-10">{formatTime(duration)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <button onClick={handlePlayPause} className="text-zinc-300 hover:text-white transition-colors"><Pause size={20} /></button>
                    <div className="flex items-center gap-2 group/vol">
                      <button onClick={handleToggleMute} className="text-zinc-300 hover:text-white transition-colors"><VolumeX size={18} /></button>
                      <Slider 
                        value={[isMuted ? 0 : volume * 100]}
                        max={100}
                        step={1}
                        onValueChange={([val]) => handleVolumeChange(val / 100)}
                        className="w-20 cursor-pointer hidden md:block"
                      />
                    </div>
                  </div>
                  <button onClick={handleFullscreen} className="text-zinc-300 hover:text-white transition-colors"><Maximize size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-zinc-500 text-xs">Waiting for stream server handshake...</div>
        )}

        {/* TV Episode Selector Overlay */}
        {isTv && (
          <div className="absolute top-3 left-3 flex gap-1.5 bg-black/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10 z-20">
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider px-1">S</span>
              <select value={season} onChange={(e) => setSeason(parseInt(e.target.value, 10))} className="bg-zinc-900 text-white font-bold text-[10px] rounded px-1.5 py-0.5 border border-white/10 focus:outline-none appearance-none cursor-pointer">
                {Array.from({ length: 15 }).map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
              </select>
            </div>
            <div className="w-px bg-white/10 my-1" />
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider px-1">E</span>
              <select value={episode} onChange={(e) => setEpisode(parseInt(e.target.value, 10))} className="bg-zinc-900 text-white font-bold text-[10px] rounded px-1.5 py-0.5 border border-white/10 focus:outline-none appearance-none cursor-pointer">
                {Array.from({ length: 50 }).map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Connection Node / Server Selector Toolbar */}
      <div className="p-4 md:p-6 bg-zinc-900/90 border-t border-white/5 flex flex-col gap-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" /><span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Stream Connection Manager</span></div>
            <p className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Selected Server: <span className="text-pink-500 font-black uppercase">{isDemoMode ? "Simulated HLS Server" : `HLS Premium via ${activeRouting}`}</span></p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button onClick={handleReload} className="p-2.5 rounded-xl bg-white/5 hover:bg-pink-600 hover:text-white transition-all border border-white/5 text-zinc-300 group" title="Refresh / Reload HLS Streams"><RefreshCw size={14} className="group-active:rotate-180 transition-transform duration-500" /></button>
            {selectedVylaSource && (
              <button onClick={() => window.open(selectedVylaSource.url, '_blank')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all">
                <ExternalLink size={12} />
                <span>External Stream</span>
              </button>
            )}
          </div>
        </div>

        {selectedVylaSource && (
          <div className="space-y-2 text-left pt-2 border-t border-white/5 animate-in fade-in duration-300">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Premium Video Streams (HLS / MP4)</p>
            <div className="flex flex-wrap gap-2">
              {[...vylaSources, ...(isDemoMode ? [] : [{name: "VidCore", url: movie.streamUrl || "https://vidcore.net/embed/movie/" + movie.id, type: "embed" as any, quality: "VidCore" }]), 
                {name: "CineSrc", url: "https://cinesrc.st/embed/movie/" + movie.id, type: "embed" as any, quality: "CineSrc" }, 
                {name: "VidLux", url: "https://vidlux.xyz/embed/movie/" + movie.id + "?autoplay=true", type: "embed" as any, quality: "VidLux" },
                {name: "ZXCStream", url: "https://a.zxcstream.xyz/embed/movie/" + movie.id + "?server=1&autoplay=true&back=true", type: "embed" as any, quality: "ZXCStream" }
              ].map((source) => {
                const isSelected = selectedVylaSource?.url === source.url;
                return (
                  <button
                    key={source.url}
                    onClick={() => setSelectedVylaSource(source)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm",
                      isSelected
                        ? "bg-pink-600 border-pink-500 text-white shadow-pink-600/20"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/20"
                    )}
                  >
                    {source.quality || source.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
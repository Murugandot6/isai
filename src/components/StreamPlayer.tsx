"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '@/context/MusicContext';
import { Server, RefreshCw, ExternalLink, Play, Pause, Volume2, VolumeX, Maximize, Sliders, ChevronDown, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
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

// Beautiful multi-quality public HLS stream for simulation testing
const DEMO_VYLA_SOURCES: VylaSource[] = [
  {
    quality: "1080p (Demo)",
    url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8"
  },
  {
    quality: "720p (Demo)",
    url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"
  },
  {
    quality: "480p (Demo)",
    url: "https://playertest.longtailvideo.com/adaptive/bipbop/bipbop.m3u8"
  }
];

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ movie }) => {
  const [key, setKey] = useState(0);
  const [isTv, setIsTv] = useState(false);
  const [season, setSeason] = useState<number>(1);
  const [episode, setEpisode] = useState<number>(1);

  // Direct Vyla Streaming States
  const [vylaSources, setVylaSources] = useState<VylaSource[]>([]);
  const [selectedVylaSource, setSelectedVylaSource] = useState<VylaSource | null>(null);
  const [loadingVyla, setLoadingVyla] = useState(false);
  const [vylaError, setVylaError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeRouting, setActiveRouting] = useState<string>("Proxy Node");

  // HTML5 Video Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

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

  // Fetch Direct Streams with a resilient fallback chain: Secure Proxy -> Direct Client-side API
  const fetchVylaStreams = async () => {
    setLoadingVyla(true);
    setVylaError(null);
    setVylaSources([]);
    setSelectedVylaSource(null);
    setIsDemoMode(false);

    const supabaseProjectUrl = "https://aidjrytwdvhwgfjgkxyb.supabase.co";
    const proxyUrl = `${supabaseProjectUrl}/functions/v1/vyla-proxy?id=${movie.id}&type=${isTv ? 'tv' : 'movie'}&s=${season}&e=${episode}`;

    try {
      console.log("[StreamPlayer] Attempting fetch via secure Supabase Edge Proxy...");
      const response = await fetch(proxyUrl);

      // If Supabase proxy is not deployed (returns 404) or fails, gracefully switch to client-side direct fetch
      if (response.status === 404) {
        console.warn("[StreamPlayer] Supabase Edge Proxy not found (404). Falling back to direct client-side stream fetch...");
        throw new Error("PROXY_NOT_DEPLOYED");
      }

      if (!response.ok) {
        throw new Error("PROXY_SERVER_ERROR");
      }

      const data = await response.json();
      if (data && data.sources && Array.isArray(data.sources) && data.sources.length > 0) {
        setVylaSources(data.sources);
        const defaultSource = data.sources.find((x: VylaSource) => x.quality === "1080p") || data.sources[0];
        setSelectedVylaSource(defaultSource);
        setActiveRouting("Secure Edge Proxy");
        toast.success("Streams loaded securely via Supabase Edge Proxy!");
        setLoadingVyla(false);
        return;
      } else {
        throw new Error("INVALID_PROXY_PAYLOAD");
      }
    } catch (proxyErr: any) {
      console.log("[StreamPlayer] Proxy routing inactive or failed. Initiating direct client-side Vyla handshake...");
      
      // Direct client-side Vyla API query
      const apiKey = "vyla_public_key_fallback";
      const vylaBaseUrl = "https://boysism-vyla.hf.space";
      const directUrl = isTv
        ? `${vylaBaseUrl}/tv?id=${movie.id}&s=${season}&e=${episode}`
        : `${vylaBaseUrl}/movie?id=${movie.id}`;

      try {
        const directResponse = await fetch(directUrl, {
          headers: {
            "Authorization": `Bearer ${apiKey}`
          }
        });

        if (!directResponse.ok) {
          throw new Error(`Direct connection failed with status: ${directResponse.status}`);
        }

        const directData = await directResponse.json();
        if (directData && directData.sources && Array.isArray(directData.sources) && directData.sources.length > 0) {
          setVylaSources(directData.sources);
          const defaultSource = directData.sources.find((x: VylaSource) => x.quality === "1080p") || directData.sources[0];
          setSelectedVylaSource(defaultSource);
          setActiveRouting("Direct HuggingFace Node");
          toast.success("Streams loaded directly from HuggingFace cluster!");
        } else {
          throw new Error("HuggingFace Space returned empty source arrays.");
        }
      } catch (directErr: any) {
        console.error("[StreamPlayer] Both Proxy and Direct streaming nodes failed:", directErr);
        setVylaError("HuggingFace space is currently sleeping, spinning up, or requires authorization.");
      } finally {
        setLoadingVyla(false);
      }
    }
  };

  useEffect(() => {
    fetchVylaStreams();
  }, [movie.id, isTv, season, episode, key]);

  // Enable Demo Simulation Mode
  const handleActivateDemoMode = () => {
    setVylaError(null);
    setVylaSources(DEMO_VYLA_SOURCES);
    setSelectedVylaSource(DEMO_VYLA_SOURCES[0]);
    setIsDemoMode(true);
    toast.success("Demo streaming server connected!", {
      description: "You are now running on simulated direct stream test nodes."
    });
  };

  // Load HLS.js dynamically from CDN to bypass compilation dependencies
  const loadHlsScript = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).Hls) {
        resolve((window as any).Hls);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.4.12/dist/hls.min.js';
      script.onload = () => {
        if ((window as any).Hls) {
          resolve((window as any).Hls);
        } else {
          reject(new Error('Hls not found after script load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Hls script'));
      document.head.appendChild(script);
    });
  };

  // Initialize and attach HLS.js video streaming for the Direct Player
  useEffect(() => {
    if (!selectedVylaSource || !videoRef.current) return;

    const video = videoRef.current;
    const streamUrl = selectedVylaSource.url;
    let isActive = true;

    loadHlsScript()
      .then((HlsClass) => {
        if (!isActive) return;

        if (HlsClass.isSupported()) {
          if (hlsInstanceRef.current) {
            hlsInstanceRef.current.destroy();
          }

          const hls = new HlsClass({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstanceRef.current = hls;

          hls.loadSource(streamUrl);
          hls.attachMedia(video);

          hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
            if (isActive) {
              video.play().catch(() => {});
              setIsPlaying(true);
            }
          });

          hls.on(HlsClass.Events.ERROR, (event: any, data: any) => {
            if (data.fatal) {
              switch (data.type) {
                case HlsClass.ErrorTypes.NETWORK_ERROR:
                  hls.startLoad();
                  break;
                case HlsClass.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
                default:
                  hls.destroy();
                  setVylaError("Direct streaming thread aborted. Try reloading or changing source nodes.");
                  toast.error("HLS.js player thread failure");
                  break;
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native Apple device support (Safari / iOS)
          video.src = streamUrl;
          video.addEventListener('loadedmetadata', () => {
            if (isActive) {
              video.play().catch(() => {});
              setIsPlaying(true);
            }
          });
        }
      })
      .catch((err) => {
        console.error("Dynamic Hls script load failed:", err);
        setVylaError("Dynamic player engine injection error. Try refreshing your browser.");
      });

    return () => {
      isActive = false;
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }
    };
  }, [selectedVylaSource]);

  // Custom Controls Activity Indicator
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (volValue: number) => {
    setVolume(volValue);
    if (videoRef.current) {
      videoRef.current.volume = volValue;
      videoRef.current.muted = volValue === 0;
    }
    setIsMuted(volValue === 0);
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      const targetMute = !isMuted;
      videoRef.current.muted = targetMute;
      setIsMuted(targetMute);
    }
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const handleReload = () => {
    setKey(prev => prev + 1);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col w-full bg-zinc-950 rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Primary Video Player / Error Panel Container */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className="relative w-full aspect-video bg-black group select-none overflow-hidden flex items-center justify-center"
      >
        {loadingVyla ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-pink-500 w-10 h-10" />
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Booting secure Edge Node...</p>
          </div>
        ) : vylaError ? (
          /* Secure Edge Error Node (With Demo Mode Simulation option) */
          <div className="p-6 md:p-12 text-center max-w-md space-y-5 animate-in fade-in duration-300">
            <div className="inline-flex items-center justify-center p-3 bg-pink-500/10 rounded-full border border-pink-500/20 text-pink-400">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black uppercase tracking-wider">HuggingFace Space Offline</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                {vylaError} Please ensure the Vyla HuggingFace Space is running.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button 
                onClick={handleReload}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-pink-600/20"
              >
                <RefreshCw size={14} />
                <span>Retry Handshake</span>
              </button>
              <button 
                onClick={handleActivateDemoMode}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs uppercase tracking-widest transition-all border border-white/10"
              >
                <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                <span>Simulate Player</span>
              </button>
            </div>
          </div>
        ) : selectedVylaSource ? (
          /* High-Fidelity Custom HTML5 Video Player playing m3u8 HLS Streams directly */
          <div className="relative w-full h-full animate-in fade-in duration-500">
            <video
              ref={videoRef}
              onClick={handlePlayPause}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full h-full object-contain"
              playsInline
            />

            {/* Custom Control Bar Overlay */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 flex flex-col justify-between p-4 md:p-6 transition-opacity duration-300 z-30",
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
              {/* Top Bar Header */}
              <div className="flex items-center justify-between">
                <div className="text-left space-y-1">
                  <span className={cn(
                    "text-[10px] tracking-[0.2em] font-black uppercase bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20",
                    isDemoMode ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" : "text-pink-500"
                  )}>
                    {isDemoMode ? "Direct Demo Simulator" : `Stream Connected via ${activeRouting}`}
                  </span>
                  <h3 className="text-sm md:text-base font-black truncate max-w-sm mt-1">
                    {isDemoMode ? `Demo HLS Stream (Testing: ${selectedVylaSource.quality})` : movie.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {/* Quality Selector */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowQualityMenu(!showQualityMenu)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold border border-white/5 transition-all"
                    >
                      <Sliders size={12} className="text-pink-500" />
                      <span>{selectedVylaSource.quality}</span>
                      <ChevronDown size={12} />
                    </button>
                    {showQualityMenu && (
                      <div className="absolute right-0 top-full mt-1.5 bg-zinc-900 border border-white/10 rounded-xl p-1 shadow-2xl z-40 min-w-[120px] flex flex-col">
                        {vylaSources.map((source, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedVylaSource(source);
                              setShowQualityMenu(false);
                            }}
                            className={cn(
                              "px-3 py-2 rounded-lg text-left text-xs font-bold transition-colors",
                              selectedVylaSource.quality === source.quality 
                                ? "bg-pink-600 text-white" 
                                : "text-zinc-400 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            {source.quality}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Big Play/Pause Center Indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <button 
                  onClick={handlePlayPause}
                  className="w-16 h-16 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300 pointer-events-auto"
                >
                  {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>
              </div>

              {/* Bottom Bar Controls */}
              <div className="space-y-4">
                {/* Timeline Progress Slider */}
                <div className="space-y-1.5">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={([val]) => handleSeek(val)}
                    className="w-full cursor-pointer py-2"
                  />
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handlePlayPause} 
                      className="text-zinc-300 hover:text-white transition-colors"
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    {/* Volume Controls */}
                    <div className="flex items-center gap-2 group/volume">
                      <button 
                        onClick={handleToggleMute} 
                        className="text-zinc-300 hover:text-white transition-colors"
                      >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      <Slider
                        value={[isMuted ? 0 : volume * 100]}
                        max={100}
                        step={1}
                        onValueChange={([val]) => handleVolumeChange(val / 100)}
                        className="w-20 cursor-pointer hidden md:block"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleFullscreen} 
                    className="text-zinc-300 hover:text-white transition-colors"
                  >
                    <Maximize size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-zinc-500 text-xs">Waiting for stream server handshake...</div>
        )}

        {/* TV Episode Selector Overlay */}
        {isTv && !vylaError && !loadingVyla && (
          <div className="absolute top-3 left-3 flex gap-1.5 bg-black/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 z-20">
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

      {/* Controller / Server Selection Bar */}
      <div className="p-4 md:p-6 bg-zinc-900/90 border-t border-white/5 flex flex-col gap-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">HuggingFace Node</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Server size={12} className="text-pink-500" />
              <p className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider">
                Active Source: <span className="text-pink-500">{isDemoMode ? "Simulated HLS Server" : `Vyla HF Direct Player via ${activeRouting}`}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button 
              onClick={handleReload} 
              className="p-2.5 rounded-xl bg-white/5 hover:bg-pink-600 hover:text-white transition-all border border-white/5 text-zinc-300 group"
              title="Refresh / Reload Stream"
            >
              <RefreshCw size={14} className="group-active:rotate-180 transition-transform duration-500" />
            </button>
            <button 
              onClick={() => window.open(selectedVylaSource ? selectedVylaSource.url : '', '_blank')} 
              disabled={!selectedVylaSource}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              <ExternalLink size={12} />
              <span>External Stream Link</span>
            </button>
          </div>
        </div>

        {/* Server Quality Options */}
        {selectedVylaSource && (
          <div className="space-y-2 text-left animate-in fade-in duration-300">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">
              Server Quality Options
            </p>
            <div className="flex flex-wrap gap-2">
              {vylaSources.map((source, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedVylaSource(source)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm",
                    selectedVylaSource.quality === source.quality 
                      ? "bg-pink-600 border-pink-500 text-white shadow-pink-600/20" 
                      : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/20"
                  )}
                >
                  Direct stream • {source.quality}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
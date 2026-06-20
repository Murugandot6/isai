"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '@/context/MusicContext';
import { Server, Info, Shield, RefreshCcw, ExternalLink, Play, ChevronDown, AlertCircle, Loader2, Users, Download, Activity, Zap, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface StreamPlayerProps {
  movie: Movie;
}

type EmbedServerType = 
  | 'direct'
  | 'vidsrc_xyz'
  | 'embed_su'
  | 'vidsrc'
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
  const hasDirectStream = !!movie.streamUrl;
  const isMagnet = movie.streamUrl?.startsWith('magnet:') || movie.streamUrl?.endsWith('.torrent');
  
  // Default to direct stream if available, otherwise fallback to vidsrc_xyz
  const [embedServer, setEmbedServer] = useState<EmbedServerType>(
    hasDirectStream ? 'direct' : (isImdb ? 'vidsrc_xyz' : 'filmu')
  );
  const [season, setSeason] = useState('1');
  const [episode, setEpisode] = useState('1');
  const [key, setKey] = useState(0);
  
  // WebTorrent specific states
  const [wtLoaded, setWtLoaded] = useState(false);
  const [wtProgress, setWtLoadedProgress] = useState(0);
  const [wtPeers, setWtPeers] = useState(0);
  const [wtSpeed, setWtSpeed] = useState('');
  const [wtStatus, setWtStatus] = useState<'initializing' | 'connecting' | 'metadata' | 'ready' | 'error'>('initializing');
  const [wtErrorMsg, setWtErrorMsg] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wtClientRef = useRef<any>(null);

  // Dynamic WebTorrent Script Loader
  useEffect(() => {
    if (isMagnet && embedServer === 'direct') {
      if ((window as any).WebTorrent) {
        setWtLoaded(true);
        return;
      }

      setWtStatus('initializing');
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js';
      script.async = true;
      script.onload = () => {
        setWtLoaded(true);
      };
      script.onerror = () => {
        setWtStatus('error');
        setWtErrorMsg('Failed to load WebTorrent streaming engine library.');
      };
      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [isMagnet, embedServer]);

  // WebTorrent Client & Peer Stream Setup
  useEffect(() => {
    if (isMagnet && embedServer === 'direct' && wtLoaded && movie.streamUrl) {
      setWtStatus('connecting');
      const WebTorrent = (window as any).WebTorrent;
      
      if (!WebTorrent) {
        setWtStatus('error');
        setWtErrorMsg('WebTorrent player is not available.');
        return;
      }

      // Destroy old client instance if exists
      if (wtClientRef.current) {
        try {
          wtClientRef.current.destroy();
        } catch (e) {}
      }

      const client = new WebTorrent();
      wtClientRef.current = client;

      // Premium WebRTC & Public BitTorrent trackers for maximum peer connectivity
      const trackers = [
        'wss://tracker.openwebtorrent.com',
        'wss://tracker.btorrent.xyz',
        'wss://tracker.files.fm:7073/announce',
        'wss://tracker.gbitt.info:443/announce',
        'wss://tracker.fastcast.nz',
        'udp://tracker.coppersurfer.tk:6969/announce',
        'udp://tracker.openbittorrent.com:80/announce',
        'udp://tracker.opentrackr.org:1337/announce',
        'udp://movies.coppersurfer.tk:6969/announce'
      ];

      setWtStatus('metadata');
      client.add(movie.streamUrl, { announce: trackers }, (torrent: any) => {
        // Find largest video file available in torrent package
        const file = torrent.files.find((f: any) => 
          f.name.endsWith('.mp4') || 
          f.name.endsWith('.mkv') || 
          f.name.endsWith('.webm') || 
          f.name.endsWith('.avi')
        );

        if (!file) {
          setWtStatus('error');
          setWtErrorMsg('No streamable HTML5 video files found in torrent.');
          return;
        }

        setWtStatus('ready');

        // Render file streams straight to native HTML5 <video> tag
        file.renderTo('#webtorrent-video', {
          autoplay: true,
          controls: true
        }, (err: any, elem: any) => {
          if (err) {
            console.error("WebTorrent render error:", err);
            setWtStatus('error');
            setWtErrorMsg('Render error: This audio/video codec may not be natively supported by your browser.');
          }
        });

        // Set up real-time performance & speed listener
        torrent.on('download', () => {
          setWtLoadedProgress(Math.round(torrent.progress * 100));
          setWtPeers(torrent.numPeers);
          // Format speeds beautifully
          const speedInMB = (torrent.downloadSpeed / (1024 * 1024)).toFixed(2);
          setWtSpeed(`${speedInMB} MB/s`);
        });

        torrent.on('wire', () => {
          setWtPeers(torrent.numPeers);
        });
      });

      client.on('error', (err: any) => {
        console.error("WebTorrent error:", err);
        setWtStatus('error');
        setWtErrorMsg(err.message || 'P2P Connection failed.');
      });

      return () => {
        if (client) {
          try {
            client.destroy();
          } catch (e) {}
        }
      };
    }
  }, [isMagnet, embedServer, wtLoaded, movie.streamUrl, key]);

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
    ...(hasDirectStream ? [{ id: 'direct' as EmbedServerType, label: 'Direct Stream / Torrent (P2P)', priority: true, supportsImdb: true, supportsTv: true }] : []),
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
    if (embedServer === 'direct' && movie.streamUrl) {
      window.open(movie.streamUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(getEmbedUrl(), '_blank', 'noopener,noreferrer');
    }
  };

  const activeServers = servers.filter(srv => {
    const imdbMatch = !isImdb || srv.supportsImdb;
    const tvMatch = !isTv || srv.supportsTv;
    return imdbMatch && tvMatch;
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* TV Show Season/Episode Selectors */}
      {isTv && embedServer !== 'direct' && (
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
        {/* Player Container */}
        <div className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center">
          {embedServer === 'direct' && movie.streamUrl ? (
            isMagnet ? (
              /* Native WebTorrent Stream Loader View */
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-white p-4 md:p-6 text-center overflow-y-auto">
                {wtStatus === 'ready' ? (
                  <video 
                    id="webtorrent-video"
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                  />
                ) : (
                  <div className="max-w-lg w-full space-y-5 p-5 md:p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="flex justify-center">
                      {wtStatus === 'error' ? (
                        <AlertCircle className="text-red-500 w-10 h-10" />
                      ) : (
                        <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-black text-base tracking-tight uppercase flex items-center justify-center gap-2">
                        {wtStatus === 'initializing' && 'Booting Torrent Client...'}
                        {wtStatus === 'connecting' && 'Connecting to WebRTC trackers...'}
                        {wtStatus === 'metadata' && 'Fetching Torrent Metadata...'}
                        {wtStatus === 'error' && 'Playback failed'}
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed max-w-sm mx-auto">
                        {wtStatus === 'initializing' && 'Initializing local sandbox torrent client...'}
                        {wtStatus === 'connecting' && 'Connecting to active browser-to-browser WebRTC seeds...'}
                        {wtStatus === 'metadata' && 'Reading files and file structures in peer network...'}
                        {wtStatus === 'error' && (wtErrorMsg || 'Unable to connect to peers.')}
                      </p>
                    </div>

                    {wtStatus !== 'error' && (
                      <div className="space-y-4">
                        <Progress value={wtStatus === 'metadata' ? 35 : wtStatus === 'connecting' ? 15 : 5} className="h-1.5 bg-white/5" />
                        
                        <div className="flex items-center justify-around text-[10px] font-bold text-zinc-400">
                          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                            <Users size={12} className="text-indigo-400 animate-pulse" />
                            <span>{wtPeers} WebRTC Seeds</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                            <Activity size={12} className="text-indigo-400" />
                            <span>{wtSpeed || '0.00 MB/s'}</span>
                          </div>
                        </div>

                        {/* HIGHLY INTERACTIVE EXPLANATORY EXPLAINER NOTICE + INSTANT HTTP BYPASSES */}
                        <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-[10px] text-zinc-400 leading-relaxed text-left space-y-3">
                          <p className="flex items-start gap-1.5">
                            <HelpCircle size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>Why is it taking too long?</strong> Web browsers can *only* stream torrents seeded by other WebRTC browser peers. Standard desktop torrent clients (TCP/UDP) do not connect natively to web browsers, resulting in <strong>0 WebRTC seeds</strong>.
                            </span>
                          </p>
                          
                          <div className="pt-2 border-t border-white/5 space-y-2">
                            <p className="font-bold text-zinc-300 text-center">👇 Don't wait! Play instantly using cloud servers:</p>
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                onClick={() => setEmbedServer('vidsrc_xyz')}
                                className="rounded-xl bg-purple-600 hover:bg-purple-700 font-bold text-[10px] h-9 gap-1 shadow-lg shadow-purple-600/20 text-white"
                              >
                                <Play size={10} fill="currentColor" />
                                Play via VidSrc.xyz
                              </Button>
                              <Button 
                                onClick={() => setEmbedServer('embed_su')}
                                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-[10px] h-9 gap-1 shadow-lg shadow-indigo-600/20 text-white"
                              >
                                <Play size={10} fill="currentColor" />
                                Play via Embed.su
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {wtStatus === 'error' && (
                      <div className="flex flex-col gap-2 pt-2">
                        <Button 
                          onClick={refreshPlayer}
                          className="rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-xs"
                        >
                          Retry Torrent Loading
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            onClick={() => setEmbedServer('vidsrc_xyz')}
                            className="rounded-xl bg-purple-600 hover:bg-purple-700 font-bold text-xs text-white"
                          >
                            Use VidSrc Server
                          </Button>
                          <Button 
                            onClick={() => window.open(movie.streamUrl, '_self')}
                            className="rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-xs"
                          >
                            Open in Torrent App
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Floating peer stats bar during live streaming */}
                {wtStatus === 'ready' && (
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-4 text-[10px] font-bold text-zinc-400 z-10 pointer-events-none animate-in fade-in duration-500">
                    <div className="flex items-center gap-1 text-green-400"><Users size={12} /> {wtPeers} PEERS</div>
                    <div className="flex items-center gap-1 text-indigo-400"><Download size={12} /> {wtSpeed}</div>
                    <div className="flex items-center gap-1 text-yellow-500"><Zap size={12} /> {wtProgress}%</div>
                  </div>
                )}
              </div>
            ) : (
              <video 
                ref={videoRef}
                key={`${movie.streamUrl}-${key}`}
                src={movie.streamUrl}
                className="w-full h-full"
                controls
                autoPlay
                preload="auto"
                playsInline
              />
            )
          ) : (
            <iframe 
              key={`${embedServer}-${movie.id}-${season}-${episode}-${key}`}
              src={getEmbedUrl()}
              className="w-full h-full border-none"
              allowFullScreen
              scrolling="no"
              referrerPolicy="origin"
              allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
            />
          )}
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
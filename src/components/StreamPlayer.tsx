"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useMusic, Movie } from '@/context/MusicContext';
import { StremioStream } from '@/services/stremio';
import { Play, Pause, Volume2, VolumeX, Maximize, RefreshCw, Shield, Server, List, Users, Info } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface StreamPlayerProps {
  movie: Movie;
  imdbId: string | null;
  stremioStreams: StremioStream[];
  loadingStreams: boolean;
}

type PlayerSource = 'embed' | 'direct';

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ movie, imdbId, stremioStreams, loadingStreams }) => {
  const { roomCode, isHost, broadcast } = useMusic();
  const [sourceType, setSourceType] = useState<PlayerSource>('embed');
  const [embedServer, setEmbedServer] = useState<'xplay' | 'anyembed' | 'vidsync' | 'vidsrc'>('xplay');
  const [selectedDirectStream, setSelectedDirectStream] = useState<StremioStream | null>(null);
  
  // Direct HTML5 Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Filter out streams that have direct HTTP URLs
  const directStreams = stremioStreams.filter(s => s.url);

  // Embed URLs
  const getEmbedUrl = () => {
    switch (embedServer) {
      case 'xplay':
        return `https://play.xpass.top/embed/movie/${movie.id}?logo=false&theme=purple`;
      case 'anyembed':
        return `https://anyembed.xyz/embed/movie/${movie.id}?logo=false`;
      case 'vidsync':
        return `https://vidsync.xyz/embed/movie/${movie.id}`;
      case 'vidsrc':
        return `https://vidsrc.to/embed/movie/${movie.id}`;
    }
  };

  // Handle Direct Video Playback Sync
  useEffect(() => {
    if (sourceType !== 'direct' || !videoRef.current) return;
    const video = videoRef.current;

    const handlePlay = () => {
      setIsPlaying(true);
      if (isHost) broadcast('movie_play', { time: video.currentTime });
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (isHost) broadcast('movie_pause', {});
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [sourceType, isHost, broadcast, selectedDirectStream]);

  // Listen to Room Sync Broadcasts
  useEffect(() => {
    if (!roomCode) return;

    const handleSyncMessage = (e: any) => {
      // We can listen to custom broadcast events from MusicContext if needed
    };

    // Since we are using Supabase Broadcast, we can hook into the channel
    // For simplicity, we can listen to window events or custom events dispatched by MusicContext
  }, [roomCode]);

  // Bidirectional postMessage API for XPlay
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('xpass.top') && !event.origin.includes('play.xpass.top')) return;
      
      const data = event.data;
      if (data && typeof data === 'object') {
        if (data.event === 'play') {
          toast.success("Movie started playing!");
        } else if (data.event === 'pause') {
          toast.info("Movie paused");
        } else if (data.event === 'progress') {
          // Save progress to localStorage for "Continue Watching"
          localStorage.setItem(`isai_progress_${movie.id}`, data.time);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [movie.id]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleSeek = (val: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = val;
    setCurrentTime(val);
    if (isHost) broadcast('movie_seek', { time: val });
  };

  const handleVolumeChange = (val: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    videoRef.current.muted = nextMute;
    setIsMuted(nextMute);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const selectDirectStream = (stream: StremioStream) => {
    setSelectedDirectStream(stream);
    setSourceType('direct');
    setIsPlaying(false);
    setCurrentTime(0);
    toast.success(`Switched to direct stream: ${stream.name}`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Left: Player Area */}
      <div className="flex-1 flex flex-col bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Player Screen */}
        <div className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center">
          {sourceType === 'embed' ? (
            <iframe 
              ref={iframeRef}
              src={getEmbedUrl()}
              className="w-full h-full border-none"
              allowFullScreen
              scrolling="no"
              referrerPolicy="no-referrer" // Layer 1 Ad-Blocker: Referrer Stripping
              allow="autoplay; encrypted-media"
            />
          ) : (
            selectedDirectStream?.url && (
              <div className="relative w-full h-full group">
                <video 
                  ref={videoRef}
                  src={selectedDirectStream.url}
                  className="w-full h-full object-contain"
                  autoPlay
                  playsInline
                />
                
                {/* Custom HTML5 Player Controls */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {/* Progress Bar */}
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-xs font-bold text-white/70">
                      {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
                    </span>
                    <Slider 
                      value={[currentTime]} 
                      max={duration || 100} 
                      step={1}
                      onValueChange={([val]) => handleSeek(val)}
                      className="flex-1 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white/70">
                      {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
                    </span>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={handlePlayPause} className="text-white hover:text-primary transition-colors">
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
                          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <Slider 
                          value={[isMuted ? 0 : volume]} 
                          max={1} 
                          step={0.05}
                          onValueChange={([val]) => handleVolumeChange(val)}
                          className="w-20 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className="bg-primary text-white font-bold text-[10px] uppercase">Direct Stream</Badge>
                      <button onClick={handleFullscreen} className="text-white hover:text-primary transition-colors">
                        <Maximize size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Player Controls Bar */}
        <div className="p-4 bg-zinc-900 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
          {/* Source Type Switcher */}
          <div className="flex bg-white/5 rounded-xl p-1 text-xs">
            <button 
              onClick={() => setSourceType('embed')}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${sourceType === 'embed' ? 'bg-primary text-white' : 'text-white/60 hover:text-white'}`}
            >
              <Server size={14} />
              Embed Servers
            </button>
            <button 
              disabled={directStreams.length === 0}
              onClick={() => directStreams.length > 0 && selectDirectStream(directStreams[0])}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 disabled:opacity-40 ${sourceType === 'direct' ? 'bg-primary text-white' : 'text-white/60 hover:text-white'}`}
            >
              <Shield size={14} />
              Direct Torrent Streams
            </button>
          </div>

          {/* Embed Server Switcher */}
          {sourceType === 'embed' && (
            <div className="flex flex-wrap gap-2">
              {(['xplay', 'anyembed', 'vidsync', 'vidsrc'] as const).map((srv) => (
                <button
                  key={srv}
                  onClick={() => setEmbedServer(srv)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${embedServer === srv ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                >
                  {srv === 'xplay' ? 'XPlay Premium' : srv === 'anyembed' ? 'AnyEmbed' : srv === 'vidsync' ? 'VidSync' : 'VidSrc'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Torrent & P2P Streams List */}
      <div className="w-full lg:w-80 bg-zinc-900/50 border border-white/10 rounded-3xl p-6 flex flex-col h-[450px] lg:h-auto">
        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
          <List size={18} className="text-primary" />
          Torrent & P2P Sources
        </h3>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-white/10">
          {loadingStreams ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 space-y-2 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            ))
          ) : directStreams.length > 0 ? (
            directStreams.map((stream, idx) => {
              const isSelected = selectedDirectStream?.url === stream.url && sourceType === 'direct';
              return (
                <div
                  key={idx}
                  onClick={() => selectDirectStream(stream)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group ${isSelected ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'}`}
                >
                  <h4 className={`font-bold text-sm line-clamp-1 ${isSelected ? 'text-primary' : 'text-white group-hover:text-primary'}`}>
                    {stream.name}
                  </h4>
                  <p className="text-xs text-white/60 line-clamp-2 mt-1 leading-relaxed">
                    {stream.title}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-white/40">
              <Shield size={32} className="mb-2 opacity-40" />
              <p className="text-sm font-bold">No direct streams found</p>
              <p className="text-xs max-w-[200px] mt-1">Try using the Embed Servers on the left.</p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 flex gap-2 text-[10px] text-white/40 leading-relaxed">
          <Info size={14} className="text-primary shrink-0 mt-0.5" />
          <p>Direct Torrent Streams bypass third-party iframes, completely blocking ads and popups.</p>
        </div>
      </div>
    </div>
  );
};
"use client";

import React, { useState, useEffect } from 'react';
import { Movie } from '@/context/MusicContext';
import { Server, RefreshCcw, ExternalLink, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';

interface StreamPlayerProps {
  movie: Movie;
}

type EmbedServerType = 'direct' | 'cinepro';

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

  const defaultEmbedServer = hasStreamUrl && isDirectVideo ? 'direct' : 'cinepro';
  const [embedServer, setEmbedServer] = useState<EmbedServerType>(defaultEmbedServer);
  const [season, setSeason] = useState('1');
  const [episode, setEpisode] = useState('1');
  const [key, setKey] = useState(0);
  const [magnetInput, setMagnetInput] = useState('');

  useEffect(() => {
    const nextDefault = hasStreamUrl && isDirectVideo ? 'direct' : 'cinepro';
    setEmbedServer(nextDefault);
  }, [effectiveStreamUrl, isDirectVideo]);

  // CinePro API implementation based on official specs
  const getEmbedUrl = (): string => {
    const id = movie.id;
    const s = season;
    const e = episode;

    if (isTv) {
      return `https://embed.cinepro.cc/tv/${id}/${s}/${e}`;
    } else {
      return `https://embed.cinepro.cc/movie/${id}`;
    }
  };

  const refreshPlayer = () => setKey(prev => prev + 1);

  const handleOpenExternal = () => {
    if (embedServer === 'direct' && effectiveStreamUrl) {
      window.open(effectiveStreamUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(getEmbedUrl(), '_blank', 'noopener,noreferrer');
    }
  };

  const handleDirectPlay = () => {
    if (!magnetInput.trim()) return;
    setManualStreamUrl(magnetInput.trim());
    setKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {isTv && embedServer !== 'direct' && (
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
        <div className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center">
          {embedServer === 'direct' && effectiveStreamUrl ? (
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

        <div className="p-4 bg-zinc-900 border-t border-white/5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Server size={14} className="text-purple-400" />
              <span className="font-bold">Streaming Source (CinePro API • {isTv ? 'TV' : 'Movie'}):</span>
              <span className="text-[10px]">• Auto HD Quality • Ad-blocked</span>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={refreshPlayer} className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors">
                <RefreshCcw size={12} /> Reload Player
              </button>
              <Button onClick={handleOpenExternal} variant="outline" size="sm" className="h-8 rounded-lg border-purple-500/20 hover:bg-purple-500/10 text-purple-300 hover:text-white text-[10px] font-bold gap-1.5">
                <ExternalLink size={12} /> Open in New Tab
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Active Source</p>
            <div className="flex flex-wrap gap-2">
              {hasStreamUrl && isDirectVideo && (
                <button
                  onClick={() => setEmbedServer('direct')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${embedServer === 'direct' ? 'bg-green-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-green-500/20'}`}
                >
                  Direct Video
                </button>
              )}
              <button
                onClick={() => setEmbedServer('cinepro')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${embedServer === 'cinepro' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-purple-500/20'}`}
              >
                CinePro Player
              </button>
            </div>
          </div>

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
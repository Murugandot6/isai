"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '@/context/MusicContext';
import { Server, Info, Shield, RefreshCcw, ExternalLink, Play, Star, AlertCircle, Users, Download, Activity, Zap, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';

interface StreamPlayerProps {
  movie: Movie;
}

type EmbedServerType =
  | 'direct'
  | 'vidsrc_xyz'
  | 'embed_su'
  | 'embedmaster'
  | 'vidsrc_to'
  | 'vidsrc_fyi'
  | 'vidsrc_pro'
  | 'vidsrc_vip'
  | 'vidsrc_me'
  | 'autoembed'
  | 'multiembed'
  | 'superembed'
  | '2embed'
  | 'vidlink'
  | 'videasy'
  | 'vidfast'
  | 'rivestream'
  | 'cinesrc';

interface ServerDef {
  id: EmbedServerType;
  label: string;
  quality: string;
  supportsImdb: boolean;
  supportsTmdb: boolean;
  supportsTv: boolean;
  note?: string;
}

const ALL_SERVERS: ServerDef[] = [
  { id: 'vidsrc_xyz', label: 'VidSrc.xyz', quality: '4K', supportsImdb: true, supportsTmdb: true, supportsTv: true, note: 'High quality' },
  { id: 'embed_su', label: 'Embed.su', quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true, note: 'Fast & stable' },
  { id: 'vidsrc_to', label: 'VidSrc.to', quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: 'vidsrc_fyi', label: 'VidSrc.fyi', quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: 'vidlink', label: 'VidLink.pro', quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true },
  { id: 'videasy', label: 'Videasy.net', quality: '4K', supportsImdb: false, supportsTmdb: true, supportsTv: true, note: 'Ad-free' },
  { id: 'vidfast', label: 'VidFast.pro', quality: '4K', supportsImdb: false, supportsTmdb: true, supportsTv: true },
  { id: 'vidsrc_pro', label: 'VidSrc.pro', quality: '4K', supportsImdb: true, supportsTmdb: true, supportsTv: true, note: 'Anime' },
  { id: 'vidsrc_vip', label: 'VidSrc.vip', quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true, note: 'Download' },
  { id: 'vidsrc_me', label: 'VidSrc.me', quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: 'autoembed', label: 'AutoEmbed.cc', quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: 'autoembed_co', label: 'AutoEmbed.co', quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: 'multiembed', label: 'MultiEmbed.mov', quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: 'superembed', label: 'SuperEmbed.stream', quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: '2embed', label: '2Embed.cc', quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: 'embedmaster', label: 'EmbedMaster', quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: 'rivestream', label: 'RiveStream', quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true },
  { id: 'cinesrc', label: 'CineSrc', quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true },
];

const DIRECT_VIDEO_EXTENSIONS = ['.mp4', '.m3u8', '.mpd', '.webm', '.ogg', '.mov', '.mkv'];

const isPlayableDirectUrl = (url: string) => {
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.startsWith('blob:') || cleanUrl.startsWith('data:video') || DIRECT_VIDEO_EXTENSIONS.some(ext => cleanUrl.endsWith(ext));
};

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ movie }) => {
  const isImdb = movie.id.startsWith('tt');
  const lowerGenre = movie.genre?.toLowerCase() || '';
  const isTv = lowerGenre.includes('tv') || lowerGenre.includes('series');

  const [manualStreamUrl, setManualStreamUrl] = useState<string | null>(null);
  const effectiveStreamUrl = manualStreamUrl || movie.streamUrl;
  const hasStreamUrl = Boolean(effectiveStreamUrl);
  const isDirectVideo = Boolean(effectiveStreamUrl && isPlayableDirectUrl(effectiveStreamUrl));

  const defaultEmbedServer = hasStreamUrl && isDirectVideo ? 'direct' : 'vidsrc_xyz';
  const [embedServer, setEmbedServer] = useState<EmbedServerType>(defaultEmbedServer);
  const [season, setSeason] = useState('1');
  const [episode, setEpisode] = useState('1');
  const [key, setKey] = useState(0);
  const [magnetInput, setMagnetInput] = useState('');

  useEffect(() => {
    const nextDefault = hasStreamUrl && isDirectVideo ? 'direct' : 'vidsrc_xyz';
    setEmbedServer(nextDefault);
  }, [effectiveStreamUrl, isImdb, isDirectVideo]);

  const getEmbedUrl = (): string => {
    const id = movie.id;
    const s = season;
    const e = episode;
    let rawUrl = '';

    switch (embedServer) {
      case 'vidsrc_xyz':
        rawUrl = isTv ? `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}` : `https://vidsrc.xyz/embed/movie/${id}`;
        break;
      case 'embed_su':
        rawUrl = isTv ? `https://embed.su/embed/tv/${id}/${s}/${e}` : `https://embed.su/embed/movie/${id}`;
        break;
      case 'vidlink':
        rawUrl = isTv ? `https://vidlink.pro/tv/${id}/${s}/${e}` : `https://vidlink.pro/movie/${id}`;
        break;
      case 'videasy':
        rawUrl = isTv ? `https://player.videasy.net/tv/${id}/${s}/${e}` : `https://player.videasy.net/movie/${id}`;
        break;
      case 'vidfast':
        rawUrl = isTv ? `https://vidfast.pro/tv/${id}/${s}/${e}` : `https://player.videasy.net/movie/${id}`;
        break;
      case 'vidsrc_fyi':
        rawUrl = isTv ? `https://vidsrc.fyi/embed/tv/${id}/${s}/${e}` : `https://vidsrc.fyi/embed/movie/${id}`;
        break;
      case 'vidsrc_pro':
        rawUrl = isTv ? `https://vidsrc.pro/embed/tv/${id}/${s}/${e}` : `https://vidsrc.pro/embed/movie/${id}`;
        break;
      case 'vidsrc_vip':
        rawUrl = isTv ? `https://vidsrc.vip/embed/tv/${id}/${s}/${e}` : `https://vidsrc.vip/embed/movie/${id}`;
        break;
      case 'vidsrc_me':
        rawUrl = isTv
          ? `https://vidsrc.me/embed/tv?imdb=${id}&season=${s}&episode=${e}`
          : `https://vidsrc.me/embed/movie?imdb=${id}`;
        break;
      case 'vidsrc_to':
        rawUrl = isTv ? `https://vidsrc.to/embed/tv/${id}/${s}/${e}` : `https://vidsrc.to/embed/movie/${id}`;
        break;
      case 'autoembed':
        rawUrl = isTv
          ? `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`
          : `https://player.autoembed.cc/embed/movie/${id}`;
        break;
      case 'autoembed_co':
        rawUrl = isTv
          ? `https://autoembed.co/tv/imdb/${id}-${s}-${e}`
          : `https://autoembed.co/movie/imdb/${id}`;
        break;
      case 'multiembed':
        rawUrl = isTv
          ? `https://multiembed.mov/?video_id=${id}&tmdb=${isImdb ? 0 : 1}&s=${s}&e=${e}`
          : `https://multiembed.mov/?video_id=${id}&tmdb=${isImdb ? 0 : 1}`;
        break;
      case 'multiembed_vip':
        rawUrl = isTv
          ? `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=${isImdb ? 0 : 1}&s=${s}&e=${e}`
          : `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=${isImdb ? 0 : 1}`;
        break;
      case 'superembed':
        rawUrl = isTv
          ? `https://multiembed.mov/?video_id=${id}&tmdb=${isImdb ? 0 : 1}&s=${s}&e=${e}`
          : `https://www.superembed.stream/embed?id=${id}&tmdb=${isImdb ? 0 : 1}`;
        break;
      case '2embed':
        rawUrl = isTv ? `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` : `https://www.2embed.cc/embed/${id}`;
        break;
      case 'embedmaster':
        rawUrl = isTv
          ? isImdb ? `https://embedmaster.com/embed/series/${id}/${s}/${e}` : `https://embedmaster.com/embed/series/tmdb/${id}/${s}/${e}`
          : isImdb ? `https://embedmaster.com/embed/movie/${id}` : `https://embedmaster.com/embed/movie/tmdb/${id}`;
        break;
      case 'rivestream':
        rawUrl = isTv ? `https://www.rivestream.app/embed?type=tv&id=${id}&season=${s}&episode=${e}` : `https://www.rivestream.app/embed?type=movie&id=${id}`;
        break;
      case 'cinesrc':
        rawUrl = isTv ? `https://cinesrc.org/embed/tv/${id}/${s}/${e}` : `https://cinesrc.org/embed/movie/${id}`;
        break;
      default:
        rawUrl = `https://vidsrc.xyz/embed/movie/${id}`;
    }

    return rawUrl;
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

  const compatibleServers = ALL_SERVERS.filter(srv => {
    if (isImdb && !srv.supportsImdb) return false;
    if (!isImdb && !srv.supportsTmdb) return false;
    if (isTv && !srv.supportsTv) return false;
    return true;
  });

  const activeServer = ALL_SERVERS.find(s => s.id === embedServer);

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
              <span className="font-bold">Streaming Sources ({isImdb ? 'IMDb' : 'TMDb'} • {isTv ? 'TV' : 'Movie'}):</span>
              {activeServer && (
                <span className="text-[10px]">• {activeServer.quality} • {activeServer.note || ''}</span>
              )}
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
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Tier 1 — Best Quality</p>
            <div className="flex flex-wrap gap-2">
              {hasStreamUrl && isDirectVideo && (
                <button
                  onClick={() => setEmbedServer('direct')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${embedServer === 'direct' ? 'bg-green-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-green-500/20'}`}
                >
                  Direct Video
                </button>
              )}
              {compatibleServers.slice(0, 10).map(srv => (
                <button
                  key={srv.id}
                  onClick={() => setEmbedServer(srv.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${embedServer === srv.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-purple-500/20'}`}
                >
                  {srv.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Paste Direct Link</p>
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
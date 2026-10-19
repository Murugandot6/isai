"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import {
  TV_SOURCES,
  fetchTvRow,
  tamilChannels,
  type TvChannel,
  type TvRow,
} from '@/services/iptvApi';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Search,
  Play,
  ChevronLeft,
  ChevronRight,
  Tv,
  Lightbulb,
  Loader2,
  RefreshCw,
  Radio,
  X,
} from 'lucide-react';

const MAX_PER_ROW = 80;
const HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1.4.12/dist/hls.min.js';

type HlsInstance = {
  loadSource: (url: string) => void;
  attachMedia: (el: HTMLMediaElement) => void;
  on: (event: string, cb: (event?: unknown, data?: unknown) => void) => void;
  destroy: () => void;
};

type HlsCtor = {
  new (config?: { maxBufferLength?: number }): HlsInstance;
  isSupported: () => boolean;
  Events: { MANIFEST_PARSED: string; ERROR: string };
};

function getHls(): HlsCtor | undefined {
  return (window as unknown as { Hls?: HlsCtor }).Hls;
}

async function loadHlsScript(): Promise<HlsCtor | undefined> {
  if (getHls()) return getHls();
  await new Promise<void>((resolve) => {
    const existing = document.querySelector(`script[src="${HLS_CDN}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.src = HLS_CDN;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
  return getHls();
}

function flagFromCountry(code: string): string {
  if (!code || code.length !== 2) return '';
  return String.fromCodePoint(
    ...code.split('').map((char) => 127397 + char.charCodeAt(0)),
  );
}

const SOURCE_TITLES = TV_SOURCES.map((source) => source.title);

const ChannelArt: React.FC<{ channel: TvChannel; className?: string }> = ({ channel, className }) => {
  const [broken, setBroken] = useState(false);
  if (!channel.logo || broken) {
    return (
      <div
        className={cn(
          'w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/15 via-zinc-900 to-zinc-950 text-cyan-300/70 font-black text-2xl',
          className,
        )}
      >
        {(channel.name || '?').charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={channel.logo}
      alt={channel.name}
      loading="lazy"
      onError={() => setBroken(true)}
      className={cn('max-h-[62%] max-w-[78%] object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.6)]', className)}
    />
  );
};

const ChannelCard: React.FC<{ channel: TvChannel; onPlay: (channel: TvChannel) => void }> = ({
  channel,
  onPlay,
}) => (
  <button
    onClick={() => onPlay(channel)}
    className="group relative flex-shrink-0 w-[172px] sm:w-[196px] text-left rounded-2xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-800/80 hover:border-cyan-400/40 transition-all duration-300 hover:scale-[1.03] shadow-lg overflow-hidden"
  >
    <div className="relative aspect-video flex items-center justify-center bg-zinc-950/80 overflow-hidden">
      <ChannelArt channel={channel} />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="w-11 h-11 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-xl">
          <Play size={18} fill="currentColor" className="ml-0.5" />
        </span>
      </div>
      {channel.quality ? (
        <span className="absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/70 text-cyan-300 border border-white/10">
          {channel.quality}
        </span>
      ) : null}
    </div>
    <div className="p-2.5 space-y-0.5">
      <p className="text-[11.5px] font-bold text-zinc-100 truncate leading-tight">{channel.name}</p>
      <p className="text-[9.5px] font-semibold uppercase tracking-wider text-zinc-500 truncate">
        {flagFromCountry(channel.country)} {channel.group || 'Live TV'}
      </p>
    </div>
  </button>
);

const Row: React.FC<{ row: TvRow; onPlay: (channel: TvChannel) => void }> = ({ row, onPlay }) => {
  const scroller = useRef<HTMLDivElement | null>(null);
  const channels = useMemo(
    () => [...row.channels].sort((a, b) => a.name.localeCompare(b.name)).slice(0, MAX_PER_ROW),
    [row.channels],
  );

  const scroll = (direction: 1 | -1) => {
    scroller.current?.scrollBy({ left: direction * 640, behavior: 'smooth' });
  };

  if (channels.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-4 px-1">
        <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-100 flex items-center gap-2">
          {row.title}
          <span className="text-[10px] font-bold text-zinc-500 tracking-widest">{channels.length}</span>
        </h2>
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scroll(-1)}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll(1)}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div
        ref={scroller}
        className="flex gap-3 overflow-x-auto pb-2 px-1 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {channels.map((channel) => (
          <ChannelCard key={`${channel.url}-${channel.id}`} channel={channel} onPlay={onPlay} />
        ))}
      </div>
    </section>
  );
};

const TV: React.FC = () => {
  const [rows, setRows] = useState<TvRow[]>([]);
  const [loadingCount, setLoadingCount] = useState(TV_SOURCES.length);
  const [failed, setFailed] = useState<string[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<TvChannel | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const hlsRef = useRef<HlsInstance | null>(null);
  const indiaRef = useRef<TvChannel[]>([]);

  useEffect(() => {
    let cancelled = false;
    setRows([]);
    setFailed([]);
    setLoadingCount(TV_SOURCES.length);
    indiaRef.current = [];

    const run = async () => {
      await Promise.all(
        TV_SOURCES.map(async (source) => {
          try {
            const row = await fetchTvRow(source);
            if (cancelled) return;
            if (source.id === 'india') {
              indiaRef.current = row.channels;
              const tamil = tamilChannels(row.channels);
              setRows((prev) => (tamil.length ? [...prev, { id: 'tamil', title: 'Tamil', channels: tamil }] : prev));
            }
            setRows((prev) => [...prev, row]);
          } catch {
            if (!cancelled) setFailed((prev) => [...prev, source.title]);
          } finally {
            if (!cancelled) setLoadingCount((prev) => prev - 1);
          }
        }),
      );
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const allChannels = useMemo(() => {
    const map = new Map<string, TvChannel>();
    for (const row of rows) {
      for (const channel of row.channels) {
        if (!map.has(channel.url)) map.set(channel.url, channel);
      }
    }
    return [...map.values()];
  }, [rows]);

  const featured = useMemo(() => {
    const pool = allChannels.filter((channel) => channel.logo);
    const priority = pool.find((channel) =>
      /sun|vijay|zee|star|sony|colors|bbc|cnn|ndtv|kalaignar|jaya/i.test(channel.name),
    );
    return priority || pool[0] || null;
  }, [allChannels]);

  const trimmedQuery = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!trimmedQuery) return [];
    return allChannels
      .filter((channel) =>
        `${channel.name} ${channel.group} ${channel.country}`.toLowerCase().includes(trimmedQuery),
      )
      .slice(0, 120);
  }, [allChannels, trimmedQuery]);

  const closePlayer = useCallback(() => {
    setActive(null);
    setPlayerError(null);
    setPlayerLoading(false);
  }, []);

  useEffect(() => {
    if (!active) return;
    const video = videoEl;
    if (!video) return;

    setPlayerError(null);
    setPlayerLoading(true);

    if (active.url.startsWith('http://') && window.location.protocol === 'https:') {
      setPlayerError('This stream is served over insecure HTTP and is blocked on the secure site. Open the app on localhost or via HTTP to watch.');
      setPlayerLoading(false);
    }

    let disposed = false;
    const describe = (details: string) => {
      if (/cors|origin/i.test(details)) {
        return 'The channel does not allow browser playback (missing CORS headers). Copy the URL and use VLC or a mobile IPTV app.';
      }
      if (/geo|policy|redirect|authorized/i.test(details)) {
        return 'The channel refused the request — it is likely geo-restricted or offline.';
      }
      if (/manifest|segment|fragment|request|network/i.test(details)) {
        return 'The stream could not be fetched — the channel may be offline or temporarily unavailable.';
      }
      return 'The stream format could not be played in the browser.';
    };

    const start = async () => {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = active.url;
        video.play().catch(() => {});
        setPlayerLoading(false);
        return;
      }

      const Hls = await loadHlsScript();
      if (disposed) return;
      if (Hls && Hls.isSupported()) {
        if (hlsRef.current) hlsRef.current.destroy();
        const hls = new Hls({ maxBufferLength: 20 });
        hlsRef.current = hls;
        hls.loadSource(active.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (disposed) return;
          setPlayerLoading(false);
          video.play().catch(() => {
            video.muted = true;
            video.play().catch(() => {});
          });
        });
        hls.on(Hls.Events.ERROR, (event: unknown, data: { fatal?: boolean; type?: string; details?: string }) => {
          if (disposed || !data?.fatal) return;
          setPlayerError(describe(`${data.type || ''} ${data.details || ''}`));
          setPlayerLoading(false);
        });
      } else {
        video.src = active.url;
        video.play().catch(() => {});
        setPlayerLoading(false);
      }
    };

    start();

    return () => {
      disposed = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [active, videoEl]);

  const isLoading = loadingCount > 0;

  return (
    <MainLayout>
      <div className="relative min-h-screen bg-[#050506] pb-24">
        {/* Hero */}
        <div className="relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-purple-700/10 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.18),transparent_55%)]" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-16 sm:pb-16">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-cyan-400 flex items-center gap-2">
              <Tv size={13} /> Live Television
            </p>
            <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tighter uppercase text-white">
              Live <span className="text-zinc-500 font-medium italic">TV Channels</span>
            </h1>
            <p className="mt-3 max-w-xl text-xs sm:text-sm font-semibold uppercase tracking-widest text-zinc-400 leading-relaxed">
              Thousands of free channels from around the world — news, movies, music, sports and more.
            </p>

            {featured ? (
              <button
                onClick={() => setActive(featured)}
                className="mt-7 group flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-cyan-400/40 transition-all p-3 pr-6 max-w-md w-full text-left"
              >
                <div className="w-28 h-16 rounded-xl bg-zinc-950 flex items-center justify-center overflow-hidden shrink-0">
                  <ChannelArt channel={featured} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">Featured Now</p>
                  <p className="text-sm font-black text-white truncate">{featured.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 truncate">
                    {flagFromCountry(featured.country)} {featured.group || 'Live TV'}
                  </p>
                </div>
                <span className="ml-auto w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Play size={16} fill="currentColor" className="ml-0.5" />
                </span>
              </button>
            ) : (
              <Skeleton className="mt-7 h-[88px] max-w-md w-full rounded-2xl bg-white/5" />
            )}

            <div className="mt-7 relative max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search channels, genres or countries…"
                className="pl-10 pr-10 h-11 bg-zinc-900/70 border-white/10 text-sm placeholder:text-zinc-600 focus-visible:ring-cyan-500/40"
              />
              {query ? (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X size={15} />
                </button>
              ) : null}
            </div>

            <div className="mt-4 flex items-start gap-2 text-[10.5px] font-semibold text-zinc-500 max-w-2xl">
              <Lightbulb size={13} className="text-amber-400/80 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Channels are sourced live from iptv-org. Some streams are offline, geo-blocked, or use insecure HTTP
                (blocked on the HTTPS site).
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
          {trimmedQuery ? (
            <section className="space-y-3">
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-100">
                Results <span className="text-[10px] font-bold text-zinc-500 tracking-widest">{searchResults.length}</span>
              </h2>
              {searchResults.length === 0 ? (
                <div className="py-16 text-center text-zinc-500">
                  <Radio size={28} className="mx-auto mb-3 opacity-50" />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    {isLoading ? 'Still loading channels…' : 'No channels match your search'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {searchResults.map((channel) => (
                    <ChannelCard key={`${channel.url}-${channel.id}`} channel={channel} onPlay={setActive} />
                  ))}
                </div>
              )}
            </section>
          ) : (
            <>
              {rows.map((row) => (
                <Row key={row.id} row={row} onPlay={setActive} />
              ))}

              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-32 bg-white/5" />
                  <div className="flex gap-3 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Skeleton key={index} className="h-[150px] w-[190px] rounded-2xl bg-white/5 shrink-0" />
                    ))}
                  </div>
                </div>
              ) : null}

              {!isLoading && rows.length === 0 ? (
                <div className="py-20 text-center text-zinc-500 space-y-4">
                  <Tv size={32} className="mx-auto opacity-50" />
                  <p className="text-xs font-bold uppercase tracking-widest">Could not load channels</p>
                  <button
                    onClick={() => setReloadKey((key) => key + 1)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-white text-[11px] font-black uppercase tracking-widest"
                  >
                    <RefreshCw size={14} /> Retry
                  </button>
                </div>
              ) : null}

              {!isLoading && failed.length > 0 ? (
                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  Some categories unavailable: {failed.join(', ')}
                </p>
              ) : null}

              {!isLoading && allChannels.length > 0 ? (
                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  {allChannels.length} channels across {rows.length} categories · powered by iptv-org
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Player */}
      <Dialog open={!!active} onOpenChange={(open) => { if (!open) closePlayer(); }}>
        <DialogContent className="max-w-5xl p-0 gap-0 bg-zinc-950 border-white/10 overflow-hidden">
          <DialogTitle className="sr-only">{active ? active.name : 'Live TV'}</DialogTitle>
          <div className="relative w-full aspect-video bg-black flex items-center justify-center">
            {active ? (
              <video
                ref={setVideoEl}
                className="w-full h-full object-contain bg-black"
                controls
                autoPlay
                playsInline
              />
            ) : null}

            {playerLoading && !playerError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 pointer-events-none">
                <Loader2 className="animate-spin text-cyan-400" size={30} />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tuning in…</p>
              </div>
            ) : null}

            {playerError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85 text-center px-8">
                <Tv size={30} className="text-zinc-600" />
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 max-w-sm leading-relaxed">
                  {playerError}
                </p>
              </div>
            ) : null}
          </div>
          {active ? (
            <div className="flex items-center gap-3 px-4 py-3 border-t border-white/5 bg-zinc-900/80">
              <div className="w-12 h-8 rounded-lg bg-zinc-950 flex items-center justify-center overflow-hidden shrink-0">
                <ChannelArt channel={active} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white truncate">{active.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 truncate">
                  {flagFromCountry(active.country)} {active.group || 'Live TV'}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(active.url);
                  toast.success('Stream URL copied');
                }}
                className="ml-auto text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 shrink-0"
              >
                Copy URL
              </button>
              <span className="hidden md:inline text-[9px] font-bold uppercase tracking-widest text-zinc-600 shrink-0">
                VLC / IPTV app for fails
              </span>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default TV;

"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import {
  loadLibrary,
  filterSongs,
  deriveEntities,
  getStats,
  paginate,
  songKey,
  songSnippet,
  formatCount,
  ENTITY_FIELD,
  type LyricsSong,
  type LyricsEntity,
  type EntityKind,
  type LyricsFilters,
} from '@/services/lyricsApi';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Search,
  Sparkles,
  Heart,
  ChevronLeft,
  ChevronRight,
  Copy,
  Youtube,
  Shuffle,
  ScrollText,
  Star,
  Play,
  ArrowRight,
  X,
} from 'lucide-react';

type TabKey = 'songs' | 'lyrics' | EntityKind;

const PAGE_SIZE = 24;

const TABS: { key: TabKey; label: string }[] = [
  { key: 'songs', label: 'Songs' },
  { key: 'lyrics', label: 'Lyrics' },
  { key: 'movies', label: 'Movies' },
  { key: 'singers', label: 'Singers' },
  { key: 'lyricists', label: 'Lyricists' },
  { key: 'actors', label: 'Actors' },
  { key: 'actresses', label: 'Actresses' },
  { key: 'music-directors', label: 'Music Directors' },
];

const QUICK_PICKS = [
  'A. R. Rahman',
  'Anirudh Ravichander',
  'Yuvan Shankar Raja',
  'Vairamuthu',
  'Shreya Ghoshal',
  'Ilaiyaraaja',
];

const FAV_STORAGE_KEY = 'anbaeLyricsFavs';

const ENTITY_LABEL: Record<EntityKind, string> = {
  movies: 'Movies',
  singers: 'Singers',
  lyricists: 'Lyricists',
  actors: 'Actors',
  actresses: 'Actresses',
  'music-directors': 'Music Directors',
};

const isEntityTab = (tab: TabKey): tab is EntityKind => tab !== 'songs' && tab !== 'lyrics';

type FilterState = {
  movie: string;
  singer: string;
  lyricist: string;
  actor: string;
  actress: string;
  musicDirector: string;
};

const EMPTY_FILTERS: FilterState = {
  movie: '',
  singer: '',
  lyricist: '',
  actor: '',
  actress: '',
  musicDirector: '',
};

const FILTER_LABEL: Record<keyof FilterState, string> = {
  movie: 'Movie',
  singer: 'Singer',
  lyricist: 'Lyricist',
  actor: 'Actor',
  actress: 'Actress',
  musicDirector: 'Music director',
};

function loadFavorites(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(FAV_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

const ArtFallback: React.FC<{ label: string; className?: string; rounded?: string }> = ({
  label,
  className,
  rounded = 'rounded-2xl',
}) => (
  <div
    className={cn(
      'w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-500/20 via-zinc-900 to-zinc-950 text-rose-300/70 font-black',
      rounded,
      className,
    )}
  >
    {(label || '?').charAt(0).toUpperCase()}
  </div>
);

const Poster: React.FC<{ src?: string; label: string; rounded?: string; className?: string }> = ({
  src,
  label,
  rounded,
  className,
}) => {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <ArtFallback label={label} rounded={rounded} className={className} />;
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setBroken(true)}
      className={cn('w-full h-full object-cover', rounded, className)}
    />
  );
};

const StatTile: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex-1 min-w-[86px] rounded-2xl bg-white/5 border border-white/5 px-4 py-3 text-center">
    <div className="text-lg font-black text-white">{formatCount(value)}</div>
    <div className="text-[10px] font-bold uppercase tracking-widest text-rose-300/80">{label}</div>
  </div>
);

const CreditChip: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-bold text-zinc-300">
    <span className="text-rose-300/80 uppercase tracking-wide">{label}</span>
    <span className="text-white/90">{value}</span>
  </span>
);

const Lyrics = () => {
  const [songs, setSongs] = useState<LyricsSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [tab, setTab] = useState<TabKey>('songs');
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [favOnly, setFavOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState<Record<string, string>>({});

  const [active, setActive] = useState<LyricsSong | null>(null);
  const [singOpen, setSingOpen] = useState(false);
  const [singIndex, setSingIndex] = useState(0);

  useEffect(() => {
    let alive = true;
    loadLibrary()
      .then((data) => {
        if (!alive) return;
        setSongs(data);
        setLoading(false);
      })
      .catch((error) => {
        if (!alive) return;
        setLoadError(error?.message || 'Failed to load library');
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [tab, filters, favOnly]);

  const stats = useMemo(() => getStats(songs), [songs]);

  const movieOptions = useMemo(() => deriveEntities(songs, 'movies'), [songs]);
  const singerOptions = useMemo(() => deriveEntities(songs, 'singers'), [songs]);
  const lyricistOptions = useMemo(() => deriveEntities(songs, 'lyricists'), [songs]);

  const favoriteKeys = useMemo(() => Object.keys(favorites), [favorites]);

  const activeFilterEntries = useMemo(
    () =>
      (Object.keys(filters) as (keyof FilterState)[])
        .filter((key) => filters[key])
        .map((key) => ({ key, label: FILTER_LABEL[key], value: filters[key] })),
    [filters],
  );
  const hasActiveFilter = activeFilterEntries.length > 0 || Boolean(searchInput);

  const browseFilters: LyricsFilters = useMemo(
    () => ({
      q: tab === 'songs' ? query : '',
      lq: tab === 'lyrics' ? query : '',
      movie: filters.movie,
      singer: filters.singer,
      lyricist: filters.lyricist,
      actor: filters.actor,
      actress: filters.actress,
      musicDirector: filters.musicDirector,
    }),
    [tab, query, filters],
  );

  const songResults = useMemo(() => {
    if (favOnly) {
      return songs.filter((song) => favorites[songKey(song)]);
    }
    return filterSongs(songs, browseFilters);
  }, [songs, browseFilters, favOnly, favorites]);

  const entityResults = useMemo(() => {
    if (!isEntityTab(tab)) return [] as LyricsEntity[];
    const all = deriveEntities(songs, tab);
    if (!query) return all;
    const needle = query.toLowerCase();
    return all.filter((entity) =>
      `${entity.name} ${entity.route}`.toLowerCase().includes(needle),
    );
  }, [songs, tab, query]);

  const isSongMode = tab === 'songs' || tab === 'lyrics';

  const pagedSongs = useMemo(() => paginate(songResults, page, PAGE_SIZE), [songResults, page]);
  const pagedEntities = useMemo(() => paginate(entityResults, page, PAGE_SIZE), [entityResults, page]);

  const totalResults = favOnly || isSongMode ? songResults.length : entityResults.length;
  const pages = favOnly || isSongMode ? pagedSongs.pages : pagedEntities.pages;
  const pageResults = favOnly || isSongMode ? pagedSongs.results : pagedEntities.results;

  const spotlight = useMemo(() => {
    const withArt = songs.filter((song) => song.movie?.avatar);
    const pool = withArt.length ? withArt : songs;
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  }, [songs]);

  const persistFavorites = (next: Record<string, string>) => {
    setFavorites(next);
    try {
      localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const toggleFavorite = (song: LyricsSong) => {
    const key = songKey(song);
    const next = { ...favorites };
    if (next[key]) {
      delete next[key];
      toast.success('Removed from favorites');
    } else {
      next[key] = song.title;
      toast.success('Saved to favorites');
    }
    persistFavorites(next);
  };

  const isFavorite = (song: LyricsSong) => Boolean(favorites[songKey(song)]);

  const openSong = (song: LyricsSong) => {
    setActive(song);
    setSingIndex(0);
  };

  const jumpToEntitySongs = (kind: EntityKind, name: string) => {
    const field = ENTITY_FIELD[kind];
    setFilters({ ...EMPTY_FILTERS, [field]: name } as FilterState);
    setSearchInput('');
    setFavOnly(false);
    setTab('songs');
  };

  const surprise = () => {
    const pool = songResults.length ? songResults : songs;
    if (!pool.length) return;
    openSong(pool[Math.floor(Math.random() * pool.length)]);
  };

  const goToPage = (delta: number) => {
    setPage((current) => Math.min(pages, Math.max(1, current + delta)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeLines = useMemo(
    () => (active?.lyrics || '').split('\n').filter((line) => line.trim()),
    [active],
  );

  const copyLyrics = () => {
    if (!active) return;
    const movieName = active.movie?.name || '';
    const text = `${active.title}\n${movieName}\n\n${active.lyrics || ''}`;
    const fallback = () => {
      try {
        const area = document.createElement('textarea');
        area.value = text;
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
        toast.success('Lyrics copied');
      } catch {
        toast.error('Copy failed');
      }
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => toast.success('Lyrics copied'),
        fallback,
      );
    } else {
      fallback();
    }
  };

  const renderSongCard = (song: LyricsSong) => {
    const thumb = song.movie?.avatar;
    const meta = [song.movie?.name, song.movie?.year].filter(Boolean).join(' · ');
    return (
      <article
        key={songKey(song)}
        onClick={() => openSong(song)}
        className="group relative flex flex-col rounded-3xl overflow-hidden bg-card/40 border border-white/5 hover:border-rose-500/40 hover:bg-card/70 transition-all duration-300 cursor-pointer hover:-translate-y-1 shadow-xl"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
          <Poster
            src={thumb}
            label={song.title}
            rounded="rounded-none"
            className="group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-11 h-11 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg">
              <ScrollText size={18} />
            </div>
          </div>
          <button
            type="button"
            aria-label={isFavorite(song) ? 'Remove favorite' : 'Add favorite'}
            onClick={(event) => {
              event.stopPropagation();
              toggleFavorite(song);
            }}
            className={cn(
              'absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all',
              isFavorite(song)
                ? 'bg-rose-500 text-white'
                : 'bg-black/40 text-white/70 hover:text-rose-300',
            )}
          >
            <Star size={14} fill={isFavorite(song) ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="p-4 space-y-2 text-left">
          <h3 className="text-sm font-extrabold tracking-tight text-white leading-snug line-clamp-2">
            {song.title}
          </h3>
          {meta && <p className="text-[11px] font-semibold text-zinc-400 truncate">{meta}</p>}
          {tab === 'lyrics' && songSnippet(song) && (
            <p className="text-[11px] text-rose-200/80 leading-relaxed border-l-2 border-rose-500/40 pl-2 line-clamp-2">
              {songSnippet(song)}…
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {song.singers?.slice(0, 2).map((singer) => (
              <span
                key={singer}
                className="rounded-full bg-white/5 border border-white/5 px-2 py-0.5 text-[9px] font-bold text-zinc-300"
              >
                {singer}
              </span>
            ))}
            {song.lyricist?.[0] && (
              <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[9px] font-bold text-rose-200">
                Lyrics: {song.lyricist[0]}
              </span>
            )}
          </div>
        </div>
      </article>
    );
  };

  const renderEntityCard = (entity: LyricsEntity) => (
    <article
      key={`${tab}-${entity.route}`}
      onClick={() => jumpToEntitySongs(tab as EntityKind, entity.name)}
      className="group flex items-center gap-4 rounded-2xl bg-card/40 border border-white/5 hover:border-rose-500/40 hover:bg-card/70 transition-all duration-300 cursor-pointer p-3 shadow-lg"
    >
      <div className="w-14 h-14 shrink-0 rounded-full overflow-hidden bg-zinc-950 border border-white/5">
        <Poster src={entity.avatar || undefined} label={entity.name} rounded="rounded-full" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <h3 className="text-sm font-bold text-white truncate">{entity.name}</h3>
        <p className="text-[11px] font-semibold text-rose-300/80">
          {formatCount(entity.songcount)} {entity.songcount === 1 ? 'song' : 'songs'}
        </p>
      </div>
      <ArrowRight
        size={16}
        className="text-muted-foreground group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all shrink-0"
      />
    </article>
  );

  const headingLabel = favOnly
    ? 'Favorites'
    : isSongMode
      ? tab === 'lyrics'
        ? 'Lyrics'
        : 'All songs'
      : ENTITY_LABEL[tab as EntityKind];

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/50 px-4 md:px-10 pt-12 pb-10">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-30%] left-[-10%] w-[45%] h-[80%] bg-rose-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-40%] right-[-10%] w-[45%] h-[80%] bg-purple-600/10 rounded-full blur-[120px]" />
          </div>

          <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="bg-rose-500/15 p-2.5 rounded-2xl">
                  <ScrollText className="text-rose-400" size={20} />
                </div>
                <Badge
                  variant="outline"
                  className="bg-rose-500/10 text-rose-300 border-rose-500/20 text-[9px] font-black tracking-widest"
                >
                  TAMIL LYRICS LIBRARY
                </Badge>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.02] uppercase text-[#f2f2f4]">
                Isai <span className="text-zinc-600 font-medium italic">Padal</span>
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm font-semibold uppercase tracking-widest leading-relaxed max-w-[520px] mx-auto lg:mx-0">
                Search songs, films, singers & lyricists — read full Tamil lyrics, copy, favorite and sing along.
              </p>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setQuery(searchInput.trim());
                }}
                className="relative max-w-xl mx-auto lg:mx-0"
              >
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={
                    tab === 'lyrics' ? 'Search inside lyric lines…' : 'Song, movie, singer, lyricist…'
                  }
                  className="w-full h-12 md:h-14 pl-11 pr-28 rounded-2xl bg-card/60 border border-white/10 focus:border-rose-500/40 outline-none text-sm font-semibold text-white placeholder:text-muted-foreground transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 md:h-10 px-5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-[11px] font-black uppercase tracking-widest transition-colors"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                {QUICK_PICKS.map((pick) => (
                  <button
                    key={pick}
                    type="button"
                    onClick={() => {
                      setSearchInput(pick);
                      setTab('songs');
                      setFavOnly(false);
                    }}
                    className="rounded-full border border-white/10 bg-white/5 hover:border-rose-500/40 hover:text-rose-300 px-3 py-1.5 text-[10px] font-bold text-zinc-300 transition-colors"
                  >
                    {pick}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <StatTile value={stats.songs} label="Songs" />
                <StatTile value={stats.movies} label="Movies" />
                <StatTile value={stats.singers} label="Singers" />
                <StatTile value={stats.lyricists} label="Lyricists" />
              </div>
            </div>

            {/* Spotlight */}
            <aside className="hidden lg:flex flex-col rounded-3xl bg-card/50 border border-white/5 p-4 shadow-2xl">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-300 mb-3">
                <Sparkles size={12} /> Featured
              </div>
              {spotlight ? (
                <div className="space-y-4">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-950">
                    <Poster
                      src={spotlight.movie?.avatar}
                      label={spotlight.title}
                      rounded="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <h3 className="text-base font-extrabold text-white leading-tight">
                      {spotlight.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-semibold">
                      {[spotlight.movie?.name, spotlight.movie?.year].filter(Boolean).join(' · ')}
                    </p>
                    {spotlight.singers?.length ? (
                      <p className="text-[11px] text-zinc-500 font-semibold truncate">
                        {spotlight.singers.slice(0, 3).join(', ')}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => openSong(spotlight)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-[11px] font-black uppercase tracking-widest py-2.5 transition-colors"
                  >
                    <ScrollText size={14} /> Read lyrics
                  </button>
                </div>
              ) : (
                <Skeleton className="aspect-[4/3] rounded-2xl" />
              )}
              <button
                type="button"
                onClick={surprise}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-white/10 hover:border-rose-500/40 hover:text-rose-300 text-zinc-300 text-[10px] font-black uppercase tracking-widest py-2.5 transition-colors"
              >
                <Shuffle size={13} /> Surprise me
              </button>
            </aside>
          </div>
        </section>

        {/* Browse */}
        <section className="px-4 md:px-10 py-8 max-w-7xl mx-auto space-y-6">
          {/* Tab rail */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setTab(item.key);
                  setFavOnly(false);
                }}
                className={cn(
                  'shrink-0 rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all border',
                  tab === item.key && !favOnly
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-white/5 text-zinc-400 border-white/5 hover:text-white hover:border-white/15',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {isSongMode && (
                <>
                  <select
                    value={filters.movie}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, movie: event.target.value }))
                    }
                    className="h-10 rounded-xl bg-card/60 border border-white/10 px-3 text-xs font-semibold text-zinc-200 outline-none focus:border-rose-500/40 max-w-[180px]"
                  >
                    <option value="">All movies</option>
                    {movieOptions.slice(0, 200).map((entity) => (
                      <option key={entity.route} value={entity.name}>
                        {entity.name} ({entity.songcount})
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.singer}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, singer: event.target.value }))
                    }
                    className="h-10 rounded-xl bg-card/60 border border-white/10 px-3 text-xs font-semibold text-zinc-200 outline-none focus:border-rose-500/40 max-w-[180px]"
                  >
                    <option value="">All singers</option>
                    {singerOptions.slice(0, 200).map((entity) => (
                      <option key={entity.route} value={entity.name}>
                        {entity.name} ({entity.songcount})
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.lyricist}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, lyricist: event.target.value }))
                    }
                    className="h-10 rounded-xl bg-card/60 border border-white/10 px-3 text-xs font-semibold text-zinc-200 outline-none focus:border-rose-500/40 max-w-[180px]"
                  >
                    <option value="">All lyricists</option>
                    {lyricistOptions.slice(0, 200).map((entity) => (
                      <option key={entity.route} value={entity.name}>
                        {entity.name} ({entity.songcount})
                      </option>
                    ))}
                  </select>
                  {hasActiveFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilters(EMPTY_FILTERS);
                        setSearchInput('');
                      }}
                      className="h-10 rounded-xl border border-white/10 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setFavOnly((value) => !value);
                setTab('songs');
              }}
              className={cn(
                'h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-colors shrink-0',
                favOnly
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white/5 text-zinc-300 border-white/10 hover:border-rose-500/40 hover:text-rose-300',
              )}
            >
              <Heart size={13} fill={favOnly ? 'currentColor' : 'none'} />
              Favorites {favoriteKeys.length ? `(${favoriteKeys.length})` : ''}
            </button>
          </div>

          {/* Active filter chips */}
          {isSongMode && activeFilterEntries.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilterEntries.map((entry) => (
                <button
                  key={entry.key}
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, [entry.key]: '' }))}
                  className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-[10px] font-bold text-rose-200 hover:bg-rose-500/20 transition-colors"
                >
                  <span className="text-rose-300/70 uppercase tracking-wide">{entry.label}</span>
                  <span>{entry.value}</span>
                  <X size={11} />
                </button>
              ))}
            </div>
          )}

          {/* Results heading */}
          <div className="flex items-end justify-between gap-4">
            <div className="text-left">
              <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase text-white">
                {headingLabel}
              </h2>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                {loading
                  ? 'Loading library…'
                  : favOnly
                    ? 'Songs you have saved'
                    : query
                      ? `${formatCount(totalResults)} results`
                      : `${formatCount(totalResults)} in library`}
              </p>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[4/5] rounded-3xl" />
              ))}
            </div>
          ) : loadError ? (
            <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-10 text-center space-y-2">
              <p className="text-sm font-bold text-white">Could not load the lyrics library</p>
              <p className="text-xs text-muted-foreground">{loadError}</p>
            </div>
          ) : pageResults.length ? (
            favOnly || isSongMode ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {(pageResults as LyricsSong[]).map(renderSongCard)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {(pageResults as LyricsEntity[]).map(renderEntityCard)}
              </div>
            )
          ) : (
            <div className="rounded-3xl border border-white/5 bg-card/30 p-16 text-center space-y-2">
              <p className="text-sm font-bold text-white">
                {favOnly ? 'No favorites yet' : 'No results found'}
              </p>
              <p className="text-xs text-muted-foreground">
                {favOnly
                  ? 'Tap the star on any song to save it here.'
                  : 'Try a different search or clear your filters.'}
              </p>
            </div>
          )}

          {/* Pager */}
          {!loading && !loadError && pages > 1 && pageResults.length > 0 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => goToPage(-1)}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 disabled:opacity-40 hover:border-rose-500/40 hover:text-rose-300 transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-[11px] font-bold text-muted-foreground">
                Page {page} of {pages}
              </span>
              <button
                type="button"
                onClick={() => goToPage(1)}
                disabled={page >= pages}
                className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 disabled:opacity-40 hover:border-rose-500/40 hover:text-rose-300 transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Lyrics modal */}
      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-2xl w-[94vw] max-h-[90vh] overflow-y-auto bg-zinc-950 border border-white/10 text-white rounded-3xl p-0 gap-0">
          {active && (
            <>
              <div className="relative">
                <div className="h-40 md:h-52 w-full overflow-hidden bg-zinc-900">
                  <Poster src={active.movie?.avatar} label={active.title} rounded="rounded-none" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-left">
                  <DialogTitle className="text-xl md:text-2xl font-black tracking-tight text-white">
                    {active.title}
                  </DialogTitle>
                  <p className="text-xs font-semibold text-rose-300/90 mt-1">
                    {[active.movie?.name, active.movie?.year].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>

              <div className="p-5 md:p-6 space-y-5 text-left">
                <div className="flex flex-wrap gap-2">
                  {active.singers?.length ? (
                    <CreditChip label="Singer" value={active.singers.slice(0, 3).join(', ')} />
                  ) : null}
                  {active.lyricist?.length ? (
                    <CreditChip label="Lyrics" value={active.lyricist.slice(0, 2).join(', ')} />
                  ) : null}
                  {active.music_director?.length ? (
                    <CreditChip label="Music" value={active.music_director.slice(0, 2).join(', ')} />
                  ) : null}
                </div>

                <div className="space-y-2 border-l-2 border-rose-500/30 pl-4">
                  {active.lyrics
                    ? activeLines.map((line, index) => (
                        <p
                          key={index}
                          className="text-sm md:text-[15px] leading-relaxed text-zinc-200"
                        >
                          {line}
                        </p>
                      ))
                    : <p className="text-sm text-muted-foreground">No lyrics available.</p>}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={copyLyrics}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-200 hover:border-rose-500/40 hover:text-rose-300 transition-colors"
                  >
                    <Copy size={14} /> Copy lyrics
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(active)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors border',
                      isFavorite(active)
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-white/5 text-zinc-200 border-white/10 hover:border-rose-500/40 hover:text-rose-300',
                    )}
                  >
                    <Star size={14} fill={isFavorite(active) ? 'currentColor' : 'none'} />
                    {isFavorite(active) ? 'Saved' : 'Save'}
                  </button>
                  {active.youtube_url && (
                    <a
                      href={active.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-200 hover:border-rose-500/40 hover:text-rose-300 transition-colors"
                    >
                      <Youtube size={14} /> YouTube
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSingOpen(true);
                      setSingIndex(0);
                    }}
                    disabled={!active.lyrics}
                    className="flex items-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-400 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-colors disabled:opacity-40 ml-auto"
                  >
                    <Play size={14} fill="currentColor" /> Sing along
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Sing along modal */}
      <Dialog
        open={singOpen}
        onOpenChange={(open) => setSingOpen(open)}
      >
        <DialogContent className="max-w-xl w-[94vw] max-h-[85vh] overflow-hidden bg-zinc-950 border border-white/10 text-white rounded-3xl p-0 gap-0 flex flex-col">
          {active && (
            <>
              <div className="p-5 md:p-6 border-b border-white/5 text-left">
                <DialogTitle className="text-lg font-black tracking-tight text-white">
                  Sing along
                </DialogTitle>
                <p className="text-xs font-semibold text-rose-300/90 mt-1">{active.title}</p>
              </div>
              <div className="px-5 md:px-6 py-6 bg-gradient-to-b from-rose-500/10 to-transparent">
                <p className="text-center text-xl md:text-3xl font-black leading-snug text-white min-h-[3.5rem] flex items-center justify-center">
                  {activeLines[singIndex] || '—'}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto px-5 md:px-6 py-4 space-y-1.5">
                {activeLines.map((line, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSingIndex(index)}
                    className={cn(
                      'block w-full text-left text-sm rounded-lg px-3 py-2 transition-colors',
                      index === singIndex
                        ? 'bg-rose-500/15 text-rose-200 font-bold'
                        : 'text-zinc-400 hover:bg-white/5',
                    )}
                  >
                    {line}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3 p-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setSingIndex((index) => Math.max(0, index - 1))}
                  disabled={singIndex <= 0}
                  className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 disabled:opacity-40 hover:border-rose-500/40 transition-colors"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <span className="text-[11px] font-bold text-muted-foreground">
                  {singIndex + 1} / {activeLines.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSingIndex((index) => Math.min(activeLines.length - 1, index + 1))
                  }
                  disabled={singIndex >= activeLines.length - 1}
                  className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 disabled:opacity-40 hover:border-rose-500/40 transition-colors"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Lyrics;

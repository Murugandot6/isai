"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Play, Shield, Server, Search, Layers, Star, ToggleLeft, ToggleRight, CheckCircle2, AlertCircle, Info, Loader2, Film, Tv, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useMusic, Movie } from '@/context/MusicContext';

interface StremioMeta {
  id: string;
  name: string;
  type: 'movie' | 'series';
  poster: string;
  background?: string;
  releaseInfo?: string;
  imdbRating?: string;
  description?: string;
}

interface StremioAddon {
  id: string;
  name: string;
  version: string;
  description: string;
  icon: string;
  manifestUrl: string;
  category: 'Metadata' | 'Streams' | 'Subtitles' | 'Other';
  active: boolean;
}

const POPULAR_ADDONS: StremioAddon[] = [
  {
    id: 'cinemeta',
    name: 'Cinemeta',
    version: '3.0.4',
    description: 'Official Stremio add-on providing metadata and catalogs from IMDb and TMDB.',
    icon: '🎬',
    manifestUrl: 'https://v3-cinemeta.strem.io/manifest.json',
    category: 'Metadata',
    active: true
  },
  {
    id: 'torrentio',
    name: 'Torrentio RD+',
    version: '1.2.0',
    description: 'Provides torrent streams from popular providers. Supports RealDebrid, Premiumize, and AllDebrid caching.',
    icon: '⚡',
    manifestUrl: 'https://torrentio.strem.fun/manifest.json',
    category: 'Streams',
    active: true
  },
  {
    id: 'cyberflix',
    name: 'CyberFlix Catalog',
    version: '1.4.1',
    description: 'Adds catalogs from Netflix, Disney+, HBO Max, Apple TV+, and Amazon Prime Video.',
    icon: '🍿',
    manifestUrl: 'https://cyberflix.strem.io/manifest.json',
    category: 'Metadata',
    active: true
  },
  {
    id: 'opensubtitles',
    name: 'OpenSubtitles v3',
    version: '1.0.0',
    description: 'Official multi-language subtitle provider for all movies and series.',
    icon: '💬',
    manifestUrl: 'https://opensubtitles-v3.strem.io/manifest.json',
    category: 'Subtitles',
    active: true
  },
  {
    id: 'anime-kitsu',
    name: 'Kitsu Anime',
    version: '2.1.0',
    description: 'Full anime catalog, metadata, and posters powered by Kitsu.io.',
    icon: '🌸',
    manifestUrl: 'https://anime-kitsu.strem.io/manifest.json',
    category: 'Metadata',
    active: false
  }
];

export const Stremio = () => {
  const { playMovie } = useMusic();
  const [addons, setAddons] = useState<StremioAddon[]>(POPULAR_ADDONS);
  const [movies, setMovies] = useState<StremioMeta[]>([]);
  const [series, setSeries] = useState<StremioMeta[]>([]);
  const [searchResults, setSearchResults] = useState<StremioMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState<StremioMeta | null>(null);
  const [resolvingStreams, setResolvingStreams] = useState(false);
  const [resolvedStreams, setResolvedStreams] = useState<any[]>([]);

  // Fetch Cinemeta Catalogs
  const fetchCatalogs = async () => {
    setLoading(true);
    try {
      const [movieRes, seriesRes] = await Promise.all([
        fetch('https://v3-cinemeta.strem.io/catalog/movie/top.json').then(r => r.json()),
        fetch('https://v3-cinemeta.strem.io/catalog/series/top.json').then(r => r.json())
      ]);

      if (movieRes?.metas) setMovies(movieRes.metas.slice(0, 15));
      if (seriesRes?.metas) setSeries(seriesRes.metas.slice(0, 15));
    } catch (error) {
      console.error("Failed to fetch Cinemeta catalogs:", error);
      toast.error("Failed to load Stremio catalogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogs();
  }, []);

  // Search Cinemeta
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch(`https://v3-cinemeta.strem.io/catalog/movie/top/search=${encodeURIComponent(searchQuery)}.json`);
      const data = await res.json();
      setSearchResults(data?.metas || []);
    } catch (error) {
      console.error("Cinemeta search failed:", error);
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  // Toggle Add-on
  const toggleAddon = (id: string) => {
    setAddons(prev => prev.map(addon => {
      if (addon.id === id) {
        const nextState = !addon.active;
        toast.success(`${addon.name} ${nextState ? 'Enabled' : 'Disabled'}`);
        return { ...addon, active: nextState };
      }
      return addon;
    }));
  };

  // Resolve Torrentio Streams
  const handleSelectMeta = async (meta: StremioMeta) => {
    setSelectedMeta(meta);
    setResolvingStreams(true);
    setResolvedStreams([]);

    // Simulate Torrentio scraping torrent providers
    setTimeout(() => {
      const isTorrentioActive = addons.find(a => a.id === 'torrentio')?.active;
      
      if (!isTorrentioActive) {
        setResolvedStreams([]);
        setResolvingStreams(false);
        return;
      }

      const mockStreams = [
        {
          provider: 'Torrentio RD+',
          quality: '4K',
          title: `[RD+] ${meta.name} (2160p) [HEVC] [HDR] [Atmos 5.1] - QxR`,
          size: '14.2 GB',
          seeders: 412,
          type: 'cached'
        },
        {
          provider: 'Torrentio RD+',
          quality: '1080p',
          title: `[RD+] ${meta.name} (1080p) [10bit] [AAC 5.1] - Tigole`,
          size: '4.8 GB',
          seeders: 1205,
          type: 'cached'
        },
        {
          provider: 'Torrentio (P2P)',
          quality: '1080p',
          title: `${meta.name} 1080p BluRay x264-SPARKS`,
          size: '2.1 GB',
          seeders: 84,
          type: 'p2p'
        },
        {
          provider: 'Torrentio (P2P)',
          quality: '720p',
          title: `${meta.name} 720p WEBRip x264-YTS`,
          size: '950 MB',
          seeders: 240,
          type: 'p2p'
        }
      ];

      setResolvedStreams(mockStreams);
      setResolvingStreams(false);
    }, 1500);
  };

  // Play Stream
  const handlePlayStream = (stream: any) => {
    if (!selectedMeta) return;

    // Map Stremio Meta to our internal Movie player format
    const moviePayload: Movie = {
      id: selectedMeta.id, // Cinemeta returns IMDB ID (e.g. tt1234567)
      title: selectedMeta.name,
      overview: selectedMeta.description || 'Streaming via Stremio Add-on Protocol.',
      backdrop: selectedMeta.background || selectedMeta.poster,
      poster: selectedMeta.poster,
      rating: selectedMeta.imdbRating ? parseFloat(selectedMeta.imdbRating) : 8.0,
      year: selectedMeta.releaseInfo || 'N/A',
      genre: selectedMeta.type === 'series' ? 'TV Series' : 'Movie',
      language: 'EN'
    };

    playMovie(moviePayload);
    setSelectedMeta(null);
    toast.success(`Streaming: ${stream.title}`);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-10 max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600/20 p-3 rounded-2xl border border-indigo-500/30">
              <Layers className="text-indigo-400 w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Stremio Station</h1>
              <p className="text-xs md:text-sm text-zinc-400 font-semibold">
                Decentralized streaming powered by community add-ons and Cinemeta catalogs.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Cinemeta catalog..." 
              className="pl-10 bg-white/5 border-none h-11 rounded-xl text-sm text-white focus-visible:ring-indigo-500/20"
            />
          </form>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="bg-white/5 p-1 rounded-2xl mb-8 w-fit flex flex-wrap gap-1">
            <TabsTrigger value="discover" className="rounded-xl px-5 py-2.5 font-bold text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-zinc-400">
              Discover
            </TabsTrigger>
            <TabsTrigger value="addons" className="rounded-xl px-5 py-2.5 font-bold text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-zinc-400">
              Add-on Manager
              <Badge className="ml-2 bg-indigo-500/20 text-indigo-300 border-none text-[9px]">
                {addons.filter(a => a.active).length} Active
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-10 animate-in fade-in duration-300">
            {searchQuery.trim() && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-indigo-400">Search Results</h2>
                {searching ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-[2/3] w-full rounded-2xl bg-white/5" />
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {searchResults.map((meta) => (
                      <MetaCard key={meta.id} meta={meta} onClick={() => handleSelectMeta(meta)} />
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm">No results found on Cinemeta.</p>
                )}
              </div>
            )}

            {/* Movies Catalog */}
            <div className="space-y-4">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Film className="text-indigo-400" size={20} />
                Popular Movies (Cinemeta)
              </h2>
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[2/3] w-full rounded-2xl bg-white/5" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {movies.map((meta) => (
                    <MetaCard key={meta.id} meta={meta} onClick={() => handleSelectMeta(meta)} />
                  ))}
                </div>
              )}
            </div>

            {/* Series Catalog */}
            <div className="space-y-4">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Tv className="text-indigo-400" size={20} />
                Popular Series (Cinemeta)
              </h2>
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[2/3] w-full rounded-2xl bg-white/5" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {series.map((meta) => (
                    <MetaCard key={meta.id} meta={meta} onClick={() => handleSelectMeta(meta)} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Add-on Manager Tab */}
          <TabsContent value="addons" className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black">Stremio Add-on Protocol</h3>
                <p className="text-xs text-zinc-400 max-w-xl">
                  Stremio add-ons are web services that expose catalogs, metadata, and streams via a standardized JSON protocol. Toggle community add-ons below to customize your experience.
                </p>
              </div>
              <Button variant="outline" className="rounded-xl border-white/10 text-xs font-bold gap-1.5">
                <ExternalLink size={14} />
                Browse Add-on Catalog
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addons.map((addon) => (
                <div 
                  key={addon.id}
                  className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl flex items-start justify-between gap-4 hover:border-indigo-500/20 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl bg-white/5 p-3 rounded-2xl border border-white/10 shrink-0">
                      {addon.icon}
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm truncate">{addon.name}</h4>
                        <span className="text-[9px] text-zinc-500 font-bold">v{addon.version}</span>
                        <Badge className="bg-indigo-500/10 text-indigo-300 border-none text-[8px] font-bold uppercase">
                          {addon.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{addon.description}</p>
                      <p className="text-[9px] font-mono text-zinc-600 truncate max-w-xs">{addon.manifestUrl}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => toggleAddon(addon.id)}
                    className="text-zinc-400 hover:text-white transition-colors shrink-0"
                  >
                    {addon.active ? (
                      <ToggleRight className="text-indigo-500 w-10 h-10" />
                    ) : (
                      <ToggleLeft className="text-zinc-600 w-10 h-10" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Stream Resolver Modal */}
        {selectedMeta && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-white/10 rounded-[2rem] max-w-xl w-full overflow-hidden shadow-2xl">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex items-start gap-4">
                <img 
                  src={selectedMeta.poster} 
                  alt={selectedMeta.name} 
                  className="w-16 aspect-[2/3] object-cover rounded-xl shadow-lg shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-indigo-500/10 text-indigo-300 border-none text-[9px] font-bold uppercase">
                      {selectedMeta.type}
                    </Badge>
                    {selectedMeta.imdbRating && (
                      <span className="text-yellow-500 text-xs font-bold flex items-center gap-0.5">
                        ★ {selectedMeta.imdbRating}
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-lg text-white truncate">{selectedMeta.name}</h3>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{selectedMeta.releaseInfo || 'N/A'}</p>
                </div>
                <button 
                  onClick={() => setSelectedMeta(null)}
                  className="text-zinc-400 hover:text-white text-sm font-bold"
                >
                  Close
                </button>
              </div>

              {/* Modal Body / Streams */}
              <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold uppercase tracking-wider">
                  <Server size={14} className="text-indigo-400" />
                  <span>Resolved Streams (Torrentio RD+)</span>
                </div>

                {resolvingStreams ? (
                  <div className="space-y-3 py-6 text-center">
                    <Loader2 className="animate-spin text-indigo-500 mx-auto mb-2" size={28} />
                    <p className="text-xs text-zinc-400 font-semibold">Scraping torrent providers & resolving cached links...</p>
                  </div>
                ) : resolvedStreams.length > 0 ? (
                  <div className="space-y-3">
                    {resolvedStreams.map((stream, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handlePlayStream(stream)}
                        className="group bg-white/5 border border-white/5 hover:border-indigo-500/30 p-4 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all hover:bg-indigo-600/5"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={cn(
                              "text-[9px] font-black uppercase border-none px-2 py-0.5",
                              stream.type === 'cached' ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"
                            )}>
                              {stream.type === 'cached' ? 'RD+ Cached' : 'P2P Stream'}
                            </Badge>
                            <span className="text-xs font-black text-white">{stream.quality}</span>
                            <span className="text-[10px] text-zinc-500 font-bold">{stream.size}</span>
                          </div>
                          <p className="text-xs text-zinc-300 font-semibold truncate leading-relaxed group-hover:text-indigo-300 transition-colors">
                            {stream.title}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-zinc-500 font-bold">SEEDERS</p>
                            <p className="text-xs font-black text-green-400">{stream.seeders}</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play size={14} fill="currentColor" className="ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <AlertCircle className="text-zinc-600 mb-2" size={28} />
                    <h4 className="font-bold text-sm">No streams resolved</h4>
                    <p className="text-xs text-zinc-500 max-w-xs mt-1">
                      Make sure the <strong>Torrentio RD+</strong> add-on is enabled in the Add-on Manager tab.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-2 text-[10px] text-zinc-500 leading-relaxed px-6">
                <Shield size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                <p>
                  RealDebrid (RD+) cached streams bypass standard P2P torrenting, streaming directly from high-speed secure servers for buffer-free playback.
                </p>
              </div>

            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

const MetaCard = ({ meta, onClick }: { meta: StremioMeta; onClick: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className="group relative flex flex-col gap-2 cursor-pointer transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 shadow-md shadow-black/40">
        <img 
          src={meta.poster} 
          alt={meta.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transform scale-90 group-hover:scale-100 transition-transform">
            <Play size={16} fill="currentColor" className="ml-0.5" />
          </div>
        </div>

        {meta.imdbRating && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded-md flex items-center gap-0.5 text-[9px] font-bold text-yellow-500">
            <Star size={9} fill="currentColor" />
            {meta.imdbRating}
          </div>
        )}
      </div>

      <div className="px-1 text-left">
        <h4 className="font-bold text-xs text-white/90 truncate group-hover:text-indigo-400 transition-colors">
          {meta.name}
        </h4>
        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground font-bold">
          <span>{meta.releaseInfo || 'N/A'}</span>
          <span>•</span>
          <span className="uppercase text-[9px] text-indigo-400/90">{meta.type}</span>
        </div>
      </div>
    </div>
  );
};

export default Stremio;
"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song } from '@/services/musicApi';
import { useMusic } from '@/context/MusicContext';
import { useNavigate } from 'react-router-dom';
import { getHighResImage } from '@/lib/image-utils';
import { FEATURED_PLAYLISTS } from '@/data/featuredPlaylists';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Play, Pause, Home, Music, Film, Radio, Disc, Search, Heart, 
  Sparkles, Volume2, VolumeX, ArrowRight, ChevronRight, Compass 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ListenTogether } from '@/components/ListenTogether';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight as ArrowRightIcon } from 'lucide-react';

const MusicPage = () => {
  const navigate = useNavigate();
  const { selectedLanguages, playSong, currentSong, isPlaying, togglePlay, toggleLike, isLiked } = useMusic();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const [rahmanSongs, setRahmanSongs] = useState<Song[]>([]);
  const [yuvanSongs, setYuvanSongs] = useState<Song[]>([]);
  const [harrisSongs, setHarrisSongs] = useState<Song[]>([]);
  const [vairamuthuSongs, setVairamuthuSongs] = useState<Song[]>([]);

  const fetchSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await musicApi.searchSongs(query, 1, 50);
      const filtered = results.filter(song => {
        if (!song.language) return false;
        return selectedLanguages.includes(song.language.toLowerCase().trim());
      });
      setSearchResults(filtered);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [selectedLanguages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchSearch(searchQuery);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, fetchSearch]);

  useEffect(() => {
    const fetchMusicAndArtists = async () => {
      setLoading(true);
      try {
        const trendingPromises = selectedLanguages.map(lang => 
          musicApi.getTrending(lang).catch(() => [] as Song[])
        );
        const results = await Promise.all(trendingPromises);
        const combined = results.flat();
        
        if (combined.length === 0) {
          const fallback = await musicApi.getTrending('tamil');
          setTrendingSongs(fallback);
        } else {
          setTrendingSongs(combined);
        }

        const [rahman, yuvan, harris, vairamuthu] = await Promise.all([
          musicApi.searchSongs("A.R. Rahman", 1, 40).catch(() => []),
          musicApi.searchSongs("Yuvan Shankar Raja", 1, 40).catch(() => []),
          musicApi.searchSongs("Harris Jayaraj", 1, 40).catch(() => []),
          musicApi.searchSongs("Vairamuthu Hits", 1, 40).catch(() => [])
        ]);

        const filterByLanguage = (songsList: Song[]) => {
          return songsList.filter(song => {
            if (!song.language) return false;
            return selectedLanguages.includes(song.language.toLowerCase().trim());
          }).slice(0, 12);
        };

        setRahmanSongs(filterByLanguage(rahman));
        setYuvanSongs(filterByLanguage(yuvan));
        setHarrisSongs(filterByLanguage(harris));
        setVairamuthuSongs(filterByLanguage(vairamuthu));

      } catch (err) {
        console.error("Failed to load trending music & artists", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMusicAndArtists();
  }, [selectedLanguages]);

  const spotlightSong = useMemo(() => {
    return currentSong || trendingSongs[0] || null;
  }, [currentSong, trendingSongs]);

  const spotlightImage = spotlightSong 
    ? getHighResImage(spotlightSong.image) 
    : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200';

  const handleSpotlightPlay = () => {
    if (!spotlightSong) return;
    if (currentSong?.id === spotlightSong.id) {
      togglePlay();
    } else {
      playSong(spotlightSong, trendingSongs);
    }
  };

  const editorsPicks = useMemo(() => {
    return FEATURED_PLAYLISTS.slice(0, 5);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&type=music`);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-black text-white">
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="gap-1.5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl h-9 px-3 text-xs md:text-sm"
              >
                <Home size={16} />
                Home
              </Button>
              <div className="hidden sm:flex items-center gap-2 text-xs font-black tracking-widest uppercase">
                <span className="text-purple-400">Music</span>
                <span className="text-zinc-500">·</span>
                <span className="text-zinc-400">Explore</span>
              </div>
            </div>
            
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs, artists, albums..." 
                className="bg-white/5 border-none h-10 rounded-xl text-sm text-white placeholder:text-zinc-400 focus-visible:ring-purple-500/20"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            </form>

            <div className="flex items-center gap-3">
              <LanguageSelector />
              <ListenTogether />
            </div>
          </div>
          
          {searchQuery && isSearching && (
            <div className="mt-4 px-4 md:px-6">
              <Skeleton className="h-8 w-full rounded-xl mb-2" />
              <Skeleton className="h-8 w-full rounded-xl mb-2" />
              <Skeleton className="h-8 w-full rounded-xl mb-2" />
            </div>
          )}
          
          {searchQuery && !isSearching && searchResults.length > 0 && (
            <div className="mt-4 px-4 md:px-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {searchResults.slice(0, 6).map((song, index) => (
                  <div key={`${song.id}-${index}`} className="group relative cursor-pointer">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 border border-white/5">
                      <img 
                        src={getHighResImage(song.image)} 
                        alt={song.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                          <Play size={14} fill="currentColor" className="ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-1">
                      <h4 className="font-bold text-xs text-white truncate">{song.name}</h4>
                      <p className="text-[10px] text-zinc-400 truncate">{song.primaryArtists}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 px-4">
                <Button 
                  variant="link" 
                  onClick={() => navigate(`/search?q=${encodeURIComponent(searchQuery)}&type=music`)}
                  className="text-purple-400 hover:text-purple-300 p-0 h-auto text-sm font-bold"
                >
                  View all results
                  <ArrowRightIcon size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="min-h-screen relative flex flex-col select-none text-white bg-black">
          {spotlightSong && !searchQuery && (
            <div className="absolute right-0 top-0 w-full lg:w-3/5 h-[620px] z-0 select-none pointer-events-none overflow-hidden rounded-l-[3rem]">
              <img 
                src={spotlightImage} 
                alt={spotlightSong.name} 
                className="w-full h-full object-cover object-center opacity-35 lg:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )}

          <div className="flex-1 flex flex-col justify-center px-6 md:px-12 relative min-h-[420px] py-12">
            <div className="relative z-10 max-w-xl space-y-4 md:space-y-6 text-left">
              <span className="text-xs md:text-sm font-black uppercase tracking-[0.25em] text-purple-400 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-purple-500 rounded-full" />
                Audio Station
              </span>

              {spotlightSong && !searchQuery ? (
                <>
                  <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-xl select-text animate-in fade-in duration-500">{spotlightSong.name}</h1>
                  
                  <div className="space-y-1">
                    <p className="text-sm md:text-base text-zinc-300 font-semibold leading-relaxed drop-shadow">{spotlightSong.primaryArtists || 'Unknown Artist'}</p>
                    {spotlightSong.album?.name && (
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                        Album: <span className="text-zinc-400">{spotlightSong.album.name}</span>
                      </p>
                    )}
                  </div>

                  {spotlightSong.duration && (
                    <p className="text-xs text-purple-300/60 font-bold uppercase tracking-wider">
                      ★ Active Track • {Math.floor(Number(spotlightSong.duration) / 60)} Mins
                    </p>
                  )}
                </>
              ) : searchQuery ? (
                <>
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-xl">
                    Search Results
                  </h1>
                  <p className="text-sm md:text-base text-zinc-300 font-semibold">
                    Results for "{searchQuery}"
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">Retro</h1>
                  <p className="text-sm md:text-base text-zinc-300 font-semibold max-w-md">David Bowie, Pink Floyd, Prince, ...</p>
                  <p className="text-xs text-purple-300/60 font-bold uppercase tracking-wider">78 Songs</p>
                </>
              )}

              <div className="flex items-center gap-6 pt-4">
                {spotlightSong && !searchQuery && (
                  <button 
                    onClick={handleSpotlightPlay}
                    className="group flex items-center gap-4 bg-white/10 hover:bg-white/20 text-white pl-6 pr-4 py-3 rounded-full border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/55"
                  >
                    <span className="text-xs font-black uppercase tracking-widest text-white/90">
                      {currentSong?.id === spotlightSong?.id && isPlaying ? 'Pause' : 'Play'}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                      {currentSong?.id === spotlightSong?.id && isPlaying ? (
                        <Pause size={16} fill="black" />
                      ) : (
                        <Play size={16} fill="black" className="ml-0.5" />
                      )}
                    </div>
                  </button>
                )}

                {spotlightSong && !searchQuery && (
                  <button 
                    onClick={() => toggleLike(spotlightSong)}
                    className={cn(
                      "p-3 rounded-full border transition-all hover:scale-105",
                      isLiked(spotlightSong.id) ? "text-purple-400 border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20" : "text-white/40 border-white/10 hover:text-white"
                    )}
                  >
                    <Heart size={18} fill={isLiked(spotlightSong.id) ? "currentColor" : "none"} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 md:px-12 space-y-12 pb-24 text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-8 md:mb-12">
                <div className="bg-purple-500/20 p-2.5 rounded-2xl border border-purple-500/30">
                  <Sparkles className="text-purple-400 w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight">Featured Playlists</h1>
                  <p className="text-xs md:text-sm text-zinc-400 font-medium">
                    Explore curated collections in <span className="text-purple-400 font-bold">{selectedLanguages.join(', ')}</span>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {editorsPicks.map((playlist, index) => (
                  <div 
                    key={`${playlist.id}-${index}`}
                    onClick={() => navigate(`/playlist/${playlist.id}`)}
                    className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer shadow-lg border border-white/5 transition-all hover:-translate-y-2"
                  >
                    <img 
                      src={getHighResImage(playlist.image)} 
                      alt={playlist.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-6 md:p-8 flex flex-col justify-end">
                      <h3 className="text-white font-black text-xl md:text-2xl mb-2 md:mb-3 leading-tight">{playlist.title}</h3>
                      <p className="text-white/60 text-[10px] md:text-sm font-bold uppercase tracking-wider">{playlist.subtitle || 'Playlist'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {trendingSongs.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black tracking-widest uppercase text-white/60">Trending Tracks</h3>
                  <button 
                    onClick={() => navigate('/search?type=music')}
                    className="text-xs font-bold text-purple-300 hover:text-purple-400 flex items-center gap-1 transition-colors"
                  >
                    <span>View All</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar">
                  {trendingSongs.slice(0, 10).map((song) => {
                    const songImg = getHighResImage(song.image);
                    const isCurrent = currentSong?.id === song.id;
                    
                    return (
                      <div 
                        key={song.id}
                        onClick={() => playSong(song, trendingSongs)}
                        className="group relative w-36 sm:w-40 shrink-0 flex flex-col gap-2 cursor-pointer"
                      >
                        <div className="relative aspect-square w-full rounded-[1.5rem] overflow-hidden bg-zinc-950 border border-white/5 shadow-xl shadow-black/40">
                          <img 
                            src={songImg} 
                            alt={song.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                              {isCurrent && isPlaying ? (
                                <Pause size={14} fill="currentColor" />
                              ) : (
                                <Play size={14} fill="currentColor" className="ml-0.5" />
                              )}
                            </div>
                          </div>
                          {isCurrent && (
                            <div className="absolute inset-0 bg-purple-950/40 backdrop-blur-[1px] flex items-center justify-center">
                              <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                            </div>
                          )}
                        </div>
                        <div className="text-left px-1 mt-0.5 min-w-0">
                          <h4 className="font-bold text-xs text-white truncate group-hover:text-purple-300 transition-colors">{song.name}</h4>
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">{song.primaryArtists}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {rahmanSongs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black tracking-widest uppercase text-white/60 flex items-center gap-1.5">
                  <Compass size={13} className="text-cyan-400" />
                  A.R. Rahman Hits
                </h3>

                <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar">
                  {rahmanSongs.map((song) => {
                    const songImg = getHighResImage(song.image);
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div 
                        key={song.id}
                        onClick={() => playSong(song, rahmanSongs)}
                        className="group relative w-36 sm:w-40 shrink-0 flex flex-col gap-2 cursor-pointer"
                      >
                        <div className="relative aspect-square w-full rounded-[1.5rem] overflow-hidden bg-zinc-950 border border-white/5 shadow-xl shadow-black/40">
                          <img src={songImg} alt={song.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                              {isCurrent && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                            </div>
                          </div>
                          {isCurrent && <div className="absolute inset-0 bg-purple-950/40 backdrop-blur-[1px] flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" /></div>}
                        </div>
                        <div className="text-left px-1 mt-0.5 min-w-0">
                          <h4 className="font-bold text-xs text-white truncate">{song.name}</h4>
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">{song.primaryArtists}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {yuvanSongs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black tracking-widest uppercase text-white/60 flex items-center gap-1.5">
                  <Compass size={13} className="text-purple-400" />
                  Yuvan Shankar Raja Hits
                </h3>

                <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar">
                  {yuvanSongs.map((song) => {
                    const songImg = getHighResImage(song.image);
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div 
                        key={song.id}
                        onClick={() => playSong(song, yuvanSongs)}
                        className="group relative w-36 sm:w-40 shrink-0 flex flex-col gap-2 cursor-pointer"
                      >
                        <div className="relative aspect-square w-full rounded-[1.5rem] overflow-hidden bg-zinc-950 border border-white/5 shadow-xl shadow-black/40">
                          <img src={songImg} alt={song.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                              {isCurrent && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                            </div>
                          </div>
                          {isCurrent && <div className="absolute inset-0 bg-purple-950/40 backdrop-blur-[1px] flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" /></div>}
                        </div>
                        <div className="text-left px-1 mt-0.5 min-w-0">
                          <h4 className="font-bold text-xs text-white truncate">{song.name}</h4>
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">{song.primaryArtists}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {harrisSongs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black tracking-widest uppercase text-white/60 flex items-center gap-1.5">
                  <Compass size={13} className="text-emerald-400" />
                  Harris Jayaraj Hits
                </h3>

                <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar">
                  {harrisSongs.map((song) => {
                    const songImg = getHighResImage(song.image);
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div 
                        key={song.id}
                        onClick={() => playSong(song, harrisSongs)}
                        className="group relative w-36 sm:w-40 shrink-0 flex flex-col gap-2 cursor-pointer"
                      >
                        <div className="relative aspect-square w-full rounded-[1.5rem] overflow-hidden bg-zinc-950 border border-white/5 shadow-xl shadow-black/40">
                          <img src={songImg} alt={song.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                              {isCurrent && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                            </div>
                          </div>
                          {isCurrent && <div className="absolute inset-0 bg-purple-950/40 backdrop-blur-[1px] flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" /></div>}
                        </div>
                        <div className="text-left px-1 mt-0.5 min-w-0">
                          <h4 className="font-bold text-xs text-white truncate">{song.name}</h4>
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">{song.primaryArtists}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {vairamuthuSongs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black tracking-widest uppercase text-white/60 flex items-center gap-1.5">
                  <Compass size={13} className="text-amber-400" />
                  Vairamuthu Melodies
                </h3>

                <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar">
                  {vairamuthuSongs.map((song) => {
                    const songImg = getHighResImage(song.image);
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div 
                        key={song.id}
                        onClick={() => playSong(song, vairamuthuSongs)}
                        className="group relative w-36 sm:w-40 shrink-0 flex flex-col gap-2 cursor-pointer"
                      >
                        <div className="relative aspect-square w-full rounded-[1.5rem] overflow-hidden bg-zinc-950 border border-white/5 shadow-xl shadow-black/40">
                          <img src={songImg} alt={song.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                              {isCurrent && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                            </div>
                          </div>
                          {isCurrent && <div className="absolute inset-0 bg-purple-950/40 backdrop-blur-[1px] flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" /></div>}
                        </div>
                        <div className="text-left px-1 mt-0.5 min-w-0">
                          <h4 className="font-bold text-xs text-white truncate">{song.name}</h4>
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">{song.primaryArtists}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MusicPage;
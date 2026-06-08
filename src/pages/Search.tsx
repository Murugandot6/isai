"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song, Album } from '@/services/musicApi';
import { tmdbApi } from '@/services/tmdbApi';
import { radioApi, RadioStation } from '@/services/radioApi';
import { SongCard } from '@/components/SongCard';
import { AlbumCard } from '@/components/AlbumCard';
import { Search as SearchIcon, Loader2, Music, Disc, Film, Radio, Play, Pause, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMusic, Movie } from '@/context/MusicContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const urlType = (searchParams.get('type') as 'music' | 'movies' | 'fm') || 'music';
  const { selectedLanguages, playSong, playMovie, currentSong, isPlaying, toggleLikeStation, isStationLiked } = useMusic();
  
  const [query, setQuery] = useState(urlQuery);
  const [searchType, setSearchType] = useState<'music' | 'movies' | 'fm'>(urlType);
  
  const [songResults, setSongResults] = useState<Song[]>([]);
  const [albumResults, setAlbumResults] = useState<Album[]>([]);
  const [movieResults, setMovieResults] = useState<Movie[]>([]);
  const [fmResults, setFmResults] = useState<RadioStation[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('songs');

  const performSearch = useCallback(async (searchQuery: string, type: 'music' | 'movies' | 'fm') => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      if (type === 'music') {
        const [songs, albums] = await Promise.all([
          musicApi.searchSongs(searchQuery, 1, 50),
          musicApi.searchAlbums(searchQuery, 1, 50)
        ]);
        setSongResults(songs);
        setAlbumResults(albums);
        setMovieResults([]);
        setFmResults([]);
      } else if (type === 'movies') {
        const movies = await tmdbApi.searchMovies(searchQuery);
        setMovieResults(movies);
        setSongResults([]);
        setAlbumResults([]);
        setFmResults([]);
      } else if (type === 'fm') {
        const stations = await radioApi.searchStations(searchQuery);
        setFmResults(stations);
        setSongResults([]);
        setAlbumResults([]);
        setMovieResults([]);
      }
    } catch (error) {
      console.error('Search failed', error);
      setSongResults([]);
      setAlbumResults([]);
      setMovieResults([]);
      setFmResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (urlQuery) {
      setQuery(urlQuery);
      setSearchType(urlType);
      performSearch(urlQuery, urlType);
    }
  }, [urlQuery, urlType, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query, type: searchType });
  };

  const handlePlayStation = (station: RadioStation) => {
    const radioSong = {
      id: station.stationuuid,
      name: station.name,
      type: 'radio',
      primaryArtists: station.tags || 'Live FM',
      image: [{ link: station.favicon || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=200' }],
      downloadUrl: [{ link: station.url_resolved }],
      language: station.language,
      album: { id: 'radio', name: 'Live Radio', url: '' },
      year: '',
      duration: 0
    };
    playSong(radioSong as any);
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-black mb-6 md:mb-8 tracking-tight text-center">Find Your Sound</h1>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchType === 'music' ? "Songs or albums..." : searchType === 'movies' ? "Movies or genres..." : "FM stations..."} 
                className="pl-11 pr-4 py-6 bg-accent/5 border-2 border-transparent focus-visible:ring-0 focus-visible:border-primary/20 rounded-2xl text-sm md:text-base transition-all h-12 md:h-14"
              />
            </div>
            
            <div className="flex gap-2 shrink-0">
              <Select 
                value={searchType} 
                onValueChange={(val: 'music' | 'movies' | 'fm') => {
                  setSearchType(val);
                  if (query.trim()) {
                    setSearchParams({ q: query, type: val });
                  }
                }}
              >
                <SelectTrigger className="w-[120px] sm:w-[140px] h-12 md:h-14 rounded-2xl bg-accent/5 border-none font-bold text-xs md:text-sm focus:ring-0">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  <SelectItem value="music" className="font-bold text-xs cursor-pointer">Music</SelectItem>
                  <SelectItem value="movies" className="font-bold text-xs cursor-pointer">Movies</SelectItem>
                  <SelectItem value="fm" className="font-bold text-xs cursor-pointer">FM Radio</SelectItem>
                </SelectContent>
              </Select>

              <button 
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground px-6 h-12 md:h-14 rounded-2xl font-bold text-xs md:text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <SearchIcon size={16} />}
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ) : searchType === 'music' && (songResults.length > 0 || albumResults.length > 0) ? (
          <Tabs defaultValue="songs" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-accent/5 p-1 rounded-2xl mb-6 md:mb-8 w-fit">
              <TabsTrigger value="songs" className="rounded-xl px-4 md:px-6 py-2 font-bold gap-1.5 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-white">
                <Music size={16} />
                Songs
                <span className="ml-1 text-[9px] md:text-[10px] bg-white/20 px-1.5 rounded-full">{songResults.length}</span>
              </TabsTrigger>
              <TabsTrigger value="albums" className="rounded-xl px-4 md:px-6 py-2 font-bold gap-1.5 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-white">
                <Disc size={16} />
                Albums
                <span className="ml-1 text-[9px] md:text-[10px] bg-white/20 px-1.5 rounded-full">{albumResults.length}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="songs" className="animate-in fade-in duration-500">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {songResults.map((song) => (
                  <SongCard key={song.id} song={song} allSongs={songResults} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="albums" className="animate-in fade-in duration-500">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {albumResults.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : searchType === 'movies' && movieResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-in fade-in duration-500">
            {movieResults.map((movie) => (
              <div 
                key={movie.id}
                className="group relative bg-card/40 border border-border/50 rounded-3xl overflow-hidden hover:border-primary/30 transition-all duration-500 hover:-translate-y-1.5 flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-accent/10">
                  <img 
                    src={movie.backdrop || movie.poster} 
                    alt={movie.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = movie.poster;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button 
                      onClick={() => playMovie(movie)}
                      className="rounded-full w-12 h-12 bg-primary text-white shadow-xl shadow-primary/30 hover:scale-110 transition-transform"
                    >
                      <Play size={20} fill="currentColor" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[8px] font-bold uppercase">
                        {movie.language}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-bold">{movie.year}</span>
                    </div>
                    <h3 className="text-base md:text-xl font-black tracking-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">{movie.title}</h3>
                    <p className="text-[11px] md:text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">{movie.overview}</p>
                  </div>

                  <Button 
                    onClick={() => playMovie(movie)}
                    className="w-full rounded-xl font-bold gap-1.5 h-10 bg-accent/10 hover:bg-primary hover:text-white text-foreground transition-all text-xs"
                  >
                    <Play size={14} fill="currentColor" />
                    Watch Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : searchType === 'fm' && fmResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 animate-in fade-in duration-500">
            {fmResults.map((station) => {
              const isActive = currentSong?.id === station.stationuuid;
              const liked = isStationLiked(station.stationuuid);
              return (
                <div 
                  key={station.stationuuid}
                  className={cn(
                    "flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl border transition-all duration-300 group relative",
                    isActive 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-card/50 border-transparent hover:border-accent/20 hover:bg-accent/5"
                  )}
                >
                  <div 
                    onClick={() => handlePlayStation(station)}
                    className="relative w-12 h-12 md:w-14 md:h-14 shrink-0 overflow-hidden rounded-xl bg-accent/10 cursor-pointer"
                  >
                    <img 
                      src={station.favicon || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=200'} 
                      alt={station.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=200' }}
                    />
                    <div className={cn(
                      "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                      {isActive && isPlaying ? <Pause size={16} fill="currentColor" className="text-white" /> : <Play size={16} fill="currentColor" className="text-white" />}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => handlePlayStation(station)}>
                    <h3 className="font-bold text-xs md:text-sm truncate">{station.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-accent/10 text-[8px] font-bold px-1.5 py-0">
                        {station.votes.toLocaleString()} VOTES
                      </Badge>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLikeStation(station);
                    }}
                    className={cn(
                      "p-2 rounded-full transition-all shrink-0",
                      liked ? "text-primary" : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    <Heart size={16} fill={liked ? "currentColor" : "none"} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : !loading && (
          <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center animate-in slide-in-from-top-4 duration-500">
            <div className="bg-accent/5 p-6 md:p-8 rounded-full mb-4 md:mb-6">
              {searchType === 'music' ? <Music size={40} className="text-muted-foreground/30" /> : searchType === 'movies' ? <Film size={40} className="text-muted-foreground/30" /> : <Radio size={40} className="text-muted-foreground/30" />}
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2">
              {urlQuery ? `No results found for "${urlQuery}"` : "Start Exploring"}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xs">
              {urlQuery ? "Try searching for a different title or check back later." : "Search for your favorite tracks, movies, or FM stations instantly."}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Search;
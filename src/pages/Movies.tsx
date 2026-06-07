"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useMusic, Movie } from '@/context/MusicContext';
import { tmdbApi, CastMember } from '@/services/tmdbApi';
import { stremioApi, StremioStream } from '@/services/stremio';
import { StreamPlayer } from '@/components/StreamPlayer';
import { Play, Film, Star, Search, Tv, X, Users, Info, Loader2, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Movies = () => {
  const { currentMovie, playMovie, closeMovie, roomCode } = useMusic();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Stream & Cast States
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [stremioStreams, setStremioStreams] = useState<StremioStream[]>([]);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [loadingCast, setLoadingCast] = useState(false);

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      const trending = await tmdbApi.getTrendingMovies();
      if (trending.length > 0) {
        setMovies(trending);
      } else {
        const popular = await tmdbApi.getPopularMovies();
        setMovies(popular);
      }
      setLoading(false);
    };
    loadMovies();
  }, []);

  // Fetch IMDB ID, Stremio Streams, and Cast when currentMovie changes
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!currentMovie) {
        setImdbId(null);
        setStremioStreams([]);
        setCast([]);
        return;
      }

      setLoadingCast(true);
      setLoadingStreams(true);

      try {
        // 1. Fetch IMDB ID and Cast concurrently
        const [fetchedImdbId, credits] = await Promise.all([
          tmdbApi.getMovieImdbId(currentMovie.id),
          tmdbApi.getMovieCredits(currentMovie.id)
        ]);

        setImdbId(fetchedImdbId);
        setCast(credits);

        // 2. Fetch Stremio streams if IMDB ID is available
        if (fetchedImdbId) {
          const streams = await stremioApi.getStreams(fetchedImdbId);
          setStremioStreams(streams);
        } else {
          setStremioStreams([]);
        }
      } catch (error) {
        console.error("Failed to load movie details:", error);
      } finally {
        setLoadingCast(false);
        setLoadingStreams(false);
      }
    };

    fetchMovieDetails();
  }, [currentMovie]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setLoading(true);
      const trending = await tmdbApi.getTrendingMovies();
      setMovies(trending);
      setLoading(false);
      return;
    }

    setLoading(true);
    const results = await tmdbApi.searchMovies(searchQuery);
    setMovies(results);
    setLoading(false);
  };

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/20 p-2 rounded-xl">
                <Film className="text-primary" size={24} />
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">CINEMA</Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tight">isai Cinema</h1>
            <p className="text-muted-foreground font-medium">Watch blockbusters together in real-time sync.</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies or genres..." 
              className="pl-10 bg-accent/5 border-none h-11 rounded-xl focus-visible:ring-primary/20"
            />
          </form>
        </div>

        {/* Theater Mode Player Overlay */}
        {currentMovie && (
          <div className="fixed inset-0 bg-black/95 z-50 flex flex-col animate-in fade-in duration-300 overflow-y-auto">
            {/* Player Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-black sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Tv className="text-primary" size={24} />
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    {currentMovie.title}
                    <span className="text-xs text-muted-foreground font-normal">({currentMovie.year})</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">{currentMovie.genre}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {roomCode && (
                  <Badge className="bg-green-500 text-white gap-1.5 py-1 px-3 rounded-full font-bold text-xs animate-pulse">
                    <Users size={12} />
                    Synced Room: {roomCode}
                  </Badge>
                )}

                <button 
                  onClick={() => closeMovie()}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Premium Stream Player Component */}
            <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
              <StreamPlayer 
                movie={currentMovie}
                imdbId={imdbId}
                stremioStreams={stremioStreams}
                loadingStreams={loadingStreams}
              />
            </div>

            {/* Player Footer / Info & Cast */}
            <div className="p-6 md:p-8 bg-zinc-950 border-t border-white/10 text-white flex-1">
              <div className="max-w-5xl mx-auto space-y-8">
                {/* Sync Notice */}
                {roomCode && (
                  <div className="flex gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 text-sm text-primary-foreground">
                    <Users size={20} className="text-primary shrink-0" />
                    <p className="leading-relaxed">
                      <strong>Social Sync Active:</strong> The movie has been opened for everyone in the room! If you are using a Direct Torrent Stream, playback controls are fully synchronized. If using an Embed Server, please click play on your screen to start watching together.
                    </p>
                  </div>
                )}

                {/* Overview */}
                <div className="flex gap-4 items-start">
                  <Info size={20} className="text-primary shrink-0 mt-1" />
                  <div>
                    <p className="text-base text-zinc-300 leading-relaxed">{currentMovie.overview}</p>
                    <div className="flex gap-4 mt-3 text-xs text-zinc-500 font-bold">
                      <span>RATING: {currentMovie.rating} ★</span>
                      <span>LANGUAGE: {currentMovie.language.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Cast / Actors Section */}
                <div className="border-t border-white/5 pt-8">
                  <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                    <User size={18} className="text-primary" />
                    Cast & Actors
                  </h3>
                  
                  {loadingCast ? (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="w-24 shrink-0 space-y-2">
                          <Skeleton className="w-24 h-24 rounded-full bg-white/5" />
                          <Skeleton className="h-3 w-20 bg-white/5" />
                        </div>
                      ))}
                    </div>
                  ) : cast.length > 0 ? (
                    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10">
                      {cast.map((actor) => (
                        <div key={actor.id} className="w-24 shrink-0 text-center group">
                          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-zinc-800 mb-3 border-2 border-transparent group-hover:border-primary transition-all">
                            {actor.profile_path ? (
                              <img 
                                src={actor.profile_path} 
                                alt={actor.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                <User size={24} />
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-bold truncate text-zinc-200">{actor.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5">{actor.character}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">No cast information available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Curated Movies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[16/10] w-full rounded-3xl" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {movies.map((movie) => (
              <div 
                key={movie.id}
                className="group relative bg-card/40 border border-border/50 rounded-3xl overflow-hidden hover:border-primary/30 transition-all duration-500 hover:-translate-y-1.5 flex flex-col"
              >
                {/* Backdrop Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-accent/10">
                  <img 
                    src={movie.backdrop} 
                    alt={movie.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = movie.poster;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button 
                      onClick={() => playMovie(movie)}
                      className="rounded-full w-14 h-14 bg-primary text-white shadow-xl shadow-primary/30 hover:scale-110 transition-transform"
                    >
                      <Play size={24} fill="currentColor" />
                    </Button>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1 text-xs font-bold text-yellow-500">
                    <Star size={12} fill="currentColor" />
                    {movie.rating}
                  </div>
                </div>

                {/* Movie Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-bold uppercase">
                        {movie.language}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-bold">{movie.year}</span>
                    </div>
                    <h3 className="text-xl font-black tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-1">{movie.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">{movie.overview}</p>
                  </div>

                  <Button 
                    onClick={() => playMovie(movie)}
                    className="w-full rounded-xl font-bold gap-2 h-11 bg-accent/10 hover:bg-primary hover:text-white text-foreground transition-all"
                  >
                    <Play size={16} fill="currentColor" />
                    Watch Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Film size={48} className="text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold">No movies found</h3>
            <p className="text-muted-foreground max-w-xs">Try searching for another title or check back later.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Movies;
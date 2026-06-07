"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useMusic, Movie } from '@/context/MusicContext';
import { tmdbApi, CastMember } from '@/services/tmdbApi';
import { StreamPlayer } from '@/components/StreamPlayer';
import { MovieHero } from '@/components/MovieHero';
import { MovieRow } from '@/components/MovieRow';
import { Play, Film, Star, Search, Tv, X, Users, Info, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Movies = () => {
  const { currentMovie, playMovie, closeMovie, roomCode } = useMusic();
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  
  // Cast States
  const [cast, setCast] = useState<CastMember[]>([]);
  const [loadingCast, setLoadingCast] = useState(false);

  useEffect(() => {
    const loadAllMovies = async () => {
      setLoading(true);
      try {
        const [trending, popular, topRated, upcoming] = await Promise.all([
          tmdbApi.getTrendingMovies(),
          tmdbApi.getPopularMovies(),
          tmdbApi.getTopRatedMovies(),
          tmdbApi.getUpcomingMovies()
        ]);

        setTrendingMovies(trending);
        setPopularMovies(popular);
        setTopRatedMovies(topRated);
        setUpcomingMovies(upcoming);
      } catch (error) {
        console.error("Failed to load movies:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAllMovies();
  }, []);

  // Fetch Cast when currentMovie changes
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!currentMovie) {
        setCast([]);
        return;
      }

      setLoadingCast(true);

      try {
        const credits = await tmdbApi.getMovieCredits(currentMovie.id);
        setCast(credits);
      } catch (error) {
        console.error("Failed to load movie details:", error);
      } finally {
        setLoadingCast(false);
      }
    };

    fetchMovieDetails();
  }, [currentMovie]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearching(false);
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const results = await tmdbApi.searchMovies(searchQuery);
    setSearchResults(results);
  };

  // Spotlight movie is the first trending movie
  const spotlightMovie = trendingMovies[0];

  return (
    <MainLayout>
      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/20 p-2 rounded-xl">
                <Film className="text-primary" size={20} />
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold">CINEMA</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">anbae Cinema</h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Watch blockbusters together in real-time sync.</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value.trim()) {
                  setSearching(false);
                  setSearchResults([]);
                }
              }}
              placeholder="Search movies or genres..." 
              className="pl-9 bg-accent/5 border-none h-10 rounded-xl focus-visible:ring-primary/20 text-sm"
            />
          </form>
        </div>

        {/* Theater Mode Player Overlay */}
        {currentMovie && (
          <div className="fixed inset-0 bg-black/95 z-50 flex flex-col animate-in fade-in duration-300 overflow-y-auto">
            {/* Player Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-black sticky top-0 z-10 gap-4">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <Tv className="text-primary shrink-0 w-5 h-5 md:w-6 md:h-6" />
                <div className="min-w-0">
                  <h2 className="text-sm md:text-lg font-black text-white flex items-center gap-1.5 truncate">
                    {currentMovie.title}
                    <span className="text-[10px] md:text-xs text-muted-foreground font-normal shrink-0">({currentMovie.year})</span>
                  </h2>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">{currentMovie.genre}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                {roomCode && (
                  <Badge className="bg-green-500 text-white gap-1 py-0.5 px-2 md:px-3 rounded-full font-bold text-[9px] md:text-xs animate-pulse hidden sm:flex">
                    <Users size={10} />
                    Synced Room: {roomCode}
                  </Badge>
                )}

                <button 
                  onClick={() => closeMovie()}
                  className="p-1.5 md:p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            {/* Premium Stream Player Component */}
            <div className="p-2 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">
              <StreamPlayer movie={currentMovie} />
            </div>

            {/* Player Footer / Info & Cast */}
            <div className="p-4 md:p-8 bg-zinc-950 border-t border-white/10 text-white flex-1">
              <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
                {/* Sync Notice */}
                {roomCode && (
                  <div className="flex gap-2.5 p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs md:text-sm text-primary-foreground">
                    <Users size={18} className="text-primary shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Social Sync Active:</strong> The movie has been opened for everyone in the room! Please click play on your screen to start watching together.
                    </p>
                  </div>
                )}

                {/* Overview */}
                <div className="flex gap-3 md:gap-4 items-start">
                  <Info size={18} className="text-primary shrink-0 mt-1" />
                  <div>
                    <p className="text-xs md:text-base text-zinc-300 leading-relaxed">{currentMovie.overview}</p>
                    <div className="flex gap-3 mt-2.5 text-[10px] md:text-xs text-zinc-500 font-bold">
                      <span>RATING: {currentMovie.rating} ★</span>
                      <span>LANGUAGE: {currentMovie.language.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Cast / Actors Section */}
                <div className="border-t border-white/5 pt-6 md:pt-8">
                  <h3 className="text-sm md:text-lg font-black mb-4 md:mb-6 flex items-center gap-2">
                    <User size={16} className="text-primary" />
                    Cast & Actors
                  </h3>
                  
                  {loadingCast ? (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="w-20 shrink-0 space-y-2">
                          <Skeleton className="w-16 h-16 rounded-full bg-white/5" />
                          <Skeleton className="h-3 w-16 bg-white/5" />
                        </div>
                      ))}
                    </div>
                  ) : cast.length > 0 ? (
                    <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10">
                      {cast.map((actor) => (
                        <div key={actor.id} className="w-20 md:w-24 shrink-0 text-center group">
                          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full overflow-hidden bg-zinc-800 mb-2 md:mb-3 border-2 border-transparent group-hover:border-primary transition-all">
                            {actor.profile_path ? (
                              <img 
                                src={actor.profile_path} 
                                alt={actor.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                <User size={20} />
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] md:text-xs font-bold truncate text-zinc-200">{actor.name}</p>
                          <p className="text-[9px] md:text-[10px] text-zinc-500 truncate mt-0.5">{actor.character}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">No cast information available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Results View */}
        {searching ? (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-black text-white">Search Results</h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {searchResults.map((movie) => (
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

                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                        <Star size={10} fill="currentColor" />
                        {movie.rating}
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
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Film size={40} className="text-muted-foreground/30 mb-3" />
                <h3 className="text-lg font-bold">No movies found</h3>
                <p className="text-xs text-muted-foreground max-w-xs">Try searching for another title or check back later.</p>
              </div>
            )}
          </div>
        ) : (
          /* Netflix-Style Cinematic Home View */
          <>
            {loading ? (
              <div className="space-y-10">
                <Skeleton className="h-[320px] sm:h-[420px] md:h-[520px] w-full rounded-3xl" />
                <div className="space-y-4">
                  <Skeleton className="h-6 w-40 rounded-lg" />
                  <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-32 w-[200px] shrink-0 rounded-2xl" />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Immersive Spotlight Hero Banner */}
                {spotlightMovie && (
                  <MovieHero movie={spotlightMovie} onPlay={playMovie} />
                )}

                {/* Netflix-Style Horizontal Rows */}
                <div className="space-y-4 md:space-y-6">
                  <MovieRow 
                    title="Trending Now" 
                    movies={trendingMovies} 
                    onPlay={playMovie} 
                  />
                  
                  <MovieRow 
                    title="Popular on anbae" 
                    movies={popularMovies} 
                    onPlay={playMovie} 
                  />

                  <MovieRow 
                    title="Top Rated Masterpieces" 
                    movies={topRatedMovies} 
                    onPlay={playMovie} 
                  />

                  <MovieRow 
                    title="Upcoming Blockbusters" 
                    movies={upcomingMovies} 
                    onPlay={playMovie} 
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Movies;
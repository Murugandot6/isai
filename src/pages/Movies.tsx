"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useMusic, Movie } from '@/context/MusicContext';
import { tmdbApi, CastMember } from '@/services/tmdbApi';
import { StreamPlayer } from '@/components/StreamPlayer';
import { MovieHero } from '@/components/MovieHero';
import { MovieRow } from '@/components/MovieRow';
import { Play, Film, Star, Search, Tv, X, Users, Info, User, Layers, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

const Movies = () => {
  const { currentMovie, playMovie, closeMovie, roomCode } = useMusic();
  const navigate = useNavigate();
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?type=movies&q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <MainLayout>
      {/* Immersive Fullscreen Background and layout container */}
      <div className="bg-zinc-950 min-h-screen text-white select-none">
        
        {/* Floating Minimalist Search Bar overlay if toggled */}
        {isSearchOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-6 right-6 p-2 text-white hover:text-purple-400 transition-colors"
            >
              <X size={28} />
            </button>
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl text-center space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-widest text-purple-400">Search Movies</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type any movie title, genres, directors..."
                  className="pl-12 bg-zinc-900 border-2 border-transparent focus-visible:border-purple-600/30 h-14 rounded-2xl text-base font-semibold"
                  autoFocus
                />
              </div>
            </form>
          </div>
        )}

        {/* Theater Mode Player Overlay */}
        {currentMovie && (
          <div className="fixed inset-0 bg-black/98 z-50 flex flex-col animate-in fade-in duration-300 overflow-y-auto">
            {/* Player Header - Vyla styling */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 gap-4">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <Tv className="text-purple-400 shrink-0 w-6 h-6" />
                <div className="min-w-0">
                  <h2 className="text-base md:text-xl font-black text-white flex items-center gap-2 truncate">
                    {currentMovie.title}
                    <span className="text-xs text-muted-foreground font-normal shrink-0">({currentMovie.year})</span>
                  </h2>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">{currentMovie.genre}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                {roomCode && (
                  <Badge className="bg-purple-500 text-white gap-1 py-1 px-3.5 rounded-full font-black text-[10px] tracking-wide uppercase animate-pulse hidden sm:flex">
                    <Users size={12} />
                    Sync Room: {roomCode}
                  </Badge>
                )}

                <button 
                  onClick={() => closeMovie()}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Premium Stream Player Component */}
            <div className="p-2 sm:p-6 md:p-10 max-w-5xl mx-auto w-full">
              <StreamPlayer movie={currentMovie} />
            </div>

            {/* Player Footer / Info & Cast */}
            <div className="p-6 md:p-12 bg-zinc-950 border-t border-white/5 text-white flex-1">
              <div className="max-w-5xl mx-auto space-y-8">
                {/* Sync Notice */}
                {roomCode && (
                  <div className="flex gap-3 p-4 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-xs md:text-sm text-purple-200">
                    <Users size={20} className="text-purple-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Social Sync Active:</strong> Your movie page is fully broadcast-linked. When you trigger playback, other attendees inside room lobby <strong>{roomCode}</strong> will synchronize automatically!
                    </p>
                  </div>
                )}

                {/* Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Layers size={16} className="text-purple-400" />
                      Synopsis
                    </h3>
                    <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-semibold">{currentMovie.overview}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
                    <h4 className="font-black text-white uppercase tracking-wider text-[10px]">Metadata Details</h4>
                    <div className="space-y-2 font-semibold text-zinc-400">
                      <div className="flex justify-between"><span className="text-zinc-500">Rating:</span> <span className="text-yellow-400">{currentMovie.rating} / 10 ★</span></div>
                      <div className="flex justify-between"><span className="text-zinc-500">Language:</span> <span className="text-white">{currentMovie.language.toUpperCase()}</span></div>
                      <div className="flex justify-between"><span className="text-zinc-500">Release Year:</span> <span className="text-white">{currentMovie.year}</span></div>
                    </div>
                  </div>
                </div>

                {/* Cast / Actors Section */}
                <div className="border-t border-white/5 pt-8">
                  <h3 className="text-base md:text-lg font-black mb-6 flex items-center gap-2">
                    <User size={16} className="text-purple-400" />
                    Cast & Starcast
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
                    <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-none">
                      {cast.map((actor) => (
                        <div key={actor.id} className="w-20 md:w-24 shrink-0 text-center group">
                          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full overflow-hidden bg-zinc-900 mb-2.5 border-2 border-transparent group-hover:border-purple-500 transition-all">
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

        {loading ? (
          <div className="space-y-10">
            <Skeleton className="h-screen w-full" />
          </div>
        ) : (
          <div className="space-y-12">
            {/* Spotlight Fullscreen Carousel Hero */}
            {trendingMovies.length > 0 && (
              <MovieHero 
                movies={trendingMovies.slice(0, 8)} 
                onPlay={playMovie} 
                onSearchClick={() => setIsSearchOpen(true)}
              />
            )}

            {/* Immersive Scroll Rows */}
            <div className="px-6 md:px-16 space-y-12 pb-24">
              <MovieRow 
                title="Latest Releases" 
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
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Movies;
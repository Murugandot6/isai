"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useMusic, Movie } from '@/context/MusicContext';
import { tmdbApi } from '@/services/tmdbApi';
import { MovieHero } from '@/components/MovieHero';
import { MovieRow } from '@/components/MovieRow';
import { Search, X, Film, ArrowLeft, LogIn, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const Movies = () => {
  const { playMovie } = useMusic();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

        setTrendingMovies(trending || []);
        setPopularMovies(popular || []);
        setTopRatedMovies(topRated || []);
        setUpcomingMovies(upcoming || []);
      } catch (error) {
        console.error("Failed to load movies:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAllMovies();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?type=movies&q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const hasMovies = trendingMovies.length > 0 || popularMovies.length > 0;

  return (
    <MainLayout>
      <div className="bg-zinc-950 min-h-screen text-white select-none relative">
        
        {/* Persistent Header for Movies Station (since MainLayout hides global header here) */}
        <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between p-6 md:px-12 pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-3 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-all backdrop-blur-md border border-white/10"
            >
              <Search size={20} />
            </button>
          </div>

          <div className="pointer-events-auto">
            <button 
              onClick={() => navigate('/')}
              className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-transform"
              title="Back to Hub"
            >
              <ArrowLeft size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            {user ? (
              <button 
                onClick={() => signOut()}
                className="p-3 rounded-full bg-black/30 hover:bg-red-500/20 text-white/80 hover:text-red-400 transition-all backdrop-blur-md border border-white/10"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-lg"
              >
                <LogIn size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Floating Minimalist Search Bar */}
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

        {loading ? (
          <div className="space-y-10">
            <Skeleton className="h-screen w-full" />
          </div>
        ) : !hasMovies ? (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-6">
            <div className="bg-purple-500/10 p-8 rounded-full border border-purple-500/20">
              <Film size={64} className="text-purple-400/40" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight">Cinema is currently offline</h2>
              <p className="text-zinc-400 max-w-md mx-auto">We couldn't fetch the latest movies. You can still try searching for specific titles manually.</p>
            </div>
            <Button 
              onClick={() => setIsSearchOpen(true)}
              className="rounded-full bg-purple-600 hover:bg-purple-700 px-8 h-12 font-bold"
            >
              Open Search
            </Button>
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
"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useMusic, Movie } from '@/context/MusicContext';
import { tmdbApi } from '@/services/tmdbApi';
import { MovieHero } from '@/components/MovieHero';
import { MovieRow } from '@/components/MovieRow';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

const Movies = () => {
  const { playMovie } = useMusic();
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?type=movies&q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <MainLayout>
      <div className="bg-zinc-950 min-h-screen text-white select-none">
        
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
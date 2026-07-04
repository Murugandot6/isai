import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useMusic, Movie } from '@/context/MusicContext';
import { tmdbApi } from '@/services/tmdbApi';
import { MovieRow } from '@/components/MovieRow';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Film, ArrowLeft, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CATEGORIES = [
  { id: 'action', label: 'Action' },
  { id: 'comedy', label: 'Comedy' },
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'animation', label: 'Animation' },
  { id: 'romance', label: 'Romance' },
  { id: 'thriller', label: 'Thriller' },
  { id: 'documentary', label: 'Documentary' },
  { id: 'history', label: 'History' },
  { id: 'music', label: 'Music' },
  { id: 'tv', label: 'TV Shows' }
] as const;

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categoryMovies, setCategoryMovies] = useState<Movie[]>([]);

  // Load all movies on mount
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

  // Load movies by selected category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setCategoryMovies([]);
      return;
    }
    
    const fetchCategoryMovies = async () => {
      setLoading(true);
      try {
        const movies = await tmdbApi.getMoviesByGenre(selectedCategory);
        setCategoryMovies(movies);
      } catch (error) {
        console.error("Failed to fetch category movies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryMovies();
  }, [selectedCategory]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    if (value !== 'all') {
      fetchCategoryMovies();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?type=movies&q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Helper to render category buttons with active state
  const renderCategoryButtons = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      {CATEGORIES.map((cat) => (
        <Button
          key={cat.id}
          variant={selectedCategory === cat.id ? 'solid' : 'outline'}
          className="rounded-xl font-bold text-xs px-4 py-2.5 transition-all hover:bg-white/10"
          onClick={handleCategoryChange}
        >
          {cat.label}
        </Button>
      ))}
    </div>
  );

  return (
    <MainLayout>
      <div className="bg-zinc-950 min-h-screen text-white select-none">
        {/* Header with Category Filter */}
        <div className="flex items-center justify-between px-6 md:px-12 py-4">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            {selectedCategory === 'all' ? 'All Movies' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Movies`}
          </h1>
          <div className="flex items-center gap-2">
            {renderCategoryButtons()}
            <Search 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" 
              size={16} 
            />
            <Input 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search movies..." 
              className="pl-11 pr-4 bg-zinc-900 border-none h-11 rounded-xl text-sm text-white focus-visible:ring-2 focus-visible:ring-purple-500/20"
            />
          </div>
        </div>

        {/* Category Filter UI */}
        {selectedCategory !== 'all' && (
          <div className="px-6 md:px-12 py-2 mb-6">
            <p className="text-sm text-zinc-400 font-medium">
              Showing results for <span className="text-purple-400 font-bold">{selectedCategory}</span> movies
            </p>
          </div>
        )}

        {/* Content Sections */}
        <div className="px-6 md:px-16 space-y-12">
          {/* Trending */}
          {trendingMovies.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-black mb-3">Trending Now</h2>
              <MovieRow 
                title="Trending" 
                movies={trendingMovies} 
                onPlay={playMovie} 
              />
            </div>
          )}

          {/* Popular */}
          {popularMovies.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-black mb-3">Popular Movies</h2>
              <MovieRow 
                title="Popular" 
                movies={popularMovies} 
                onPlay={playMovie} 
              />
            </div>
          )}

          {/* Top Rated */}
          {topRatedMovies.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-black mb-3">Top Rated</h2>
              <MovieRow 
                title="Top Rated" 
                movies={topRatedMovies} 
                onPlay={playMovie} 
              />
            </div>
          )}

          {/* Upcoming */}
          {upcomingMovies.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-black mb-3">Upcoming</h2>
              <MovieRow 
                title="Upcoming" 
                movies={upcomingMovies} 
                onPlay={playMovie} 
              />
            </div>
          )}

          {/* Category Specific Movies */}
          {categoryMovies.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-black mb-3">
                {selectedCategory === 'all' ? 'All Movies' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Movies`}
              </h2>
              <MovieRow 
                title={selectedCategory === 'all' ? 'All Movies' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Movies`}
                movies={categoryMovies} 
                onPlay={playMovie} 
              />
            </div>
          )}

          {/* Load More State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-purple-400" size={48} />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Movies;
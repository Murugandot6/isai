"use client";

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { MovieRow } from '@/components/MovieRow';
import { Loader2 } from 'lucide-react';

export default function Movies() {
  const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch trending movies
    setLoading(false);
  }, []);

  return (
    <MainLayout>
      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Trending Movies</h1>
        
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin mr-2" />
            <span>Loading...</span>
          </div>
        ) : trendingMovies.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            No trending movies available.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingMovies.map((movie) => (
              <MovieRow key={movie.id} movie={movie} onPlay={() => {}} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
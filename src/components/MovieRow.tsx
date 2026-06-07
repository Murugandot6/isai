"use client";

import React from 'react';
import { Movie } from '@/context/MusicContext';
import { Play, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onPlay: (movie: Movie) => void;
}

export const MovieRow: React.FC<MovieRowProps> = ({ title, movies, onPlay }) => {
  if (movies.length === 0) return null;

  return (
    <div className="space-y-4 mb-10">
      <h3 className="text-xl md:text-2xl font-black tracking-tight text-white pl-1">
        {title}
      </h3>
      
      {/* Horizontal Scroll Container */}
      <div className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
        {movies.map((movie) => (
          <div 
            key={movie.id}
            onClick={() => onPlay(movie)}
            className="group relative w-[200px] md:w-[240px] shrink-0 bg-card/40 border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            {/* Poster / Backdrop Image */}
            <div className="relative aspect-[16/10] overflow-hidden bg-accent/10">
              <img 
                src={movie.backdrop || movie.poster} 
                alt={movie.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 transform scale-90 group-hover:scale-100 transition-transform">
                  <Play size={18} fill="currentColor" className="ml-0.5" />
                </div>
              </div>

              {/* Rating Badge */}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                <Star size={10} fill="currentColor" />
                {movie.rating}
              </div>
            </div>

            {/* Movie Details */}
            <div className="p-3">
              <h4 className="font-bold text-xs md:text-sm text-white truncate group-hover:text-primary transition-colors">
                {movie.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[8px] font-bold uppercase px-1.5 py-0">
                  {movie.language}
                </Badge>
                <span className="text-[10px] text-muted-foreground font-bold">{movie.year}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
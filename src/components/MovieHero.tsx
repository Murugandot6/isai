"use client";

import React from 'react';
import { Movie, useMusic } from '@/context/MusicContext';
import { Play, Info, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MovieHeroProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
}

export const MovieHero: React.FC<MovieHeroProps> = ({ movie, onPlay }) => {
  const { toggleLikeMovie, isMovieLiked } = useMusic();
  const liked = isMovieLiked(movie.id);

  return (
    <div className="relative h-[450px] md:h-[550px] w-full rounded-3xl overflow-hidden mb-12 group shadow-2xl">
      <img 
        src={movie.backdrop} 
        alt={movie.title} 
        className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/20 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Badge className="bg-primary text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-0.5">
            Spotlight
          </Badge>
          <span className="text-xs text-white/80 font-bold">{movie.year}</span>
          <div className="flex items-center gap-1 text-xs text-yellow-500 font-bold">
            <Star size={12} fill="currentColor" />
            {movie.rating}
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter leading-none">
          {movie.title}
        </h1>

        <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
          {movie.overview}
        </p>

        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => onPlay(movie)}
            className="rounded-xl px-8 h-12 font-bold gap-2 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 text-sm"
          >
            <Play size={16} fill="currentColor" />
            Play Movie
          </Button>
          <Button 
            variant="outline"
            onClick={() => toggleLikeMovie(movie)}
            className={cn(
              "rounded-xl w-12 h-12 p-0 border-white/20 bg-white/5 backdrop-blur-md transition-all",
              liked ? "text-primary border-primary/30 bg-primary/10" : "text-white hover:bg-white/10"
            )}
          >
            <Heart size={20} fill={liked ? "currentColor" : "none"} />
          </Button>
          <Badge variant="outline" className="text-white border-white/20 text-xs font-bold px-4 py-2 rounded-xl bg-white/5 backdrop-blur-md">
            {movie.genre}
          </Badge>
        </div>
      </div>
    </div>
  );
};
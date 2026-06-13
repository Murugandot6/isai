"use client";

import React, { useState, useEffect } from 'react';
import { Movie, useMusic } from '@/context/MusicContext';
import { Play, Info, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MovieHeroProps {
  movies: Movie[];
  onPlay: (movie: Movie) => void;
}

export const MovieHero: React.FC<MovieHeroProps> = ({ movies, onPlay }) => {
  const { toggleLikeMovie, isMovieLiked } = useMusic();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (movies.length === 0) return null;

  const currentMovie = movies[currentIndex];
  const liked = isMovieLiked(currentMovie.id);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  return (
    <div className="relative w-full h-[60vh] sm:h-[75vh] md:h-[85vh] rounded-[2.5rem] overflow-hidden bg-black shadow-2xl group border border-white/5">
      {/* Full Bleed Backdrop Image */}
      <div className="absolute inset-0 transition-all duration-1000 ease-in-out transform scale-100 group-hover:scale-[1.02]">
        <img 
          src={currentMovie.backdrop} 
          alt={currentMovie.title} 
          className="w-full h-full object-cover object-center"
        />
        {/* Cinematic Vignette Overlay matching the Vyla UI */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-transparent to-zinc-950/20" />
        <div className="absolute inset-0 bg-radial-gradient" style={{ background: 'radial-gradient(circle at 30% 50%, transparent 20%, rgba(9,9,11,0.8) 100%)' }} />
      </div>

      {/* Hero content container */}
      <div className="absolute inset-0 flex items-center justify-between px-6 sm:px-12 md:px-20 py-10 z-10">
        
        {/* Left Vertical Poster Preview (Vyla Style) */}
        <div className="hidden md:block w-56 lg:w-64 aspect-[2/3] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 shrink-0 transform -rotate-1 hover:rotate-0 transition-transform duration-500 hover:scale-[1.03]">
          <img 
            src={currentMovie.poster} 
            alt={currentMovie.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Center-Left Movie Details */}
        <div className="flex-1 md:ml-12 lg:ml-20 max-w-xl text-left select-none space-y-4 md:space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black tracking-[0.25em] uppercase text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              Trending #{(currentIndex + 1)}
            </span>
            <span className="text-xs text-white/60 font-bold">{currentMovie.year}</span>
            <span className="text-xs text-yellow-500 font-bold flex items-center gap-1">★ {currentMovie.rating}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9] font-sans drop-shadow-2xl uppercase">
            {currentMovie.title}
          </h1>

          <p className="text-white/70 text-xs sm:text-sm md:text-base leading-relaxed font-medium line-clamp-3 md:line-clamp-4 max-w-lg drop-shadow">
            {currentMovie.overview}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Button 
              onClick={() => onPlay(currentMovie)}
              className="rounded-full bg-red-600 text-white hover:bg-red-700 px-8 h-12 md:h-14 text-sm font-black uppercase tracking-wider gap-2 shadow-xl shadow-red-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              Play
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => toggleLikeMovie(currentMovie)}
              className={cn(
                "rounded-full w-12 h-12 md:w-14 md:h-14 p-0 border-white/20 bg-white/5 backdrop-blur-md transition-all hover:scale-105 hover:bg-white/10 active:scale-95",
                liked ? "text-purple-400 border-purple-500/30 bg-purple-500/10" : "text-white"
              )}
            >
              <Heart size={18} fill={liked ? "currentColor" : "none"} />
            </Button>
          </div>
        </div>

        {/* Space on right */}
        <div className="hidden lg:block w-20" />
      </div>

      {/* Navigation Arrows on edges */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 border border-white/5 backdrop-blur-md"
      >
        <ChevronLeft size={20} />
      </button>

      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 border border-white/5 backdrop-blur-md"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {movies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              idx === currentIndex ? "w-6 bg-purple-500" : "w-1.5 bg-white/30 hover:bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
};
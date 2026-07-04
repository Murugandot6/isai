import React, { useState, useEffect } from 'react';
import { Movie, useMusic } from '@/context/MusicContext';
import { Play, Heart, ChevronLeft, ChevronRight, Info, Search, Music, Disc, Film, ArrowLeft, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface MovieHeroProps {
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onSearchClick: () => void;
}

export const MovieHero: React.FC<MovieHeroProps> = ({ movies, onPlay, onSearchClick }) => {
  const { toggleLikeMovie, isMovieLiked } = useMusic();
  const { user, signOut } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [movies.length]);

  const currentMovie = movies[currentIndex];
  const liked = isMovieLiked(currentMovie.id);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const isMobile = window.innerWidth < 768;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none">
      {/* Immersive Background Image */}
      <div className="absolute inset-0 transition-transform duration-1000 ease-out">
        <img 
          src={currentMovie.backdrop} 
          alt={currentMovie.title} 
          className={`w-full h-full object-cover object-center ${isMobile ? 'scale-110' : 'scale-100'} transition-transform`}
        />
        {/* Complex cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/10 to-transparent" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Mobile-Optimized Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 md:px-12">
        <button 
          onClick={() => navigate('/')} 
          className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
          title="Back to Hub"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-3">
          {user ? (
            <button 
              onClick={() => signOut()} 
              className="p-2 rounded-full bg-black/30 hover:bg-red-500/20 text-white/80 hover:text-red-400 transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')} 
              className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all"
            >
              <LogIn size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Hero Content */}
      <div className="absolute inset-0 flex items-center justify-between px-4 md:px-12 py-16 z-10">
        {/* Mobile Poster on Top */}
        <div className="hidden md:hidden w-48 h-64 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10">
          <img 
            src={currentMovie.poster} 
            alt={currentMovie.title} 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* Mobile Title & Controls */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.2em] font-black uppercase text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">
              Trending #{currentIndex + 1}
            </span>
            <span className="text-sm font-bold">{currentMovie.year}</span>
            <span className="text-yellow-500 flex items-center gap-0.5">★ {currentMovie.rating}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-[0.9] uppercase drop-shadow-2xl">
            {currentMovie.title}
          </h1>

          <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-semibold line-clamp-3 md:line-clamp-4 max-w-lg drop-shadow">
            {currentMovie.overview}
          </p>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => onPlay(currentMovie)} 
              className="rounded-full bg-red-600 text-white hover:bg-red-700 px-8 h-12 md:h-14 text-sm font-black uppercase tracking-wider gap-2 shadow-xl shadow-red-600/25 transition-all hover:scale-105 active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              Play
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => toggleLikeMovie(currentMovie)} 
              className={cn(
                "rounded-full w-12 h-12 md:w-14 md:h-14 p-0 border-white/20 bg-white/5 backdrop-blur-md transition-all hover:scale-105 active:scale-95",
                liked ? "text-red-400 border-red-500/30 bg-red-500/10 hover:bg-red-500/20" : "text-white hover:bg-white/10"
              )} 
            >
              <Heart size={18} fill={liked ? "currentColor" : "none"} />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on Mobile */}
      <button 
        onClick={prevSlide} 
        className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 border border-white/10 backdrop-blur-md hidden sm:block"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={nextSlide} 
        className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 border border-white/10 backdrop-blur-md hidden sm:block"
      >
        <ChevronRight size={24} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-6 sm:left-12 md:left-24 flex items-center gap-2 z-20">
        {movies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "h-1 rounded-full transition-all",
              idx === currentIndex ? "w-8 bg-purple-500" : "w-2 bg-white/30 hover:bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
};
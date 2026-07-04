"use client";

import DOMPurify from 'dompurify';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MovieRowProps {
  movie: {
    id: string;
    title: string;
    overview: string;
    backdrop: string;
    poster: string;
    rating: number;
    year: string;
    genre: string;
  };
  onPlay: (movie: any) => void;
}

export const MovieRow = ({ movie, onPlay }: MovieRowProps) => {
  return (
    <div 
      onClick={() => onPlay(movie)}
      className="group relative bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden hover:border-purple-500/30 transition-all duration-500 cursor-pointer"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img src={movie.backdrop} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform">
            <Play size={16} fill="currentColor" className="ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-sm truncate group-hover:text-purple-400 transition-colors">
          {DOMPurify.sanitize(movie.title)}
        </h3>
        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
          {DOMPurify.sanitize(movie.overview)}
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400">
          <span>{movie.year}</span>
          <span className="text-yellow-500">★ {movie.rating}</span>
        </div>
      </div>
    </div>
  );
};
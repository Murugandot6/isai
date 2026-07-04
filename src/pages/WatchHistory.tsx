"use client";

import React from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useMusic } from '@/context/MusicContext';
import { Film, History, ArrowLeft, Play, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WatchHistory = () => {
  const { recentlyWatched, playMovie } = useMusic();
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-tr from-black via-zinc-950 to-neutral-950 text-white p-4 md:p-10 max-w-7xl mx-auto space-y-8">
        {/* Header with Back Navigation */}
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => navigate('/movies')}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10"
            title="Back to Cinema"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="bg-purple-500/20 p-2 rounded-xl border border-purple-500/30">
            <History className="text-purple-400 w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">Watch History</h1>
            <p className="text-xs text-zinc-400 font-medium">Resume your movie sessions right where you left off.</p>
          </div>
        </div>

        {recentlyWatched.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {recentlyWatched.map((movie) => (
              <div 
                key={movie.id}
                onClick={() => playMovie(movie)}
                className="group relative bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-1.5 cursor-pointer text-left"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={movie.backdrop} alt={movie.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xl">
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-xs md:text-sm truncate group-hover:text-purple-400 transition-colors">{movie.title}</h3>
                  <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold mt-1">Recently Watched</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
            <Film className="text-zinc-600 mb-4 w-9 h-9 md:w-12 md:h-12" />
            <h3 className="text-lg md:text-xl font-bold mb-1">No watch history</h3>
            <p className="text-xs text-zinc-400 max-w-xs">Start watching films in the Cinema section, and they will appear here.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default WatchHistory;
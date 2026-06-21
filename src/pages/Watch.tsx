"use client";

import React, { useState, useEffect } from 'react';
import { useMusic } from '@/context/MusicContext';
import { tmdbApi, CastMember } from '@/services/tmdbApi';
import { StreamPlayer } from '@/components/StreamPlayer';
import { Tv, ArrowLeft, Users, Layers, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MainLayout } from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';

const Watch = () => {
  const { currentMovie, closeMovie, roomCode } = useMusic();
  const [cast, setCast] = useState<CastMember[]>([]);
  const [loadingCast, setLoadingCast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentMovie) {
      navigate('/movies');
      return;
    }

    const fetchMovieDetails = async () => {
      setLoadingCast(true);
      try {
        if (currentMovie.id && !currentMovie.id.startsWith('tt')) {
          const credits = await tmdbApi.getMovieCredits(currentMovie.id);
          setCast(credits || []);
        } else {
          setCast([]);
        }
      } catch (error) {
        console.error("Failed to load movie details:", error);
      } finally {
        setLoadingCast(false);
      }
    };

    fetchMovieDetails();
  }, [currentMovie, navigate]);

  if (!currentMovie) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => closeMovie()}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10 shrink-0"
              title="Back to Cinema"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl md:text-3xl font-black text-white flex items-center gap-2 truncate leading-tight">
                {currentMovie.title}
                <span className="text-sm md:text-base text-zinc-500 font-normal shrink-0">({currentMovie.year})</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-1">{currentMovie.genre} • {currentMovie.language}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            {roomCode && (
              <Badge className="bg-purple-500 text-white gap-1.5 py-1.5 px-4 rounded-full font-black text-[10px] tracking-wide uppercase animate-pulse">
                <Users size={12} />
                Sync Room: {roomCode}
              </Badge>
            )}
          </div>
        </div>

        {/* Video Player Frame */}
        <div className="max-w-5xl mx-auto w-full">
          <StreamPlayer key={currentMovie.id} movie={currentMovie} />
        </div>

        {/* Details & Info Section */}
        <div className="max-w-5xl mx-auto space-y-8 pt-4">
          
          {roomCode && (
            <div className="flex gap-3 p-4 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-xs md:text-sm text-purple-200 text-left">
              <Users size={20} className="text-purple-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Social Sync Active:</strong> Your movie page is fully broadcast-linked. When you trigger playback, other attendees inside room lobby <strong>{roomCode}</strong> will synchronize automatically!
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-base md:text-lg font-black text-white flex items-center gap-2 uppercase tracking-wider">
                <Layers size={16} className="text-purple-400" />
                Synopsis
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-semibold">{currentMovie.overview}</p>
            </div>
            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3 text-xs">
              <h4 className="font-black text-white uppercase tracking-wider text-[10px] tracking-widest text-purple-400">Metadata Details</h4>
              <div className="space-y-2 font-semibold text-zinc-400">
                <div className="flex justify-between"><span className="text-zinc-500">Rating:</span> <span className="text-yellow-400">{currentMovie.rating} / 10 ★</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Language:</span> <span className="text-white">{currentMovie.language.toUpperCase()}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Release Year:</span> <span className="text-white">{currentMovie.year}</span></div>
              </div>
            </div>
          </div>

          {/* Cast */}
          <div className="border-t border-white/5 pt-8 text-left">
            <h3 className="text-base md:text-lg font-black mb-6 flex items-center gap-2 uppercase tracking-wider">
              <User size={16} className="text-purple-400" />
              Cast & Starcast
            </h3>
            
            {loadingCast ? (
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-20 shrink-0 space-y-2">
                    <Skeleton className="w-16 h-16 rounded-full bg-white/5" />
                    <Skeleton className="h-3 w-16 bg-white/5" />
                  </div>
                ))}
              </div>
            ) : cast.length > 0 ? (
              <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar">
                {cast.map((actor) => (
                  <div key={actor.id} className="w-20 md:w-24 shrink-0 text-center group">
                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full overflow-hidden bg-zinc-900 mb-2.5 border-2 border-transparent group-hover:border-purple-500 transition-all">
                      {actor.profile_path ? (
                        <img 
                          src={actor.profile_path} 
                          alt={actor.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500">
                          <User size={20} />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] md:text-xs font-bold truncate text-zinc-200">{actor.name}</p>
                    <p className="text-[9px] md:text-[10px] text-zinc-500 truncate mt-0.5">{actor.character}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No cast information available.</p>
            )}
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

// Simple helper fallback Loader loader
const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    className={`${className} animate-spin`} 
    style={{ width: size, height: size }}
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default Watch;
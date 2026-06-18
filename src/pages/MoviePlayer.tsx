"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { useMusic } from '@/context/MusicContext';
import { tmdbApi, CastMember } from '@/services/tmdbApi';
import { StreamPlayer } from '@/components/StreamPlayer';
import { Tv, X, Users, Layers, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const MoviePlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { closeMovie, roomCode } = useMusic();
  const [movie, setMovie] = useState<any>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCast, setLoadingCast] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch movie details from TMDB
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=c9a3033fe3a3f5e6378891c5d0e887bf`);
        const data = await res.json();
        
        if (data && data.id) {
          setMovie({
            id: data.id.toString(),
            title: data.title,
            overview: data.overview,
            backdrop: data.backdrop_path 
              ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` 
              : data.poster_path 
                ? `https://image.tmdb.org/t/p/original${data.poster_path}` 
                : '',
            poster: data.poster_path 
              ? `https://image.tmdb.org/t/p/w500${data.poster_path}` 
              : '',
            rating: data.vote_average,
            year: data.release_date?.split('-')[0] || 'N/A',
            genre: data.genres?.slice(0, 3).map(g => g.name).join(', ') || 'N/A',
            language: data.original_language?.toUpperCase() || 'EN',
            imdbId: data.imdb_id
          });
        }
      } catch (error) {
        console.error("Failed to fetch movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchMovieCredits = async () => {
      if (!id) return;
      
      setLoadingCast(true);
      try {
        const credits = await tmdbApi.getMovieCredits(id);
        setCast(credits || []);
      } catch (error) {
        console.error("Failed to load movie credits:", error);
      } finally {
        setLoadingCast(false);
      }
    };

    fetchMovieDetails();
    fetchMovieCredits();
  }, [id]);

  const handleBack = () => {
    navigate('/movies');
    closeMovie();
  };

  if (loading || !movie) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Skeleton className="h-12 w-40" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="fixed inset-0 bg-black/98 z-[60] flex flex-col animate-in fade-in duration-300 overflow-y-auto">
        {/* Player Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 gap-4">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <button 
              onClick={handleBack}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
            <Tv className="text-purple-400 shrink-0 w-6 h-6" />
            <div className="min-w-0">
              <h2 className="text-base md:text-xl font-black text-white flex items-center gap-2 truncate">
                {movie.title}
                <span className="text-xs text-muted-foreground font-normal shrink-0">({movie.year})</span>
              </h2>
              <p className="text-[10px] md:text-xs text-muted-foreground truncate">{movie.genre}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {roomCode && (
              <Badge className="bg-purple-500 text-white gap-1 py-1 px-3.5 rounded-full font-black text-[10px] tracking-wide uppercase animate-pulse hidden sm:flex">
                <Users size={12} />
                Sync Room: {roomCode}
              </Badge>
            )}

            <button 
              onClick={handleBack}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Premium Stream Player Component */}
        <div className="p-2 sm:p-6 md:p-10 max-w-5xl mx-auto w-full">
          <StreamPlayer movie={movie} />
        </div>

        {/* Player Footer / Info & Cast */}
        <div className="p-6 md:p-12 bg-zinc-950 border-t border-white/5 text-white flex-1">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Sync Notice */}
            {roomCode && (
              <div className="flex gap-3 p-4 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-xs md:text-sm text-purple-200">
                <Users size={20} className="text-purple-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Social Sync Active:</strong> Your movie page is fully broadcast-linked. When you trigger playback, other attendees inside room lobby <strong>{roomCode}</strong> will synchronize automatically!
                </p>
              </div>
            )}

            {/* Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Layers size={16} className="text-purple-400" />
                  Synopsis
                </h3>
                <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-semibold">{movie.overview}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
                <h4 className="font-black text-white uppercase tracking-wider text-[10px]">Metadata Details</h4>
                <div className="space-y-2 font-semibold text-zinc-400">
                  <div className="flex justify-between"><span className="text-zinc-500">Rating:</span> <span className="text-yellow-400">{movie.rating} / 10 ★</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Language:</span> <span className="text-white">{movie.language}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Release Year:</span> <span className="text-white">{movie.year}</span></div>
                </div>
              </div>
            </div>

            {/* Cast / Actors Section */}
            <div className="border-t border-white/5 pt-8 pb-20">
              <h3 className="text-base md:text-lg font-black mb-6 flex items-center gap-2">
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
      </div>
    </MainLayout>
  );
};

export default MoviePlayer;
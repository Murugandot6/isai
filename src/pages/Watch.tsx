"use client";

import React, { useState, useEffect } from 'react';
import { useMusic } from '@/context/MusicContext';
import { tmdbApi, CastMember } from '@/services/tmdbApi';
import { StreamPlayer } from '@/components/StreamPlayer';
import { MovieRow } from '@/components/MovieRow';
import { 
  Tv, 
  ArrowLeft, 
  Users, 
  Layers, 
  User, 
  Star, 
  Calendar, 
  Globe, 
  Info, 
  Play, 
  Heart,
  Share2,
  Clock,
  LayoutGrid
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Watch = () => {
  const { currentMovie, closeMovie, roomCode, toggleLikeMovie, isMovieLiked, playMovie } = useMusic();
  const [cast, setCast] = useState<CastMember[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentMovie) {
      navigate('/movies');
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      try {
        if (currentMovie.id && !currentMovie.id.startsWith('tt')) {
          const [credits, recs] = await Promise.all([
            tmdbApi.getMovieCredits(currentMovie.id),
            tmdbApi.searchMovies(currentMovie.title) // Simple recommendation logic
          ]);
          setCast(credits || []);
          setRecommendations(recs.filter(m => m.id !== currentMovie.id).slice(0, 10));
        }
      } catch (error) {
        console.error("Failed to load movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentMovie, navigate]);

  if (!currentMovie) return null;

  const isLiked = isMovieLiked(currentMovie.id);

  return (
    <MainLayout>
      <div className="min-h-screen bg-zinc-950 text-white select-none">
        
        {/* Dynamic Background Backdrop */}
        <div className="absolute top-0 left-0 w-full h-[70vh] z-0 overflow-hidden">
          <img 
            src={currentMovie.backdrop} 
            alt="" 
            className="w-full h-full object-cover opacity-30 blur-sm scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 px-4 md:px-12 pt-6 md:pt-10 max-w-[1600px] mx-auto space-y-8">
          
          {/* Top Navigation & Breadcrumbs */}
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => closeMovie()}
              className="gap-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full px-5"
            >
              <ArrowLeft size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Back to Hub</span>
            </Button>

            {roomCode && (
              <Badge className="bg-purple-600 text-white gap-2 py-2 px-6 rounded-full font-black text-[10px] tracking-widest uppercase animate-pulse shadow-lg shadow-purple-600/20">
                <Users size={14} />
                Sync Room: {roomCode}
              </Badge>
            )}
          </div>

          {/* Cinematic Header: Poster + Info */}
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8 lg:gap-12 pb-6">
            {/* Poster Card */}
            <div className="w-48 md:w-64 aspect-[2/3] rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 shrink-0 transform hover:scale-[1.02] transition-transform duration-500">
              <img src={currentMovie.poster} alt={currentMovie.title} className="w-full h-full object-cover" />
            </div>

            {/* Meta Section */}
            <div className="flex-1 text-center lg:text-left space-y-4 md:space-y-6">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Badge variant="secondary" className="bg-purple-600 text-white border-none px-3 py-1 font-black text-[10px] tracking-widest uppercase">
                  {currentMovie.genre.split(' / ')[0]}
                </Badge>
                <div className="flex items-center gap-1.5 text-yellow-500 font-black text-sm">
                  <Star size={16} fill="currentColor" />
                  <span>{currentMovie.rating}</span>
                </div>
                <span className="text-zinc-500 font-bold">•</span>
                <span className="text-zinc-300 font-bold text-sm uppercase">{currentMovie.language}</span>
                <span className="text-zinc-500 font-bold">•</span>
                <span className="text-zinc-300 font-bold text-sm">{currentMovie.year}</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95] uppercase drop-shadow-2xl">
                {currentMovie.title}
              </h1>

              <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-semibold max-w-3xl line-clamp-3 lg:line-clamp-none">
                {currentMovie.overview}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Button 
                  onClick={() => document.getElementById('video-player')?.scrollIntoView({ behavior: 'smooth' })}
                  className="rounded-full bg-white text-black hover:bg-zinc-200 px-8 h-12 md:h-14 text-sm font-black uppercase tracking-widest gap-2 shadow-xl"
                >
                  <Play size={18} fill="black" />
                  Watch Now
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => toggleLikeMovie(currentMovie)}
                  className={cn(
                    "rounded-full w-12 h-12 md:w-14 md:h-14 p-0 border-white/20 bg-white/5 backdrop-blur-md hover:scale-105 active:scale-95 transition-all",
                    isLiked ? "text-red-500 border-red-500/30 bg-red-500/10" : "text-white"
                  )}
                >
                  <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                </Button>
                <Button 
                  variant="outline"
                  className="rounded-full w-12 h-12 md:w-14 md:h-14 p-0 border-white/20 bg-white/5 backdrop-blur-md"
                >
                  <Share2 size={20} />
                </Button>
              </div>
            </div>
          </div>

          {/* Video Player Section */}
          <div id="video-player" className="w-full pt-12 space-y-6">
            <div className="flex items-center gap-3 mb-2 px-2">
              <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Video Station</h2>
            </div>
            <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(147,51,234,0.1)] bg-black aspect-video">
              <StreamPlayer movie={currentMovie} />
            </div>
          </div>

          {/* Details Grid: Cast + Extra Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-16">
            {/* Main Content (Left) */}
            <div className="lg:col-span-2 space-y-12">
              {/* Cast Row */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <User className="text-purple-500" size={20} />
                    Starcast
                  </h3>
                </div>
                <div className="flex gap-4 md:gap-8 overflow-x-auto pb-4 no-scrollbar">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="w-24 md:w-32 shrink-0 space-y-3">
                        <Skeleton className="aspect-square w-full rounded-full bg-white/5" />
                        <Skeleton className="h-4 w-full bg-white/5" />
                      </div>
                    ))
                  ) : cast.length > 0 ? (
                    cast.map((actor) => (
                      <div key={actor.id} className="w-24 md:w-32 shrink-0 group text-center">
                        <div className="aspect-square w-full rounded-full overflow-hidden bg-zinc-900 border-2 border-transparent group-hover:border-purple-500 transition-all duration-300 shadow-lg">
                          {actor.profile_path ? (
                            <img src={actor.profile_path} alt={actor.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-800">
                              <User size={32} />
                            </div>
                          )}
                        </div>
                        <p className="mt-3 text-xs md:text-sm font-bold text-white truncate">{actor.name}</p>
                        <p className="text-[10px] md:text-xs text-zinc-500 font-semibold truncate mt-0.5">{actor.character}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-500 text-sm italic">Cast information unavailable.</p>
                  )}
                </div>
              </section>

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <section className="pt-8">
                  <MovieRow 
                    title="Recommended for you" 
                    movies={recommendations} 
                    onPlay={(m) => {
                      playMovie(m);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                  />
                </section>
              )}
            </div>

            {/* Sidebar Details (Right) */}
            <div className="space-y-8">
              <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6 backdrop-blur-md">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-purple-400">Media Intel</h3>
                
                <div className="space-y-4">
                  <DetailItem icon={Calendar} label="Release Year" value={currentMovie.year} />
                  <DetailItem icon={Globe} label="Original Audio" value={currentMovie.language} />
                  <DetailItem icon={Star} label="Community Rating" value={`${currentMovie.rating} / 10`} />
                  <DetailItem icon={LayoutGrid} label="Type" value={currentMovie.genre.split(' / ')[0]} />
                  <DetailItem icon={Info} label="Status" value="Streaming Active" color="text-green-400" />
                </div>

                <div className="pt-6 border-t border-white/5">
                  <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
                    Streaming sources are provided by community contributors. anbae does not host any media files directly on its servers.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/20 to-zinc-900/40 border border-purple-500/10 rounded-[2.5rem] p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500/20 p-2 rounded-xl">
                    <Clock className="text-purple-400" size={20} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-tight">Watching History</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                  This movie has been added to your "Continue Watching" list in the Library.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Spacer */}
          <div className="h-24" />
        </div>
      </div>
    </MainLayout>
  );
};

const DetailItem = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color?: string }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-white/5 text-zinc-500 group-hover:text-purple-400 transition-colors">
        <Icon size={16} />
      </div>
      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{label}</span>
    </div>
    <span className={cn("text-xs font-black uppercase", color || "text-zinc-200")}>{value}</span>
  </div>
);

export default Watch;
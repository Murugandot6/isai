"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song } from '@/services/musicApi';
import { useMusic } from '@/context/MusicContext';
import { useAuth } from '@/context/AuthContext';
import { getHighResImage } from '@/lib/image-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Play, Pause, Home, Music, Film, Radio, Disc, Search, Heart, 
  Sparkles, Power, Sun, Volume2, VolumeX, Sparkle, ArrowRight, User, Compass, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const MusicPage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { selectedLanguages, playSong, currentSong, isPlaying, togglePlay, isMuted, toggleMute, toggleLike, isLiked } = useMusic();
  
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [glowingTheme, setGlowingTheme] = useState(true);

  // Fetch real trending songs based on languages
  useEffect(() => {
    const fetchMusic = async () => {
      setLoading(true);
      try {
        const trendingPromises = selectedLanguages.map(lang => 
          musicApi.getTrending(lang).catch(() => [] as Song[])
        );
        const results = await Promise.all(trendingPromises);
        const combined = results.flat();
        
        // Ensure we have some Tamil/English hits if empty
        if (combined.length === 0) {
          const fallback = await musicApi.getTrending('tamil');
          setTrendingSongs(fallback);
        } else {
          setTrendingSongs(combined);
        }
      } catch (err) {
        console.error("Failed to load trending music", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMusic();
  }, [selectedLanguages]);

  // Spotlight is either current playing song or first trending song
  const spotlightSong = useMemo(() => {
    return currentSong || trendingSongs[0] || null;
  }, [currentSong, trendingSongs]);

  const spotlightImage = spotlightSong 
    ? getHighResImage(spotlightSong.image) 
    : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200';

  const handleSpotlightPlay = () => {
    if (!spotlightSong) return;
    if (currentSong?.id === spotlightSong.id) {
      togglePlay();
    } else {
      playSong(spotlightSong, trendingSongs);
    }
  };

  const handlePowerOff = () => {
    signOut();
    toast.success("Signed out successfully");
  };

  const handleAssistClick = () => {
    toast.info("anbae Assist: Dynamic play queue activated!");
    if (trendingSongs.length > 0) {
      playSong(trendingSongs[Math.floor(Math.random() * trendingSongs.length)], trendingSongs);
    }
  };

  return (
    <MainLayout>
      <div className={cn(
        "min-h-screen relative flex flex-col select-none text-white transition-all duration-700 ease-in-out",
        glowingTheme ? "bg-gradient-to-tr from-black via-zinc-950 to-neutral-950" : "bg-black"
      )}>
        
        {/* HEADER MENU AND CONTROLS BAR (No left sidebar anymore) */}
        <div className="flex items-center justify-between p-6 md:px-12 z-20 gap-4 border-b border-white/5 bg-black/40 backdrop-blur-xl">
          {/* Left Top Group controls (Power, Theme, Sound) */}
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
            <button 
              onClick={() => navigate('/')}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
              title="Gateway Hub"
            >
              <Home size={18} />
            </button>
            <button 
              onClick={() => setGlowingTheme(!glowingTheme)}
              className={cn(
                "p-2 rounded-xl transition-all",
                glowingTheme ? "text-purple-400 bg-white/5" : "text-white/60 hover:text-white hover:bg-white/5"
              )}
              title="Toggle Ambient Glow"
            >
              <Sun size={18} />
            </button>
            <button 
              onClick={toggleMute}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
              title="Mute Sound"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>

          {/* Curated Top Menus (Requested Corrections: Trending Playlists, Editor's Picks, Top Artists) */}
          <div className="hidden md:flex items-center gap-2 text-xs font-black tracking-widest uppercase">
            <button 
              onClick={() => navigate('/featured')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 text-purple-300 hover:text-white hover:bg-white/10 transition-all text-[11px]"
            >
              <Sparkles size={14} className="text-purple-400" />
              Trending Playlists
            </button>
            <button 
              onClick={() => {
                toast.success("Editor's Picks activated!");
                if (trendingSongs.length > 0) {
                  playSong(trendingSongs[0], trendingSongs);
                }
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 text-purple-300 hover:text-white hover:bg-white/10 transition-all text-[11px]"
            >
              <Star size={14} className="text-yellow-400" />
              Editor's Picks
            </button>
            <button 
              onClick={() => navigate('/artists')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 text-purple-300 hover:text-white hover:bg-white/10 transition-all text-[11px]"
            >
              <User size={14} className="text-cyan-400" />
              Top Artists
            </button>
          </div>

          {/* Assist Pill Button */}
          <button 
            onClick={handleAssistClick}
            className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full shadow-lg text-[10px] tracking-widest uppercase font-black hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <Sparkles size={14} fill="black" />
            <span>ASSIST</span>
          </button>
        </div>

        {/* MAIN SPOTLIGHT BANNER HERO (Seamless Black Blended Look) */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-12 relative min-h-[420px] py-12">
          {/* Big spotlight absolute background art blended beautifully with pure black */}
          {spotlightSong && (
            <div className="absolute right-0 top-0 bottom-0 w-full lg:w-3/5 z-0 select-none pointer-events-none overflow-hidden rounded-l-[3rem]">
              <img 
                src={spotlightImage} 
                alt={spotlightSong.name} 
                className="w-full h-full object-cover object-center opacity-30 lg:opacity-60"
              />
              {/* Complex blended black gradients to smoothly blend standard image to black background */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )}

          <div className="relative z-10 max-w-xl space-y-4 md:space-y-6 text-left">
            <span className="text-xs md:text-sm font-black uppercase tracking-[0.25em] text-purple-400 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-purple-500 rounded-full" />
              Audio Station
            </span>

            {spotlightSong ? (
              <>
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-xl select-text animate-in fade-in duration-500" dangerouslySetInnerHTML={{ __html: spotlightSong.name }} />
                <p className="text-sm md:text-base text-zinc-300 font-semibold max-w-md leading-relaxed drop-shadow" dangerouslySetInnerHTML={{ __html: spotlightSong.primaryArtists }} />
                {spotlightSong.duration && (
                  <p className="text-xs text-purple-300/60 font-bold uppercase tracking-wider">
                    ★ Active Track • {Math.floor(Number(spotlightSong.duration) / 60)} Mins
                  </p>
                )}
              </>
            ) : (
              <>
                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">Retro</h1>
                <p className="text-sm md:text-base text-zinc-300 font-semibold max-w-md">David Bowie, Pink Floyd, Prince, ...</p>
                <p className="text-xs text-purple-300/60 font-bold uppercase tracking-wider">78 Songs</p>
              </>
            )}

            {/* Minimal Circle Play Button aligned perfectly */}
            <div className="flex items-center gap-6 pt-4">
              <button 
                onClick={handleSpotlightPlay}
                className="group flex items-center gap-4 bg-white/10 hover:bg-white/20 text-white pl-6 pr-4 py-3 rounded-full border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/55"
              >
                <span className="text-xs font-black uppercase tracking-widest text-white/90">
                  {currentSong?.id === spotlightSong?.id && isPlaying ? 'Pause' : 'Play'}
                </span>
                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                  {currentSong?.id === spotlightSong?.id && isPlaying ? (
                    <Pause size={16} fill="black" />
                  ) : (
                    <Play size={16} fill="black" className="ml-0.5" />
                  )}
                </div>
              </button>

              {spotlightSong && (
                <button 
                  onClick={() => toggleLike(spotlightSong)}
                  className={cn(
                    "p-3 rounded-full border transition-all hover:scale-105",
                    isLiked(spotlightSong.id) ? "text-purple-400 border-purple-500/40 bg-purple-500/10" : "text-white/40 border-white/10 hover:text-white"
                  )}
                >
                  <Heart size={18} fill={isLiked(spotlightSong.id) ? "currentColor" : "none"} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* HORIZONTAL MINIMAL BOTTOM TRENDING ROW (From reference mockup) */}
        <div className="px-6 md:px-12 pb-12 mt-auto pt-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-black tracking-widest uppercase text-white/60">Trending Tracks</h3>
            <button 
              onClick={() => navigate('/search?type=music')}
              className="text-xs font-bold text-purple-300 hover:text-purple-400 flex items-center gap-1 transition-colors"
            >
              <span>Search all</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-36 shrink-0 space-y-2.5">
                  <Skeleton className="aspect-square w-full rounded-2xl bg-white/5" />
                  <Skeleton className="h-4 w-3/4 bg-white/5" />
                  <Skeleton className="h-3 w-1/2 bg-white/5" />
                </div>
              ))
            ) : trendingSongs.length > 0 ? (
              trendingSongs.slice(0, 10).map((song) => {
                const songImg = getHighResImage(song.image);
                const isCurrent = currentSong?.id === song.id;
                
                return (
                  <div 
                    key={song.id}
                    onClick={() => playSong(song, trendingSongs)}
                    className="group relative w-36 sm:w-40 shrink-0 flex flex-col gap-2 cursor-pointer"
                  >
                    {/* Image container */}
                    <div className="relative aspect-square w-full rounded-[1.5rem] overflow-hidden bg-zinc-950 border border-white/5 shadow-xl shadow-black/40">
                      <img 
                        src={songImg} 
                        alt={song.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                          {isCurrent && isPlaying ? (
                            <Pause size={14} fill="currentColor" />
                          ) : (
                            <Play size={14} fill="currentColor" className="ml-0.5" />
                          )}
                        </div>
                      </div>
                      {isCurrent && (
                        <div className="absolute inset-0 bg-purple-950/40 backdrop-blur-[1px] flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                        </div>
                      )}
                    </div>

                    {/* Text Details matching layout */}
                    <div className="text-left px-1 mt-0.5 min-w-0">
                      <h4 className="font-bold text-xs text-white truncate group-hover:text-purple-300 transition-colors" dangerouslySetInnerHTML={{ __html: song.name }} />
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5" dangerouslySetInnerHTML={{ __html: song.primaryArtists }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground w-full">No active trending tracks.</div>
            )}
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default MusicPage;
"use client";

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song, Playlist, Album } from '@/services/musicApi';
import { AlbumCard } from '@/components/AlbumCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Flame, Music as MusicIcon, Sparkles, Play, Pause, Disc, Calendar, Heart, Volume2, SkipBack, SkipForward, BookOpen, ArrowLeft, Compass, Radio } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '@/context/MusicContext';
import { getHighResImage } from '@/lib/image-utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const MusicPage = () => {
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [curatedPlaylists, setCuratedPlaylists] = useState<Playlist[]>([]);
  const [releases2026, setReleases2026] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    currentSong, isPlaying, playSong, togglePlay, playNext, playPrevious, 
    toggleLike, isLiked, currentTime, duration, seek 
  } = useMusic();
  const navigate = useNavigate();
  const { selectedLanguages } = useMusic();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const primaryLang = selectedLanguages[0] || 'tamil';
        
        // Fetch trending songs for all selected languages
        const trendingPromises = selectedLanguages.map(lang => 
          musicApi.getTrending(lang).catch(() => [] as Song[])
        );
        const trendingResults = await Promise.all(trendingPromises);
        const combinedTrending = trendingResults.flat();
        setTrendingSongs(combinedTrending);

        // Fetch curated playlists dynamically based on selected languages
        const activeLangs = selectedLanguages.length > 0 ? selectedLanguages : ['tamil'];
        const limitPerLang = Math.max(4, Math.floor(12 / activeLangs.length));
        const curatedPromises = activeLangs.map(lang => 
          musicApi.searchPlaylists(`top ${lang}`, 0, limitPerLang).catch(() => [] as Playlist[])
        );
        const curatedResults = await Promise.all(curatedPromises);
        const combinedCurated: Playlist[] = [];
        const maxCuratedLength = Math.max(...curatedResults.map(r => r.length));
        for (let i = 0; i < maxCuratedLength; i++) {
          for (let j = 0; j < curatedResults.length; j++) {
            if (curatedResults[j][i]) {
              combinedCurated.push(curatedResults[j][i]);
            }
          }
        }
        setCuratedPlaylists(combinedCurated.slice(0, 12));

        // Fetch year-wise releases safely
        const r2026 = await musicApi.searchAlbums(`${primaryLang} 2026`).catch(() => []);
        setReleases2026((r2026 || []).slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch content', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedLanguages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}&type=music`);
    }
  };

  // Get featured spotlight song (first trending song or fallback)
  const spotlightSong = trendingSongs[0] || null;
  const spotlightImage = spotlightSong ? getHighResImage(spotlightSong.image) : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1500';
  const spotlightLiked = spotlightSong ? isLiked(spotlightSong.id) : false;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0a0814] text-white p-4 md:p-10 space-y-10">
        
        {/* Header Search Bar with Material Styling */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#141125] p-6 rounded-[2rem] border border-white/5 shadow-xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10 hover:scale-105 active:scale-95"
              title="Back to Hub"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                Music Station <Sparkles className="text-purple-400 animate-pulse" size={20} />
              </h1>
              <p className="text-xs text-purple-300/70 font-medium">Immersive, high-fidelity audio experience.</p>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300/50" size={18} />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search songs, artists, albums..." 
              className="pl-12 pr-4 bg-white/5 border-2 border-transparent focus-visible:border-purple-500/30 rounded-2xl h-12 text-sm text-white placeholder-purple-300/30 transition-all"
            />
          </form>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Spotlight & Top Albums (7/12 width) */}
          <div className="lg:col-span-7 space-y-10 min-w-0">
            
            {/* Spotlight Banner with Ultra-Rounded Material Design */}
            {loading ? (
              <Skeleton className="h-[420px] w-full rounded-[2.5rem]" />
            ) : spotlightSong ? (
              <div className="relative h-[420px] rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#1e1a3a] to-[#0d0b18] border border-purple-500/20 shadow-2xl flex flex-col justify-end p-8 md:p-10 group">
                {/* Background Image with smooth fade */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={spotlightImage} 
                    alt={spotlightSong.name} 
                    className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0814] via-[#0a0814]/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0814] via-transparent to-transparent" />
                </div>

                {/* Spotlight Content */}
                <div className="relative z-10 space-y-5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                      Spotlight Track
                    </Badge>
                    <span className="text-xs text-purple-300/60 font-bold uppercase tracking-wider">
                      {spotlightSong.language} • {spotlightSong.year || '2026'}
                    </span>
                  </div>

                  <h2 
                    className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none drop-shadow-lg"
                    dangerouslySetInnerHTML={{ __html: spotlightSong.name }}
                  />
                  
                  <p 
                    className="text-xs md:text-sm text-purple-200/70 font-medium line-clamp-2 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: `Featuring the brilliant vocals of ${spotlightSong.primaryArtists}. Experience high-fidelity premium streaming directly on your device.` }}
                  />

                  <div className="flex items-center gap-4 pt-2">
                    <button 
                      onClick={() => playSong(spotlightSong, trendingSongs)}
                      className="bg-purple-500 text-white hover:bg-purple-600 px-8 py-4 rounded-full font-black text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-xl shadow-purple-500/25 flex items-center gap-2"
                    >
                      <Play size={16} fill="currentColor" />
                      Play Now
                    </button>
                    
                    <button 
                      onClick={() => toggleLike(spotlightSong)}
                      className={cn(
                        "p-4 rounded-full border transition-all hover:scale-105 active:scale-95",
                        spotlightLiked 
                          ? "bg-purple-500/20 border-purple-500/40 text-purple-300" 
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <Heart size={16} fill={spotlightLiked ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[420px] rounded-[2.5rem] bg-[#141125] border border-white/5 flex items-center justify-center text-muted-foreground text-sm">
                No spotlight track available.
              </div>
            )}

            {/* Top Albums Row */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-purple-300 uppercase tracking-widest flex items-center gap-2">
                  <Disc size={16} className="text-purple-400" />
                  Top Albums
                </h3>
                <button onClick={() => navigate('/featured')} className="text-xs font-bold text-purple-400 hover:underline">See All</button>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-[180px] shrink-0 space-y-3">
                      <Skeleton className="aspect-square w-full rounded-[2rem]" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))
                ) : releases2026.length > 0 ? (
                  releases2026.map((album) => (
                    <div key={album.id} className="w-[160px] md:w-[180px] shrink-0">
                      <AlbumCard album={album} />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No albums found.</p>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Play Lists & Mini Player Widget (5/12 width) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Play Lists Queue with Material Styling */}
            <div className="bg-[#141125] border border-purple-500/10 rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-xl">
              <h3 className="text-sm font-black text-purple-300 uppercase tracking-widest flex items-center gap-2">
                <Compass size={16} className="text-purple-400" />
                Trending Queue
              </h3>
              
              <div className="space-y-3 max-h-[360px] overflow-y-auto no-scrollbar pr-1">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-2.5 w-1/3" />
                      </div>
                    </div>
                  ))
                ) : trendingSongs.length > 0 ? (
                  trendingSongs.slice(0, 6).map((song, index) => {
                    const isCurrent = currentSong?.id === song.id;
                    const songImage = getHighResImage(song.image);
                    
                    return (
                      <div 
                        key={song.id}
                        onClick={() => playSong(song, trendingSongs)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all group",
                          isCurrent 
                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" 
                            : "hover:bg-white/5 text-purple-200/80 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={cn(
                            "text-xs font-bold w-5 text-center shrink-0",
                            isCurrent ? "text-white/70" : "text-purple-300/40"
                          )}>
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                          
                          <img 
                            src={songImage} 
                            alt={song.name} 
                            className="w-12 h-12 rounded-xl object-cover bg-zinc-800 shrink-0 shadow-md"
                          />
                          
                          <div className="min-w-0">
                            <p 
                              className="text-xs font-bold truncate"
                              dangerouslySetInnerHTML={{ __html: song.name }}
                            />
                            <p 
                              className={cn(
                                "text-[10px] truncate mt-0.5",
                                isCurrent ? "text-white/70" : "text-purple-300/50"
                              )}
                              dangerouslySetInnerHTML={{ __html: song.primaryArtists }}
                            />
                          </div>
                        </div>

                        <button 
                          className={cn(
                            "p-2.5 rounded-full shrink-0 transition-all",
                            isCurrent 
                              ? "bg-white text-purple-600" 
                              : "bg-white/5 text-white opacity-0 group-hover:opacity-100 hover:bg-white/10"
                          )}
                        >
                          {isCurrent && isPlaying ? (
                            <Pause size={12} fill="currentColor" />
                          ) : (
                            <Play size={12} fill="currentColor" className="ml-0.5" />
                          )}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-8">No tracks available.</p>
                )}
              </div>
            </div>

            {/* Mini Player Widget with Material Design */}
            {currentSong && (
              <div className="bg-gradient-to-br from-[#1e1a3a] to-[#141125] border border-purple-500/20 rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-2xl">
                <div className="flex items-center gap-4">
                  <img 
                    src={getHighResImage(currentSong.image)} 
                    alt={currentSong.name} 
                    className="w-16 h-16 rounded-2xl object-cover bg-zinc-800 shadow-lg shrink-0 border border-white/10"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 
                      className="font-bold text-sm text-white truncate"
                      dangerouslySetInnerHTML={{ __html: currentSong.name }}
                    />
                    <p 
                      className="text-xs text-purple-300/70 truncate mt-0.5"
                      dangerouslySetInnerHTML={{ __html: currentSong.primaryArtists }}
                    />
                  </div>
                  <button 
                    onClick={() => toggleLike(currentSong)}
                    className={cn(
                      "p-3 rounded-full transition-colors shrink-0 hover:scale-105 active:scale-95",
                      isLiked(currentSong.id) ? "text-purple-300 bg-purple-500/20" : "text-purple-300/50 hover:text-white"
                    )}
                  >
                    <Heart size={18} fill={isLiked(currentSong.id) ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* Progress Slider */}
                <div className="space-y-2">
                  <div 
                    className="relative h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = (e.clientX - rect.left) / rect.width;
                      seek(pos * duration);
                    }}
                  >
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-purple-300/60">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-center gap-6 pt-1">
                  <button 
                    onClick={() => playPrevious()}
                    className="text-purple-300/60 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                  >
                    <SkipBack size={20} fill="currentColor" />
                  </button>
                  
                  <button 
                    onClick={togglePlay}
                    className="bg-white text-purple-950 p-4 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-xl"
                  >
                    {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
                  </button>
                  
                  <button 
                    onClick={() => playNext()}
                    className="text-purple-300/60 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                  >
                    <SkipForward size={20} fill="currentColor" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default MusicPage;
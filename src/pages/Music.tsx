"use client";

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song, Playlist, Album } from '@/services/musicApi';
import { AlbumCard } from '@/components/AlbumCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Flame, Music as MusicIcon, Sparkles, Play, Pause, Disc, Calendar, Heart, Volume2, SkipBack, SkipForward, BookOpen, ArrowLeft } from 'lucide-react';
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
  }, []);

  const { selectedLanguages } = useMusic();

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
      <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8">
        {/* Header Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10"
              title="Back to Hub"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Music Dashboard</h1>
              <p className="text-xs text-muted-foreground">Premium, minimalistic audio control center.</p>
            </div>
          </div>
          <form onSubmit={handleSearch} className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search songs, artists, albums..." 
              className="pl-9 bg-accent/5 border-none focus-visible:ring-primary/20 rounded-xl h-10 text-sm"
            />
          </form>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Spotlight & Top Albums (7/12 width) */}
          <div className="lg:col-span-7 space-y-8 min-w-0">
            
            {/* Spotlight Banner */}
            {loading ? (
              <Skeleton className="h-[380px] w-full rounded-3xl" />
            ) : spotlightSong ? (
              <div className="relative h-[380px] rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/5 shadow-2xl flex flex-col justify-end p-6 md:p-8 group">
                {/* Background Image with smooth fade */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={spotlightImage} 
                    alt={spotlightSong.name} 
                    className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
                </div>

                {/* Spotlight Content */}
                <div className="relative z-10 space-y-4 max-w-lg">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/20 text-primary border-none text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      Spotlight Track
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      {spotlightSong.language} • {spotlightSong.year || '2026'}
                    </span>
                  </div>

                  <h2 
                    className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none"
                    dangerouslySetInnerHTML={{ __html: spotlightSong.name }}
                  />
                  
                  <p 
                    className="text-xs text-zinc-400 font-medium line-clamp-2 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: `Featuring the brilliant vocals of ${spotlightSong.primaryArtists}. Experience high-fidelity premium streaming directly on your device.` }}
                  />

                  <div className="flex items-center gap-3 pt-2">
                    <button 
                      onClick={() => playSong(spotlightSong, trendingSongs)}
                      className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold text-xs hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                      <Play size={14} fill="currentColor" />
                      Play Now
                    </button>
                    
                    <button 
                      onClick={() => toggleLike(spotlightSong)}
                      className={cn(
                        "p-3 rounded-full border transition-all",
                        spotlightLiked 
                          ? "bg-primary/10 border-primary/30 text-primary" 
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <Heart size={14} fill={spotlightLiked ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[380px] rounded-3xl bg-zinc-900/50 border border-white/5 flex items-center justify-center text-muted-foreground text-sm">
                No spotlight track available.
              </div>
            )}

            {/* Top Albums Row */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white tracking-tight uppercase tracking-wider text-xs">Top Albums</h3>
                <button onClick={() => navigate('/featured')} className="text-xs font-bold text-primary hover:underline">See All</button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-[160px] shrink-0 space-y-3">
                      <Skeleton className="aspect-square w-full rounded-2xl" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))
                ) : releases2026.length > 0 ? (
                  releases2026.map((album) => (
                    <div key={album.id} className="w-[150px] md:w-[160px] shrink-0">
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
          <div className="lg:col-span-5 space-y-6">
            
            {/* Play Lists Queue */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Play Lists</h3>
              
              <div className="space-y-2 max-h-[320px] overflow-y-auto no-scrollbar pr-1">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="w-10 h-10 rounded-lg" />
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
                          "flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all group",
                          isCurrent 
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                            : "hover:bg-white/5 text-zinc-300 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={cn(
                            "text-xs font-bold w-5 text-center shrink-0",
                            isCurrent ? "text-primary-foreground/70" : "text-zinc-500"
                          )}>
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                          
                          <img 
                            src={songImage} 
                            alt={song.name} 
                            className="w-10 h-10 rounded-xl object-cover bg-zinc-800 shrink-0"
                          />
                          
                          <div className="min-w-0">
                            <p 
                              className="text-xs font-bold truncate"
                              dangerouslySetInnerHTML={{ __html: song.name }}
                            />
                            <p 
                              className={cn(
                                "text-[10px] truncate mt-0.5",
                                isCurrent ? "text-primary-foreground/70" : "text-zinc-500"
                              )}
                              dangerouslySetInnerHTML={{ __html: song.primaryArtists }}
                            />
                          </div>
                        </div>

                        <button 
                          className={cn(
                            "p-2 rounded-full shrink-0 transition-all",
                            isCurrent 
                              ? "bg-white text-primary" 
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

            {/* Mini Player Widget */}
            {currentSong && (
              <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-5 space-y-4 shadow-2xl">
                <div className="flex items-center gap-4">
                  <img 
                    src={getHighResImage(currentSong.image)} 
                    alt={currentSong.name} 
                    className="w-14 h-14 rounded-2xl object-cover bg-zinc-800 shadow-lg shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 
                      className="font-bold text-sm text-white truncate"
                      dangerouslySetInnerHTML={{ __html: currentSong.name }}
                    />
                    <p 
                      className="text-xs text-muted-foreground truncate mt-0.5"
                      dangerouslySetInnerHTML={{ __html: currentSong.primaryArtists }}
                    />
                  </div>
                  <button 
                    onClick={() => toggleLike(currentSong)}
                    className={cn(
                      "p-2.5 rounded-full transition-colors shrink-0",
                      isLiked(currentSong.id) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-white"
                    )}
                  >
                    <Heart size={16} fill={isLiked(currentSong.id) ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* Progress Slider */}
                <div className="space-y-1.5">
                  <div 
                    className="relative h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = (e.clientX - rect.left) / rect.width;
                      seek(pos * duration);
                    }}
                  >
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-center gap-6 pt-1">
                  <button 
                    onClick={() => playPrevious()}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    <SkipBack size={18} fill="currentColor" />
                  </button>
                  
                  <button 
                    onClick={togglePlay}
                    className="bg-white text-black p-3.5 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-lg"
                  >
                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                  </button>
                  
                  <button 
                    onClick={() => playNext()}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    <SkipForward size={18} fill="currentColor" />
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
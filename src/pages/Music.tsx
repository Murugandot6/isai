"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song } from '@/services/musicApi';
import { useMusic } from '@/context/MusicContext';
import { useAuth } from '@/context/AuthContext';
import { getHighResImage } from '@/lib/image-utils';
import { FEATURED_PLAYLISTS } from '@/data/featuredPlaylists';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Play, Pause, Home, Music, Film, Radio, Disc, Search, Heart, 
  Sparkles, Power, Volume2, VolumeX, ArrowRight, User, Star, Library, ChevronRight, Compass, Shuffle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ListenTogether } from '@/components/ListenTogether';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

const MusicPage = () => {
  const navigate = useNavigate();
  const { selectedLanguages, currentSong, isPlaying, playSong, togglePlay, playRandom } = useMusic();
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to sort songs by their release date or year in descending order (Newest first)
  const sortSongsByReleaseTime = (songsList: Song[]) => {
    return [...songsList].sort((a, b) => {
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      
      if (dateA !== dateB && dateA > 0 && dateB > 0) {
        return dateB - dateA;
      }
      
      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;
      return yearB - yearA;
    });
  };

  const [rahmanSongs, setRahmanSongs] = useState<Song[]>([]);
  const [yuvanSongs, setYuvanSongs] = useState<Song[]>([]);
  const [harrisSongs, setHarrisSongs] = useState<Song[]>([]);
  const [vairamuthuSongs, setVairamuthuSongs] = useState<Song[]>([]);

  useEffect(() => {
    const fetchMusicAndArtists = async () => {
      setLoading(true);
      try {
        const trendingPromises = selectedLanguages.map(lang => 
          musicApi.getTrending(lang).catch(() => [] as Song[])
        );
        const results = await Promise.all(trendingPromises);
        const combined = results.flat();
        
        let finalTrending: Song[] = [];
        if (combined.length === 0) {
          const fallback = await musicApi.getTrending('tamil');
          finalTrending = sortSongsByReleaseTime(fallback);
        } else {
          finalTrending = sortSongsByReleaseTime(combined);
        }
        setTrendingSongs(finalTrending);

        const [rahman, yuvan, harris, vairamuthu] = await Promise.all([
          musicApi.searchSongs("A.R. Rahman", 1, 40).catch(() => []),
          musicApi.searchSongs("Yuvan Shankar Raja", 1, 40).catch(() => []),
          musicApi.searchSongs("Harris Jayaraj", 1, 40).catch(() => []),
          musicApi.searchSongs("Vairamuthu Hits", 1, 40).catch(() => [])
        ]);

        const filterAndSortByLanguage = (songsList: Song[]) => {
          const filtered = songsList.filter(song => {
            if (!song.language) return false;
            return selectedLanguages.includes(song.language.toLowerCase().trim());
          });
          return sortSongsByReleaseTime(filtered);
        };

        setRahmanSongs(filterAndSortByLanguage(rahman).slice(0, 12));
        setYuvanSongs(filterAndSortByLanguage(yuvan).slice(0, 12));
        setHarrisSongs(filterAndSortByLanguage(harris).slice(0, 12));
        setVairamuthuSongs(filterAndSortByLanguage(vairamuthu).slice(0, 12));

      } catch (err) {
        console.error("Failed to load music data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMusicAndArtists();
  }, [selectedLanguages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&type=music`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

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

  const editorsPicks = useMemo(() => FEATURED_PLAYLISTS.slice(0, 5), []);

  return (
    <MainLayout>
      <div className="min-h-screen relative flex flex-col select-none text-white bg-black">
        
        {/* Background Hero Image */}
        {spotlightSong && (
          <div className="absolute right-0 top-0 w-full lg:w-3/5 h-[620px] z-0 select-none pointer-events-none overflow-hidden rounded-l-[3rem]">
            <img 
              src={spotlightImage} 
              alt={spotlightSong.name} 
              className="w-full h-full object-cover object-center opacity-35 lg:opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}

        {/* HEADER MENU */}
        <div className="flex items-center justify-between p-6 md:px-12 z-20 gap-4 bg-transparent">
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
            <button onClick={() => navigate('/')} className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all">
              <Home size={18} />
            </button>
            <button onClick={() => playRandom()} className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2">
              <Shuffle size={18} className="text-purple-400" />
              <span className="hidden sm:inline text-[10px] font-black uppercase tracking-wider">Play Random</span>
            </button>
            <LanguageSelector />
          </div>

          <div className="flex items-center gap-3">
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogTrigger asChild>
                <button className="p-3 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                  <Search size={20} />
                </button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-white/10 max-w-[90vw] sm:max-w-md rounded-3xl text-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black">Search Music</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <Input 
                      type="text"
                      placeholder="Search for songs, artists, albums..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-11 pr-4 bg-white/5 border-none h-12 rounded-xl text-white text-sm font-medium focus-visible:ring-2 focus-visible:ring-purple-500/20"
                      autoFocus
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-700 text-white">Search</Button>
                </form>
              </DialogContent>
            </Dialog>
            <ListenTogether />
          </div>
        </div>

        {/* SPOTLIGHT BANNER */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-12 relative min-h-[420px] py-12">
          <div className="relative z-10 max-w-xl space-y-4 md:space-y-6 text-left">
            <span className="text-xs md:text-sm font-black uppercase tracking-[0.25em] text-purple-400 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-purple-500 rounded-full" />
              Audio Station
            </span>

            {spotlightSong && (
              <>
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-xl select-text animate-in fade-in duration-500" dangerouslySetInnerHTML={{ __html: spotlightSong.name }} />
                <div className="space-y-1">
                  <p className="text-sm md:text-base text-zinc-300 font-semibold leading-relaxed drop-shadow" dangerouslySetInnerHTML={{ __html: spotlightSong.primaryArtists || (spotlightSong as any).subtitle || 'Unknown Artist' }} />
                  {spotlightSong.album?.name && (
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Album: <span className="text-zinc-400" dangerouslySetInnerHTML={{ __html: spotlightSong.album.name }} /></p>
                  )}
                </div>
              </>
            )}

            <div className="flex items-center gap-3.5 pt-4">
              <button 
                onClick={handleSpotlightPlay}
                className="group flex items-center gap-4 bg-white/10 hover:bg-white/20 text-white pl-6 pr-4 py-3 rounded-full border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/55"
              >
                <span className="text-xs font-black uppercase tracking-widest text-white/90">
                  {currentSong?.id === spotlightSong?.id && isPlaying ? 'Pause' : 'Play'}
                </span>
                <div className="bg-primary text-primary-foreground p-2 rounded-full">
                  {currentSong?.id === spotlightSong?.id && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="px-6 md:px-12 py-10 space-y-16 relative z-10 max-w-7xl mx-auto w-full">
          
          {/* NEW RELEASES SECTION (MOVED TO TOP) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-600/20 rounded-xl border border-purple-500/30 animate-pulse">
                  <Sparkles size={18} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-white">New Releases</h3>
                  <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest mt-0.5">The latest drops from your preferred languages</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/search?q=&type=music')}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 hover:text-purple-300 transition-colors border border-purple-500/20 px-4 py-2 rounded-full bg-purple-500/5"
              >
                View Library
              </button>
            </div>

            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar pt-2">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-36 sm:w-44 shrink-0 space-y-3">
                    <Skeleton className="aspect-square w-full rounded-2xl bg-white/5" />
                    <Skeleton className="h-4 w-3/4 bg-white/5" />
                    <Skeleton className="h-3 w-1/2 bg-white/5" />
                  </div>
                ))
              ) : trendingSongs.length > 0 ? (
                trendingSongs.slice(0, 20).map((song) => {
                  const songImg = getHighResImage(song.image);
                  const isCurrent = currentSong?.id === song.id;
                  return (
                    <div 
                      key={song.id}
                      onClick={() => playSong(song, trendingSongs)}
                      className="group relative w-36 sm:w-44 shrink-0 flex flex-col gap-3 cursor-pointer"
                    >
                      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-zinc-950 border border-white/5 shadow-2xl shadow-black/40">
                        <img src={songImg} alt={song.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                            {isCurrent && isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                          </div>
                        </div>
                        {isCurrent && <div className="absolute inset-0 bg-purple-950/40 backdrop-blur-[1px] flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-purple-400 animate-ping" /></div>}
                        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-black text-purple-400 border border-white/10 uppercase">
                          {song.year || 'NEW'}
                        </div>
                      </div>
                      <div className="text-left px-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-purple-400 transition-colors" dangerouslySetInnerHTML={{ __html: song.name }} />
                        <p className="text-[10px] sm:text-xs text-zinc-500 font-bold truncate mt-0.5" dangerouslySetInnerHTML={{ __html: song.primaryArtists }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center text-xs text-muted-foreground w-full border-2 border-dashed border-white/5 rounded-3xl">No tracks found for selected languages.</div>
              )}
            </div>
          </div>

          {/* EDITOR'S PICK ROW */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black tracking-widest uppercase text-white/60 flex items-center gap-2">
                <Star size={12} className="text-yellow-400" />
                Editor's Pick Playlists
              </h3>
              <button onClick={() => navigate('/featured')} className="text-xs font-bold text-purple-300 hover:text-purple-400 flex items-center gap-1">
                <span>View All</span>
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar">
              {editorsPicks.map((playlist) => (
                <div key={playlist.id} onClick={() => navigate(`/playlist/${playlist.id}`)} className="group relative w-48 sm:w-56 shrink-0 aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-white/5 transition-all hover:-translate-y-1">
                  <img src={getHighResImage(playlist.image)} alt={playlist.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                    <h4 className="text-white font-black text-sm sm:text-base truncate" dangerouslySetInnerHTML={{ __html: playlist.title }} />
                    <p className="text-white/60 text-[9px] font-bold uppercase mt-1 tracking-wider">{playlist.subtitle || 'Playlist'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LEGENDARY ARTIST ROWS */}
          {[
            { title: 'A.R. Rahman Hits', songs: rahmanSongs, color: 'text-cyan-400' },
            { title: 'Yuvan Shankar Raja Hits', songs: yuvanSongs, color: 'text-purple-400' },
            { title: 'Harris Jayaraj Hits', songs: harrisSongs, color: 'text-emerald-400' },
            { title: 'Vairamuthu Melodies', songs: vairamuthuSongs, color: 'text-amber-400' }
          ].map((section, idx) => section.songs.length > 0 && (
            <div key={idx} className="space-y-4">
              <h3 className={cn("text-xs font-black tracking-widest uppercase text-white/60 flex items-center gap-1.5")}>
                <Compass size={13} className={section.color} />
                {section.title}
              </h3>
              <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar">
                {section.songs.map((song) => {
                  const isCurrent = currentSong?.id === song.id;
                  return (
                    <div key={song.id} onClick={() => playSong(song, section.songs)} className="group relative w-36 sm:w-40 shrink-0 flex flex-col gap-2 cursor-pointer">
                      <div className="relative aspect-square w-full rounded-[1.5rem] overflow-hidden bg-zinc-950 border border-white/5 shadow-xl">
                        <img src={getHighResImage(song.image)} alt={song.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                            {isCurrent && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                          </div>
                        </div>
                        {isCurrent && <div className="absolute inset-0 bg-purple-950/40 backdrop-blur-[1px] flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" /></div>}
                      </div>
                      <div className="text-left px-1 mt-0.5 min-w-0">
                        <h4 className="font-bold text-xs text-white truncate" dangerouslySetInnerHTML={{ __html: song.name }} />
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5" dangerouslySetInnerHTML={{ __html: song.primaryArtists }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        </div>
      </div>
    </MainLayout>
  );
};

export default MusicPage;
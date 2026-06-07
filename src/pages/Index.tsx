"use client";

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song, Playlist, Album } from '@/services/musicApi';
import { SongCard } from '@/components/SongCard';
import { AlbumCard } from '@/components/AlbumCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Bell, Settings, TrendingUp, Sparkles, Play, Disc, Calendar, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '@/context/MusicContext';
import { getHighResImage } from '@/lib/image-utils';

const FEATURED_PLAYLIST_IDS = [
  'R2ISZzIDGJc_', // Semma Mass Tamil
  '1133105280',   // Tamil Hit Songs
  '1134651042',   // Tamil: India Superhits Top 50
  '1074590003',   // Tamil BGM
  '804092154',    // Sad Love - Tamil
];

const DECADE_PLAYLIST_IDS = [
  '1170578788',   // Tamil 2010s
  '1170578783',   // Tamil 2000s
  '1170578779',   // Tamil 1990s
  '901538755',    // Tamil 1980s
  '901538753',    // Tamil 1970s
  '901538752',    // Tamil 1960s
];

const MOVIE_ALBUM_IDS = [
  '41106332',     // Varisu
  '58371017',     // Devara Part 1
  '49222302',     // Ordinary Person (Leo)
  '1251943',      // Maari
  '1017243',      // 3
  '1656877',      // Thangamagan
  '1106479',      // Ethir Neechal
];

const Index = () => {
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([]);
  const [decadePlaylists, setDecadePlaylists] = useState<Playlist[]>([]);
  const [movieAlbums, setMovieAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { playSong, selectedLanguages } = useMusic();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [trendingData, featuredData, decadesData, albumsData] = await Promise.all([
          musicApi.getTrending(selectedLanguages.join(',')),
          Promise.all(FEATURED_PLAYLIST_IDS.map(id => musicApi.getPlaylistDetails(id))),
          Promise.all(DECADE_PLAYLIST_IDS.map(id => musicApi.getPlaylistDetails(id))),
          Promise.all(MOVIE_ALBUM_IDS.map(id => musicApi.getAlbumDetails(id)))
        ]);
        
        setTrendingSongs(trendingData);
        setFeaturedPlaylists(featuredData.filter(p => p !== null) as Playlist[]);
        setDecadePlaylists(decadesData.filter(p => p !== null) as Playlist[]);
        setMovieAlbums(albumsData.filter(a => a !== null) as Album[]);
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
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const getCount = (item: any) => {
    if (item.songCount && parseInt(item.songCount) > 0) return item.songCount;
    if (item.song_count && parseInt(item.song_count) > 0) return item.song_count;
    if (item.more_info?.song_count && parseInt(item.more_info.song_count) > 0) return item.more_info.song_count;
    return (item.songs ? item.songs.length : 0).toString();
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-1 tracking-tight flex items-center gap-2">
              anbae
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Bringing people together through music.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search songs, movies..." 
                className="pl-9 bg-accent/5 border-none focus-visible:ring-primary/20 rounded-xl h-10 text-sm"
              />
            </form>
            <button className="p-2.5 bg-accent/5 rounded-xl hover:bg-accent/10 transition-colors shrink-0"><Bell size={18} /></button>
            <button className="p-2.5 bg-accent/5 rounded-xl hover:bg-accent/10 transition-colors shrink-0" onClick={() => navigate('/profile')}><Settings size={18} /></button>
          </div>
        </div>

        {/* Hero Banner */}
        <div 
          className="relative h-[280px] sm:h-[360px] md:h-[420px] rounded-3xl overflow-hidden mb-10 md:mb-16 group cursor-pointer shadow-2xl transition-all duration-500 hover:shadow-primary/10"
          onClick={() => trendingSongs.length > 0 && playSong(trendingSongs[0], trendingSongs)}
        >
          <img 
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop" 
            alt="Music Hero" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end p-6 md:p-12">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-primary text-white text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Users size={10} /> Live Sync
              </span>
              <Badge variant="outline" className="text-white border-white/20 text-[9px] font-bold uppercase py-0">Listen together, anywhere</Badge>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter leading-tight">Listen together, anywhere, anytime</h2>
            <p className="text-white/70 max-w-md text-xs md:text-sm leading-relaxed mb-4 md:mb-6 line-clamp-2 sm:line-clamp-none">Synchronize your music stream in real-time with friends. Seamless social auditory experiences await.</p>
            <button className="bg-primary text-white px-6 md:px-10 py-2.5 md:py-4 rounded-full font-bold text-xs md:text-sm hover:scale-105 transition-all w-fit shadow-xl shadow-primary/30 flex items-center gap-2">
              <Play size={14} fill="currentColor" />
              Listen Now
            </button>
          </div>
        </div>

        {/* Featured Playlists */}
        <section className="mb-10 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-500/20 p-2 rounded-xl">
              <Sparkles className="text-purple-500" size={18} />
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight">Featured Playlists</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-36 md:h-48 w-full rounded-3xl" />
              ))
            ) : (
              featuredPlaylists.map((playlist) => (
                <div 
                  key={playlist.id}
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="group relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer shadow-lg transition-all hover:-translate-y-1"
                >
                  <img 
                    src={getHighResImage(playlist.image)} 
                    alt={playlist.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 md:p-6 flex flex-col justify-end">
                    <h4 className="text-white font-black text-base md:text-xl mb-0.5 md:mb-1 truncate" dangerouslySetInnerHTML={{ __html: playlist.name }}></h4>
                    <p className="text-white/60 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                      {getCount(playlist)} Tracks
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Movie Albums */}
        <section className="mb-10 md:mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-xl">
                <Disc className="text-blue-500" size={18} />
              </div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight">Tamil Movie Hits</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 md:gap-6">
            {loading ? (
              Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))
            ) : (
              movieAlbums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))
            )}
          </div>
        </section>

        {/* Decades Section */}
        <section className="mb-10 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500/20 p-2 rounded-xl">
              <Calendar className="text-orange-500" size={18} />
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight">Tamil Through the Decades</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 md:h-32 w-full rounded-2xl" />
              ))
            ) : (
              decadePlaylists.map((playlist) => (
                <div 
                  key={playlist.id}
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="group relative h-24 md:h-32 rounded-2xl overflow-hidden cursor-pointer shadow-md transition-all hover:scale-105"
                >
                  <img 
                    src={getHighResImage(playlist.image)} 
                    alt={playlist.name} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-3 text-center">
                    <h4 className="text-white font-black text-xs md:text-sm uppercase tracking-widest" dangerouslySetInnerHTML={{ __html: playlist.name }}></h4>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Trending Songs */}
        <section className="mb-10 md:mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/20 p-2 rounded-xl">
                <TrendingUp className="text-red-500" size={18} />
              </div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight">Trending Now</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))
            ) : (
              trendingSongs.slice(0, 15).map((song) => (
                <SongCard key={song.id} song={song} allSongs={trendingSongs} />
              ))
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Index;
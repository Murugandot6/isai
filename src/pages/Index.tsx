"use client";

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song, Playlist, Album } from '@/services/musicApi';
import { SongCard } from '@/components/SongCard';
import { AlbumCard } from '@/components/AlbumCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Bell, Settings, TrendingUp, Sparkles, ListMusic, Play, Disc, Calendar, Heart } from 'lucide-react';
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

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight">Vanakkam,</h1>
            <p className="text-muted-foreground font-medium">Your ultimate Tamil music destination.</p>
          </div>
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search songs, movies..." 
                className="pl-10 bg-accent/5 border-none focus-visible:ring-primary/20 rounded-xl"
              />
            </form>
            <button className="p-2.5 bg-accent/5 rounded-xl hover:bg-accent/10 transition-colors"><Bell size={20} /></button>
            <button className="p-2.5 bg-accent/5 rounded-xl hover:bg-accent/10 transition-colors"><Settings size={20} /></button>
          </div>
        </div>

        {/* Hero Banner */}
        <div 
          className="relative h-[400px] rounded-3xl overflow-hidden mb-16 group cursor-pointer shadow-2xl transition-all duration-500 hover:shadow-primary/10"
          onClick={() => trendingSongs.length > 0 && playSong(trendingSongs[0], trendingSongs)}
        >
          <img 
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop" 
            alt="Music Hero" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full">Trending</span>
              <Badge variant="outline" className="text-white border-white/20 text-[10px] font-bold uppercase">Tamil Superhits</Badge>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">Semma Mass Tamil Hits</h2>
            <p className="text-white/70 max-w-md text-sm leading-relaxed mb-8">The biggest chart-busters and viral melodies from Kollywood, updated daily.</p>
            <button className="bg-primary text-white px-10 py-4 rounded-full font-bold text-sm hover:scale-105 transition-all w-fit shadow-xl shadow-primary/30 flex items-center gap-2">
              <Play size={18} fill="currentColor" />
              Listen Now
            </button>
          </div>
        </div>

        {/* Featured Playlists */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-purple-500/20 p-2 rounded-xl">
              <Sparkles className="text-purple-500" size={20} />
            </div>
            <h3 className="text-2xl font-black tracking-tight">Featured Playlists</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-3xl" />
              ))
            ) : (
              featuredPlaylists.map((playlist) => (
                <div 
                  key={playlist.id}
                  onClick={() => playlist.songs && playlist.songs.length > 0 && playSong(playlist.songs[0], playlist.songs)}
                  className="group relative aspect-[16/9] rounded-3xl overflow-hidden cursor-pointer shadow-lg transition-all hover:-translate-y-1"
                >
                  <img 
                    src={getHighResImage(playlist.image)} 
                    alt={playlist.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                    <h4 className="text-white font-black text-xl mb-1" dangerouslySetInnerHTML={{ __html: playlist.name }}></h4>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{playlist.songCount} Tracks</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Movie Albums */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-xl">
                <Disc className="text-blue-500" size={20} />
              </div>
              <h3 className="text-2xl font-black tracking-tight">Tamil Movie Hits</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
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
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-orange-500/20 p-2 rounded-xl">
              <Calendar className="text-orange-500" size={20} />
            </div>
            <h3 className="text-2xl font-black tracking-tight">Tamil Through the Decades</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))
            ) : (
              decadePlaylists.map((playlist) => (
                <div 
                  key={playlist.id}
                  onClick={() => playlist.songs && playlist.songs.length > 0 && playSong(playlist.songs[0], playlist.songs)}
                  className="group relative h-32 rounded-2xl overflow-hidden cursor-pointer shadow-md transition-all hover:scale-105"
                >
                  <img 
                    src={getHighResImage(playlist.image)} 
                    alt={playlist.name} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4 text-center">
                    <h4 className="text-white font-black text-sm uppercase tracking-widest" dangerouslySetInnerHTML={{ __html: playlist.name }}></h4>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Trending Songs */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/20 p-2 rounded-xl">
                <TrendingUp className="text-red-500" size={20} />
              </div>
              <h3 className="text-2xl font-black tracking-tight">Trending Now</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
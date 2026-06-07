"use client";

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song, Playlist } from '@/services/musicApi';
import { SongCard } from '@/components/SongCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Bell, Settings, TrendingUp, Sparkles, ListMusic, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '@/context/MusicContext';
import { getHighResImage } from '@/lib/image-utils';

const FEATURED_PLAYLIST_IDS = [
  'R2ISZzIDGJc_', // Semma Mass Tamil
  '1170578779',   // Tamil 1990s
  '1170578783',   // Tamil 2000s
  '1133105280',   // Tamil Hit Songs
];

const Index = () => {
  const [featuredSongs, setFeaturedSongs] = useState<Song[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { playSong, selectedLanguages } = useMusic();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [trendingData, playlistsData] = await Promise.all([
          musicApi.getTrending(selectedLanguages.join(',')),
          Promise.all(FEATURED_PLAYLIST_IDS.map(id => musicApi.getPlaylistDetails(id)))
        ]);

        const primaryLang = selectedLanguages[0] || 'tamil';
        const featuredData = await musicApi.searchSongs(`${primaryLang} hits`);
        
        setTrendingSongs(trendingData);
        setFeaturedSongs(featuredData);
        setFeaturedPlaylists(playlistsData.filter(p => p !== null) as Playlist[]);
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

  const navigateToSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight">Vanakkam,</h1>
            <p className="text-muted-foreground font-medium">Your personalized soundtrack for today.</p>
          </div>
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search songs..." 
                className="pl-10 bg-accent/5 border-none focus-visible:ring-primary/20 rounded-xl"
              />
            </form>
            <button className="p-2.5 bg-accent/5 rounded-xl hover:bg-accent/10 transition-colors"><Bell size={20} /></button>
            <button className="p-2.5 bg-accent/5 rounded-xl hover:bg-accent/10 transition-colors"><Settings size={20} /></button>
          </div>
        </div>

        <div 
          className="relative h-[350px] rounded-3xl overflow-hidden mb-16 group cursor-pointer shadow-2xl transition-all duration-500 hover:shadow-primary/10"
          onClick={() => trendingSongs.length > 0 && playSong(trendingSongs[0], trendingSongs)}
        >
          <img 
            src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop" 
            alt="Music Hero" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full">Featured</span>
              <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/10">New Release</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">Global Hits & Melodies</h2>
            <p className="text-white/70 max-w-md text-sm leading-relaxed mb-8">Experience the most streamed tracks across your favorite languages.</p>
            <button className="bg-primary text-white px-10 py-4 rounded-full font-bold text-sm hover:scale-105 transition-all w-fit shadow-xl shadow-primary/30">Listen Now</button>
          </div>
        </div>

        {/* Featured Playlists Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-purple-500/20 p-2 rounded-xl">
              <ListMusic className="text-purple-500" size={20} />
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
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={16} fill="white" className="text-white" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-xl">
                <Sparkles className="text-primary" size={20} />
              </div>
              <h3 className="text-2xl font-black tracking-tight capitalize">{selectedLanguages[0] || 'Tamil'} Hits</h3>
            </div>
            <button 
              onClick={() => navigateToSearch(`${selectedLanguages[0] || 'Tamil'} hits`)}
              className="text-xs font-bold text-primary hover:underline underline-offset-4"
            >
              VIEW ALL
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : (
              featuredSongs.slice(0, 10).map((song) => (
                <SongCard key={song.id} song={song} allSongs={featuredSongs} />
              ))
            )}
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/20 p-2 rounded-xl">
                <TrendingUp className="text-orange-500" size={20} />
              </div>
              <h3 className="text-2xl font-black tracking-tight">Trending Now</h3>
            </div>
            <button 
              onClick={() => navigateToSearch('trending')}
              className="text-xs font-bold text-primary hover:underline underline-offset-4"
            >
              EXPLORE ALL
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : (
              trendingSongs.slice(0, 10).map((song) => (
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
"use client";

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song } from '@/services/musicApi';
import { SongCard } from '@/components/SongCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Bell, Settings, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [newReleases, setNewReleases] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNewReleases = async () => {
      setLoading(true);
      try {
        // Fetching specifically latest Tamil releases
        const data = await musicApi.searchSongs('Tamil latest releases 2024');
        setNewReleases(data);
      } catch (error) {
        console.error('Failed to fetch new releases', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNewReleases();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-4xl font-black tracking-tight">Vanakkam,</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none animate-pulse">
                NEW RELEASES
              </Badge>
            </div>
            <p className="text-muted-foreground font-medium">Fresh tracks from Kollywood, updated daily.</p>
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

        {/* Featured Hero */}
        <div className="relative h-[300px] rounded-3xl overflow-hidden mb-12 group cursor-pointer shadow-2xl transition-all duration-500 hover:shadow-primary/10">
          <img 
            src="https://images.unsplash.com/photo-1514525253361-bee8a19740c1?q=80&w=2070&auto=format&fit=crop" 
            alt="New Tamil Releases" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-primary fill-primary" />
              <span className="bg-primary/20 backdrop-blur-md text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/10">Just In</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">New Arrivals</h2>
            <p className="text-white/70 max-w-md text-sm leading-relaxed mb-6">The hottest new singles and album drops from your favorite Tamil artists are here.</p>
            <button className="bg-white text-black px-8 py-3 rounded-full font-bold text-sm hover:bg-primary hover:text-white transition-all w-fit">Explore New Music</button>
          </div>
        </div>

        {/* New Releases Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black tracking-tight">Recently Released</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Live Updates</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {loading ? (
              Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : (
              newReleases.map((song) => (
                <SongCard key={song.id} song={song} />
              ))
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Index;
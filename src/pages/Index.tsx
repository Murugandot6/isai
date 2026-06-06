"use client";

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song } from '@/services/musicApi';
import { SongCard } from '@/components/SongCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Bell, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const Index = () => {
  const [trending, setTrending] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await musicApi.getTrending();
        setTrending(data);
      } catch (error) {
        console.error('Failed to fetch trending', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight">Good evening,</h1>
            <p className="text-muted-foreground font-medium">Ready to discover something new today?</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Search songs..." 
                className="pl-10 bg-accent/5 border-none focus-visible:ring-primary/20 rounded-xl"
              />
            </div>
            <button className="p-2.5 bg-accent/5 rounded-xl hover:bg-accent/10 transition-colors"><Bell size={20} /></button>
            <button className="p-2.5 bg-accent/5 rounded-xl hover:bg-accent/10 transition-colors"><Settings size={20} /></button>
          </div>
        </div>

        {/* Featured Hero (Simulated) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative h-[300px] rounded-3xl overflow-hidden mb-12 group cursor-pointer shadow-2xl"
        >
          <img 
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
            <span className="bg-primary/20 backdrop-blur-md text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/10 w-fit mb-4">Featured Playlist</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">Late Night Chill & Lo-fi</h2>
            <p className="text-white/70 max-w-md text-sm leading-relaxed mb-6">Escape reality with our hand-picked selection of the best lo-fi beats and relaxing melodies.</p>
            <button className="bg-white text-black px-8 py-3 rounded-full font-bold text-sm hover:bg-primary hover:text-white transition-all w-fit">Listen Now</button>
          </div>
        </motion.div>

        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black tracking-tight">Trending Now</h3>
            <button className="text-xs font-bold text-primary hover:underline underline-offset-4">VIEW ALL</button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : (
              trending.map((song) => (
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
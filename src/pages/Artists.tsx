"use client";

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song } from '@/services/musicApi';
import { Mic2, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMusic } from '@/context/MusicContext';

const FAMOUS_ARTISTS = [
  { name: 'A.R. Rahman', id: 'rahman', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300' },
  { name: 'Anirudh Ravichander', id: 'anirudh', image: 'https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=300' },
  { name: 'Yuvan Shankar Raja', id: 'yuvan', image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=300' },
  { name: 'Sid Sriram', id: 'sid', image: 'https://images.unsplash.com/photo-1525362035658-555345479d6c?q=80&w=300' },
  { name: 'Dhanush', id: 'dhanush', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300' },
  { name: 'Shreya Ghoshal', id: 'shreya', image: 'https://images.unsplash.com/photo-1459749411177-042180ceea72?q=80&w=300' },
];

const Artists = () => {
  const { playSong } = useMusic();
  const [loading, setLoading] = useState(false);

  const handleArtistClick = async (name: string) => {
    setLoading(true);
    try {
      const results = await musicApi.searchSongs(name);
      if (results.length > 0) {
        playSong(results[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-primary/20 p-3 rounded-2xl">
            <Mic2 className="text-primary" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Famous Artists</h1>
            <p className="text-muted-foreground font-medium">Explore legends and rising stars of the industry.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
          {FAMOUS_ARTISTS.map((artist) => (
            <div 
              key={artist.id} 
              onClick={() => handleArtistClick(artist.name)}
              className="group flex flex-col items-center text-center cursor-pointer"
            >
              <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4 shadow-xl border-4 border-transparent group-hover:border-primary/30 transition-all duration-300">
                <img 
                  src={artist.image} 
                  alt={artist.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                <div className="absolute bottom-2 right-2 bg-primary p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Star size={12} fill="white" className="text-white" />
                </div>
              </div>
              <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{artist.name}</h3>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Artist</p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Artists;
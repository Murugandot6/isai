"use client";

import React, { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song } from '@/services/musicApi';
import { Mic2, Star, ArrowLeft, Play, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMusic } from '@/context/MusicContext';
import { SongCard } from '@/components/SongCard';
import { Button } from '@/components/ui/button';

const FAMOUS_ARTISTS = [
  { name: 'A.R. Rahman', id: 'rahman', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300' },
  { name: 'Anirudh Ravichander', id: 'anirudh', image: 'https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=300' },
  { name: 'Yuvan Shankar Raja', id: 'yuvan', image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=300' },
  { name: 'Sid Sriram', id: 'sid', image: 'https://images.unsplash.com/photo-1525362035658-555345479d6c?q=80&w=300' },
  { name: 'Dhanush', id: 'dhanush', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300' },
  { name: 'Shreya Ghoshal', id: 'shreya', image: 'https://images.unsplash.com/photo-1459749411177-042180ceea72?q=80&w=300' },
  { name: 'Vijay Antony', id: 'vijay', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300' },
  { name: 'Harris Jayaraj', id: 'harris', image: 'https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=300' },
];

const Artists = () => {
  const { playSong } = useMusic();
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [artistSongs, setArtistSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  const handleArtistClick = async (artist: any) => {
    setSelectedArtist(artist);
    setLoading(true);
    try {
      const results = await musicApi.searchSongs(artist.name);
      setArtistSongs(results);
    } finally {
      setLoading(false);
    }
  };

  if (selectedArtist) {
    return (
      <MainLayout>
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedArtist(null)}
            className="mb-8 gap-2 hover:bg-accent/10 rounded-xl"
          >
            <ArrowLeft size={18} />
            Back to Artists
          </Button>

          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="w-48 h-48 rounded-full overflow-hidden shadow-2xl border-4 border-primary/20">
              <img src={selectedArtist.image} alt={selectedArtist.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-5xl font-black tracking-tighter mb-4">{selectedArtist.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <Button 
                  onClick={() => artistSongs.length > 0 && playSong(artistSongs[0], artistSongs)}
                  className="rounded-full px-8 h-12 font-bold gap-2 shadow-xl shadow-primary/20"
                >
                  <Play size={18} fill="currentColor" />
                  Play Top Tracks
                </Button>
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">{artistSongs.length} Tracks Found</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {artistSongs.map((song) => (
                <SongCard key={song.id} song={song} allSongs={artistSongs} />
              ))}
            </div>
          )}
        </div>
      </MainLayout>
    );
  }

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
              onClick={() => handleArtistClick(artist)}
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
"use client";

import React from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useMusic } from '@/context/MusicContext';
import { SongCard } from '@/components/SongCard';
import { Heart, Radio, Music, Play, Pause } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Favourites = () => {
  const { likedSongs, likedStations, playSong, currentSong, isPlaying } = useMusic();

  const handlePlayStation = (station: any) => {
    const radioSong = {
      id: station.stationuuid,
      name: station.name,
      type: 'radio',
      primaryArtists: station.tags || 'Live FM',
      image: [{ link: station.favicon || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=200' }],
      downloadUrl: [{ link: station.url_resolved }],
      language: station.language,
      album: { id: 'radio', name: 'Live Radio', url: '' },
      year: '',
      duration: 0
    };
    playSong(radioSong as any);
  };

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-primary/20 p-3 rounded-2xl">
            <Heart className="text-primary fill-primary" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Favourites</h1>
            <p className="text-muted-foreground font-medium">Everything you've loved in one place.</p>
          </div>
        </div>

        <Tabs defaultValue="songs" className="w-full">
          <TabsList className="bg-accent/5 p-1 rounded-2xl mb-8 w-fit">
            <TabsTrigger value="songs" className="rounded-xl px-6 font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Music size={16} />
              Songs
              {likedSongs.length > 0 && <span className="ml-1 text-[10px] bg-white/20 px-1.5 rounded-full">{likedSongs.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="stations" className="rounded-xl px-6 font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Radio size={16} />
              FM Stations
              {likedStations.length > 0 && <span className="ml-1 text-[10px] bg-white/20 px-1.5 rounded-full">{likedStations.length}</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="songs" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {likedSongs.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {likedSongs.map((song) => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-accent/20 rounded-3xl">
                <Music size={48} className="text-muted-foreground/30 mb-6" />
                <h3 className="text-xl font-bold mb-2">No liked songs yet</h3>
                <p className="text-muted-foreground max-w-xs">Tap the heart icon on any song to save it here.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stations" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {likedStations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {likedStations.map((station) => {
                  const isActive = currentSong?.id === station.stationuuid;
                  return (
                    <div 
                      key={station.stationuuid}
                      onClick={() => handlePlayStation(station)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer group",
                        isActive 
                          ? "bg-primary/10 border-primary/30" 
                          : "bg-card/50 border-transparent hover:border-accent/20 hover:bg-accent/5"
                      )}
                    >
                      <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-xl bg-accent/10">
                        <img 
                          src={station.favicon || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=200'} 
                          alt={station.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className={cn(
                          "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
                          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}>
                          {isActive && isPlaying ? <Pause size={18} fill="currentColor" className="text-white" /> : <Play size={18} fill="currentColor" className="text-white" />}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm truncate">{station.name}</h3>
                        <Badge variant="secondary" className="bg-accent/10 text-[8px] font-bold px-1.5 py-0 mt-1">
                          {station.language.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-accent/20 rounded-3xl">
                <Radio size={48} className="text-muted-foreground/30 mb-6" />
                <h3 className="text-xl font-bold mb-2">No liked stations yet</h3>
                <p className="text-muted-foreground max-w-xs">Heart your favorite FM stations to see them here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Favourites;
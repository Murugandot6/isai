"use client";

import React from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useMusic } from '@/context/MusicContext';
import { SongCard } from '@/components/SongCard';
import { History, Music } from 'lucide-react';

const Songs = () => {
  const { recentlyPlayed } = useMusic();

  return (
    <MainLayout>
      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-10">
          <div className="bg-primary/20 p-2.5 md:p-3 rounded-2xl">
            <History className="text-primary w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Recently Played</h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Your soundtrack over the last few sessions.</p>
          </div>
        </div>

        {recentlyPlayed.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {recentlyPlayed.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center bg-accent/5 rounded-3xl border-2 border-dashed border-accent/10">
            <Music className="text-muted-foreground/30 mb-4 w-9 h-9 md:w-12 md:h-12" />
            <h3 className="text-lg md:text-xl font-bold mb-1">No history yet</h3>
            <p className="text-xs text-muted-foreground max-w-xs">Start listening to music and we'll track your history here.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Songs;
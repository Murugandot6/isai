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
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-primary/20 p-3 rounded-2xl">
            <History className="text-primary" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Recently Played</h1>
            <p className="text-muted-foreground font-medium">Your soundtrack over the last few sessions.</p>
          </div>
        </div>

        {recentlyPlayed.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {recentlyPlayed.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-accent/5 rounded-3xl border-2 border-dashed border-accent/10">
            <Music size={48} className="text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold">No history yet</h3>
            <p className="text-muted-foreground max-w-xs">Start listening to music and we'll track your history here.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Songs;
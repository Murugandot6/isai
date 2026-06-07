"use client";

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song } from '@/services/musicApi';
import { SongCard } from '@/components/SongCard';
import { Star, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMusic } from '@/context/MusicContext';

const EditorsChoice = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = useMusic();

  useEffect(() => {
    const fetchChoice = async () => {
      setLoading(true);
      try {
        // Fetching top rated/trending as a proxy for editor's choice
        const data = await musicApi.searchSongs('A.R. Rahman hits', 1, 20);
        setSongs(data);
      } finally {
        setLoading(false);
      }
    };
    fetchChoice();
  }, []);

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500/20 p-3 rounded-2xl">
              <Star className="text-yellow-500 fill-yellow-500" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">Editor's Choice</h1>
              <p className="text-muted-foreground font-medium">The absolute best of Tamil music, curated by our experts.</p>
            </div>
          </div>
          
          <Button 
            onClick={() => songs.length > 0 && playSong(songs[0], songs)}
            className="rounded-full px-8 h-12 font-bold gap-2 shadow-xl shadow-primary/20"
          >
            <Play size={18} fill="currentColor" />
            Play Selection
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} allSongs={songs} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default EditorsChoice;
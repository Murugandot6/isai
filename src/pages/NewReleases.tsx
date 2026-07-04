"use client";

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song } from '@/services/musicApi';
import { getHighResImage } from '@/lib/image-utils';
import { Play, Loader2, Album } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const NewReleases = () => {
  const navigate = useNavigate();
  const [newReleases, setNewReleases] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewReleases = async () => {
      setLoading(true);
      try {
        // Fetching new releases for Tamil, defaulting to Tamil if no language is selected
        const data = await musicApi.getTrending('tamil');
        setNewReleases(data || []);
      } catch (error) {
        console.error('Failed to fetch new releases', error);
        setNewReleases([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNewReleases();
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-tr from-black via-zinc-950 to-neutral-950 text-white p-4 md:p-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12">
          <div className="bg-purple-500/20 p-2.5 md:p-3 rounded-2xl border border-purple-500/30">
            <Album className="text-purple-400 w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">New Releases</h1>
            <p className="text-xs md:text-sm text-zinc-400 font-medium">Latest tracks and albums hitting the charts.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-3xl bg-white/5" />
                <Skeleton className="h-6 w-3/4 rounded-lg bg-white/5" />
                <Skeleton className="h-4 w-1/2 bg-white/5" />
              </div>
            ))}
          </div>
        ) : newReleases.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {newReleases.map((song) => {
              // For new releases, we'll display them as song cards for now
              return (
                <div 
                  key={song.id}
                  onClick={() => playSong(song, newReleases)}
                  className="group relative bg-card/50 hover:bg-accent/10 p-3 rounded-2xl transition-all duration-300 cursor-pointer border border-transparent hover:border-accent/20 hover:-translate-y-1"
                >
                  <div className="relative aspect-square mb-3 overflow-hidden rounded-xl bg-accent/10 shadow-lg">
                    <img 
                      src={getHighResImage(song.image)} 
                      alt={song.name} 
                      className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Play size={18} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm truncate mb-0.5" dangerouslySetInnerHTML={{ __html: song.name }} />
                  <p className="text-xs text-muted-foreground truncate" dangerouslySetInnerHTML={{ __html: song.primaryArtists }} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            No new releases found for the selected language.
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NewReleases;
"use client";

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { musicApi, Playlist } from '@/services/musicApi';
import { getHighResImage } from '@/lib/image-utils';
import { Skeleton } from '@/components/ui/skeleton';

const Featured = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPlaylists = async () => {
      setLoading(true);
      try {
        // Fetching the "top tamil" playlists dynamically from the API
        const results = await musicApi.searchPlaylists("top tamil");
        setPlaylists(results);
      } catch (error) {
        console.error("Failed to fetch featured playlists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPlaylists();
  }, []);

  return (
    <MainLayout>
      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12">
          <div className="bg-primary/20 p-2.5 md:p-3 rounded-2xl">
            <Sparkles className="text-primary w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Featured Playlists</h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Explore the best of Tamil music collections.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-3xl" />
                <Skeleton className="h-6 w-3/4 rounded-lg" />
              </div>
            ))}
          </div>
        ) : playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 animate-in fade-in duration-500">
            {playlists.map((playlist) => {
              const songCount = playlist.songCount || "0";
              return (
                <div 
                  key={playlist.id}
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer shadow-xl transition-all hover:-translate-y-2"
                >
                  <img 
                    src={getHighResImage(playlist.image)} 
                    alt={playlist.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 md:p-8 flex flex-col justify-end">
                    <h3 className="text-white font-black text-xl md:text-2xl mb-1 md:mb-2 leading-tight" dangerouslySetInnerHTML={{ __html: playlist.name }}></h3>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{songCount} Tracks</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            No featured playlists found.
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Featured;
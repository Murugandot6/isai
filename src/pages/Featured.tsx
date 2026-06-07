"use client";

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Playlist } from '@/services/musicApi';
import { Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getHighResImage } from '@/lib/image-utils';

const FEATURED_IDS = [
  '1170578779', '1170578783', '901538755', '1170578788', 
  '1074590003', '1133105280', '804092154', '901538752', 
  '901538753', '1134651042'
];

const Featured = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);
      try {
        const data = await Promise.all(FEATURED_IDS.map(id => musicApi.getPlaylistDetails(id)));
        setPlaylists(data.filter(p => p !== null) as Playlist[]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, []);

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-primary/20 p-3 rounded-2xl">
            <Sparkles className="text-primary" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Featured Playlists</h1>
            <p className="text-muted-foreground font-medium">Handpicked Tamil collections for every mood.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {playlists.map((playlist) => (
              <div 
                key={playlist.id}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
                className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer shadow-xl transition-all hover:-translate-y-2"
              >
                <img 
                  src={getHighResImage(playlist.image)} 
                  alt={playlist.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 flex flex-col justify-end">
                  <h3 className="text-white font-black text-2xl mb-2" dangerouslySetInnerHTML={{ __html: playlist.name }}></h3>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{playlist.songCount} Tracks</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Featured;
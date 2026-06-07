"use client";

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Playlist } from '@/services/musicApi';
import { Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getHighResImage } from '@/lib/image-utils';

const FEATURED_IDS = [
  '83409225', '82543613', '902306817', '67691546', '1134650280', 
  '1265890645', '76182059', '109815423', '79316075', '929344231', 
  '1299220479', '201508188', '1133105280', '789168950', '792884617', 
  '84076492', '1268059887', '81145416', '66662540', '83410788', 
  '919280091', '109118539', '787742136', '1219737282', '76293059', 
  '58694540', '807292081', '807639710', '110785136', '848384706', 
  '696005328', '782470134', '62125106', '61387835', '904072585', 
  '67453091', '83970046', '1566837', '158225213', '81952675', 
  '1212537058', '56019563', '913487155', '837803163', '829906546', 
  '153577807', '838067360', '1218677238', '81861086', '889114311'
];

const Featured = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);
      try {
        // Fetch in chunks to avoid rate limits or long wait times
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
      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12">
          <div className="bg-primary/20 p-2.5 md:p-3 rounded-2xl">
            <Sparkles className="text-primary" size={24} md:size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Featured Playlists</h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Explore the best of Tamil music collections.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 md:p-8 flex flex-col justify-end">
                  <h3 className="text-white font-black text-xl md:text-2xl mb-1 md:mb-2 leading-tight" dangerouslySetInnerHTML={{ __html: playlist.name }}></h3>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{playlist.songCount} Tracks</p>
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
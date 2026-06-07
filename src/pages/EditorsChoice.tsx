"use client";

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Playlist } from '@/services/musicApi';
import { Star, Loader2, Mic2, Heart, TrendingUp, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getHighResImage } from '@/lib/image-utils';
import { Button } from '@/components/ui/button';

const ARTIST_IDS = ['82543613', '76182059', '79316075', '201508188', '81145416', '66662540', '58694540', '62125106', '61387835', '67453091', '83970046', '81861086'];
const MOOD_IDS = ['1134650280', '109815423', '84076492', '109118539', '83410788', '782470134', '837803163', '889114311', '807292081'];
const TRENDING_IDS = ['902306817', '67691546', '1133105280', '1219737282', '919280091', '1265890645'];

const EditorsChoice = () => {
  const [artistPlaylists, setArtistPlaylists] = useState<Playlist[]>([]);
  const [moodPlaylists, setMoodPlaylists] = useState<Playlist[]>([]);
  const [trendingPlaylists, setTrendingPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [artists, moods, trending] = await Promise.all([
          Promise.all(ARTIST_IDS.map(id => musicApi.getPlaylistDetails(id))),
          Promise.all(MOOD_IDS.map(id => musicApi.getPlaylistDetails(id))),
          Promise.all(TRENDING_IDS.map(id => musicApi.getPlaylistDetails(id)))
        ]);
        
        setArtistPlaylists(artists.filter(p => p !== null) as Playlist[]);
        setMoodPlaylists(moods.filter(p => p !== null) as Playlist[]);
        setTrendingPlaylists(trending.filter(p => p !== null) as Playlist[]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const PlaylistSection = ({ title, icon: Icon, playlists, color }: { title: string, icon: any, playlists: Playlist[], color: string }) => (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`${color} p-2 rounded-xl`}>
            <Icon className="text-white" size={20} />
          </div>
          <h3 className="text-2xl font-black tracking-tight">{title}</h3>
        </div>
        <Button variant="ghost" onClick={() => navigate('/featured')} className="text-xs font-bold gap-1 hover:bg-accent/10">
          VIEW ALL <ChevronRight size={14} />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {playlists.map((playlist) => (
          <div 
            key={playlist.id}
            onClick={() => navigate(`/playlist/${playlist.id}`)}
            className="group cursor-pointer"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg transition-all group-hover:-translate-y-1">
              <img 
                src={getHighResImage(playlist.image)} 
                alt={playlist.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
            </div>
            <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors" dangerouslySetInnerHTML={{ __html: playlist.name }}></h4>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{playlist.songCount} Tracks</p>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-yellow-500 p-3 rounded-2xl shadow-lg shadow-yellow-500/20">
            <Star className="text-white fill-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Editor's Choice</h1>
            <p className="text-muted-foreground font-medium">Hand-picked Tamil masterpieces curated for you.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : (
          <>
            <PlaylistSection title="Artist Spotlights" icon={Mic2} playlists={artistPlaylists} color="bg-blue-500" />
            <PlaylistSection title="Moods & Genres" icon={Heart} playlists={moodPlaylists} color="bg-pink-500" />
            <PlaylistSection title="Trending Hits" icon={TrendingUp} playlists={trendingPlaylists} color="bg-green-500" />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default EditorsChoice;
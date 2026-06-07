"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Playlist, Song } from '@/services/musicApi';
import { SongCard } from '@/components/SongCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, ListMusic, Music, Loader2, Clock } from 'lucide-react';
import { getHighResImage } from '@/lib/image-utils';
import { Badge } from '@/components/ui/badge';
import { useMusic } from '@/context/MusicContext';

const PlaylistDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const { playSong } = useMusic();

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await musicApi.getPlaylistDetails(id);
        setPlaylist(data);
      } catch (error) {
        console.error("Failed to fetch playlist details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </MainLayout>
    );
  }

  if (!playlist) {
    return (
      <MainLayout>
        <div className="p-10 text-center">
          <h2 className="text-2xl font-bold">Playlist not found</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-8 gap-2 hover:bg-accent/10 rounded-xl"
        >
          <ArrowLeft size={18} />
          Back
        </Button>

        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-12">
          <div className="w-64 h-64 rounded-3xl overflow-hidden shadow-2xl bg-accent/10">
            <img src={getHighResImage(playlist.image)} alt={playlist.name} className="w-full h-full object-cover" />
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none uppercase text-[10px] font-bold">
                PLAYLIST
              </Badge>
              <Badge variant="outline" className="text-[10px] font-bold uppercase">
                {playlist.language}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4" dangerouslySetInnerHTML={{ __html: playlist.name }}></h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <ListMusic size={18} />
                <span>{playlist.songCount} Songs</span>
              </div>
              {playlist.year && (
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span>{playlist.year}</span>
                </div>
              )}
            </div>
            <div className="mt-8">
              <Button 
                onClick={() => playlist.songs && playlist.songs.length > 0 && playSong(playlist.songs[0], playlist.songs)}
                className="rounded-full px-10 h-14 font-bold gap-3 shadow-xl shadow-primary/20 text-lg"
              >
                <Play size={20} fill="currentColor" />
                Play Playlist
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Music size={20} className="text-primary" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Tracks</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {playlist.songs?.map((song) => (
              <SongCard key={song.id} song={song} allSongs={playlist.songs} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PlaylistDetails;
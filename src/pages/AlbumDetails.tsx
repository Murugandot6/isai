"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Album, Song } from '@/services/musicApi';
import { SongCard } from '@/components/SongCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Disc, Calendar, Music, Loader2 } from 'lucide-react';
import { getHighResImage } from '@/lib/image-utils';
import { Badge } from '@/components/ui/badge';

const AlbumDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const { playSong } = useMusic();

  useEffect(() => {
    const fetchAlbum = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await musicApi.getAlbumDetails(id);
        setAlbum(data);
      } catch (error) {
        console.error("Failed to fetch album details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
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

  if (!album) {
    return (
      <MainLayout>
        <div className="p-10 text-center">
          <h2 className="text-2xl font-bold">Album not found</h2>
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
            <img src={getHighResImage(album.image)} alt={album.name} className="w-full h-full object-cover" />
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none uppercase text-[10px] font-bold">
                {album.type.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-bold uppercase">
                {album.language}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4" dangerouslySetInnerHTML={{ __html: album.name }}></h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <Disc size={18} />
                <span>{album.songCount} Songs</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{album.year}</span>
              </div>
            </div>
            <div className="mt-8">
              <Button 
                onClick={() => album.songs && album.songs.length > 0 && playSong(album.songs[0], album.songs)}
                className="rounded-full px-10 h-14 font-bold gap-3 shadow-xl shadow-primary/20 text-lg"
              >
                <Play size={20} fill="currentColor" />
                Play Album
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Music size={20} className="text-primary" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Tracklist</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {album.songs?.map((song) => (
              <SongCard key={song.id} song={song} allSongs={album.songs} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

import { useMusic } from '@/context/MusicContext';
export default AlbumDetails;
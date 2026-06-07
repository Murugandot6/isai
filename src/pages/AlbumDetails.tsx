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
import { useMusic } from '@/context/MusicContext';

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
        // 1. Fetch the basic album details
        const data = await musicApi.getAlbumDetails(id);
        
        if (data && data.songs && data.songs.length > 0) {
          // 2. The album endpoint often returns the album cover for all songs.
          // We fetch the specific song details in bulk to get the "real" individual images.
          const songIds = data.songs.map(s => s.id);
          const fullSongs = await musicApi.getSongsDetailsBulk(songIds);
          
          if (fullSongs && fullSongs.length > 0) {
            // 3. Map the enriched data back to the album's song list
            const enrichedSongs = data.songs.map(originalSong => {
              const fullDetail = fullSongs.find(fs => fs.id === originalSong.id);
              // If we found full details, use them (they contain the correct individual images)
              return fullDetail ? { ...fullDetail } : originalSong;
            });
            data.songs = enrichedSongs;
          }
        }
        
        // 4. Set the state with the enriched data
        setAlbum(data ? { ...data } : null);
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
      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 md:mb-8 gap-1.5 hover:bg-accent/10 rounded-xl h-9 px-3 text-xs md:text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </Button>

        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 mb-10 md:mb-12">
          <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-2xl bg-accent/10 shrink-0">
            <img src={getHighResImage(album.image)} alt={album.name} className="w-full h-full object-cover" />
          </div>
          <div className="text-center md:text-left flex-1 min-w-0">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none uppercase text-[9px] font-bold">
                {album.type.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-[9px] font-bold uppercase">
                {album.language}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-3 leading-tight" dangerouslySetInnerHTML={{ __html: album.name }}></h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-muted-foreground font-medium text-xs md:text-sm">
              <div className="flex items-center gap-1.5">
                <Disc size={16} />
                <span>{album.songCount} Songs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={16} />
                <span>{album.year}</span>
              </div>
            </div>
            <div className="mt-6 md:mt-8">
              <Button 
                onClick={() => album.songs && album.songs.length > 0 && playSong(album.songs[0], album.songs)}
                className="rounded-full px-8 md:px-10 h-11 md:h-14 font-bold gap-2 md:gap-3 shadow-xl shadow-primary/20 text-sm md:text-lg w-full md:w-auto"
              >
                <Play className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
                Play Album
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2.5 mb-6 md:mb-8">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Music size={18} className="text-primary" />
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">Tracklist</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {album.songs?.map((song) => (
              <SongCard key={song.id} song={song} allSongs={album.songs} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AlbumDetails;
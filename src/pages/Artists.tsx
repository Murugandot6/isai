"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song } from '@/services/musicApi';
import { Mic2, Star, ArrowLeft, Play, Loader2, Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMusic } from '@/context/MusicContext';
import { SongCard } from '@/components/SongCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getHighResImage } from '@/lib/image-utils';

// Real Saavn Artist IDs for popular Indian artists
const POPULAR_ARTISTS = [
  { name: 'A.R. Rahman', id: '456269' },
  { name: 'Anirudh Ravichander', id: '459320' },
  { name: 'Yuvan Shankar Raja', id: '456863' },
  { name: 'Sid Sriram', id: '468117' },
  { name: 'Dhanush', id: '459633' },
  { name: 'Shreya Ghoshal', id: '456287' },
  { name: 'Vijay Antony', id: '457434' },
  { name: 'Harris Jayaraj', id: '456862' },
  { name: 'Ilaiyaraaja', id: '456561' },
  { name: 'Santhosh Narayanan', id: '458918' },
  { name: 'G.V. Prakash Kumar', id: '457145' },
  { name: 'D. Imman', id: '457141' },
];

const Artists = () => {
  const { playSong, selectedLanguages } = useMusic();
  const [artistsList, setArtistsList] = useState<any[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [artistSongs, setArtistSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  // Fetch initial artist data (real photos)
  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      try {
        const details = await Promise.all(
          POPULAR_ARTISTS.map(a => musicApi.getArtistDetails(a.id))
        );
        setArtistsList(details.filter(d => d !== null));
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const lastSongElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchArtistSongs = useCallback(async (artistId: string, pageNum: number) => {
    setLoading(true);
    try {
      const data = await musicApi.getArtistDetails(artistId, pageNum);
      if (!data) {
        setHasMore(false);
        return;
      }

      const songs = data.topSongs || [];
      
      // Filter by global selected languages
      const filteredResults = songs.filter((song: Song) => 
        selectedLanguages.includes(song.language.toLowerCase())
      );

      if (songs.length === 0) {
        setHasMore(false);
      } else {
        setArtistSongs(prev => pageNum === 0 ? filteredResults : [...prev, ...filteredResults]);
      }
    } catch (error) {
      console.error("Failed to fetch artist songs", error);
    } finally {
      setLoading(false);
    }
  }, [selectedLanguages]);

  useEffect(() => {
    if (selectedArtist) {
      fetchArtistSongs(selectedArtist.id, page);
    }
  }, [selectedArtist, page, fetchArtistSongs]);

  const handleArtistClick = (artist: any) => {
    setArtistSongs([]);
    setPage(0);
    setHasMore(true);
    setSelectedArtist(artist);
  };

  // Group songs by language
  const groupedSongs = artistSongs.reduce((acc: Record<string, Song[]>, song) => {
    const lang = song.language.charAt(0).toUpperCase() + song.language.slice(1);
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(song);
    return acc;
  }, {});

  if (selectedArtist) {
    return (
      <MainLayout>
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedArtist(null)}
            className="mb-8 gap-2 hover:bg-accent/10 rounded-xl"
          >
            <ArrowLeft size={18} />
            Back to Artists
          </Button>

          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="w-48 h-48 rounded-full overflow-hidden shadow-2xl border-4 border-primary/20 bg-accent/10">
              <img src={getHighResImage(selectedArtist.image)} alt={selectedArtist.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-5xl font-black tracking-tighter mb-4">{selectedArtist.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <Button 
                  onClick={() => artistSongs.length > 0 && playSong(artistSongs[0], artistSongs)}
                  className="rounded-full px-8 h-12 font-bold gap-2 shadow-xl shadow-primary/20"
                >
                  <Play size={18} fill="currentColor" />
                  Play All
                </Button>
                <div className="flex flex-wrap gap-2">
                  {selectedLanguages.map(lang => (
                    <Badge key={lang} variant="secondary" className="bg-primary/10 text-primary border-none uppercase text-[10px] font-bold">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            {Object.entries(groupedSongs).map(([language, songs]) => (
              <section key={language} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <Globe size={18} className="text-muted-foreground" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">{language} Tracks</h2>
                  <span className="text-xs font-bold text-muted-foreground bg-accent/5 px-2 py-0.5 rounded-full">{songs.length}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {songs.map((song, index) => (
                    <div key={`${song.id}-${index}`} ref={index === songs.length - 1 ? lastSongElementRef : null}>
                      <SongCard song={song} allSongs={artistSongs} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          )}

          {!loading && artistSongs.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-bold">No songs found for your selected languages.</p>
              <p className="text-xs text-muted-foreground mt-2">Try adding more languages in the header.</p>
            </div>
          )}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-primary/20 p-3 rounded-2xl">
            <Mic2 className="text-primary" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Famous Artists</h1>
            <p className="text-muted-foreground font-medium">Explore legends and rising stars of the industry.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
          {loading && artistsList.length === 0 ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-4">
                <Skeleton className="w-full aspect-square rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          ) : (
            artistsList.map((artist) => (
              <div 
                key={artist.id} 
                onClick={() => handleArtistClick(artist)}
                className="group flex flex-col items-center text-center cursor-pointer"
              >
                <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4 shadow-xl border-4 border-transparent group-hover:border-primary/30 transition-all duration-300 bg-accent/10">
                  <img 
                    src={getHighResImage(artist.image)} 
                    alt={artist.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                  <div className="absolute bottom-2 right-2 bg-primary p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Star size={12} fill="white" className="text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{artist.name}</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Artist</p>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Artists;
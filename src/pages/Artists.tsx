"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song } from '@/services/musicApi';
import { Mic2, Star, ArrowLeft, Play, Loader2, Globe, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMusic } from '@/context/MusicContext';
import { SongCard } from '@/components/SongCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getHighResImage } from '@/lib/image-utils';

const TAMIL_LEGENDS = [
  { name: 'A.R. Rahman', id: '456269' },
  { name: 'Ilaiyaraaja', id: '456561' },
  { name: 'Anirudh Ravichander', id: '459320' },
  { name: 'Yuvan Shankar Raja', id: '456863' },
  { name: 'Harris Jayaraj', id: '456862' },
  { name: 'S.P. Balasubrahmanyam', id: '456042' },
  { name: 'G.V. Prakash Kumar', id: '457145' },
  { name: 'Santhosh Narayanan', id: '458918' },
  { name: 'Sid Sriram', id: '468117' },
  { name: 'Vairamuthu', id: '456864' },
  { name: 'Na. Muthukumar', id: '485956' },
  { name: 'Vaali', id: '456865' },
];

const Artists = () => {
  const { playSong, selectedLanguages } = useMusic();
  const [artistsList, setArtistsList] = useState<any[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [focusedLanguage, setFocusedLanguage] = useState<string | null>(null);
  const [artistSongs, setArtistSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      try {
        const details = await Promise.all(
          TAMIL_LEGENDS.map(a => musicApi.getArtistDetails(a.id))
        );
        setArtistsList(details.filter(d => d !== null));
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const lastSongElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || !focusedLanguage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, focusedLanguage]);

  const fetchArtistSongs = useCallback(async (artistId: string, pageNum: number) => {
    setLoading(true);
    try {
      const data = await musicApi.getArtistDetails(artistId, pageNum);
      if (!data) {
        setHasMore(false);
        return;
      }

      const songs = data.topSongs || [];
      // Filter results by selected languages, but prioritize Tamil for these artists
      const filteredResults = songs.filter((song: Song) => 
        selectedLanguages.includes(song.language.toLowerCase()) || song.language.toLowerCase() === 'tamil'
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
      if (focusedLanguage || page === 0) {
        fetchArtistSongs(selectedArtist.id, page);
      }
    }
  }, [selectedArtist, page, fetchArtistSongs, focusedLanguage]);

  const handleArtistClick = (artist: any) => {
    setArtistSongs([]);
    setPage(0);
    setHasMore(true);
    setFocusedLanguage(null);
    setSelectedArtist(artist);
  };

  const handleBackToOverview = () => {
    setFocusedLanguage(null);
  };

  const groupedSongs = useMemo(() => {
    return artistSongs.reduce((acc: Record<string, Song[]>, song) => {
      const lang = song.language.charAt(0).toUpperCase() + song.language.slice(1);
      if (!acc[lang]) acc[lang] = [];
      acc[lang].push(song);
      return acc;
    }, {});
  }, [artistSongs]);

  if (selectedArtist) {
    return (
      <MainLayout>
        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <Button 
              variant="ghost" 
              onClick={focusedLanguage ? handleBackToOverview : () => setSelectedArtist(null)}
              className="gap-2 hover:bg-accent/10 rounded-xl h-9 px-3"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">{focusedLanguage ? 'Back' : 'Artists'}</span>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-10 md:mb-12">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shadow-2xl border-4 border-primary/20 bg-accent/10">
              <img src={getHighResImage(selectedArtist.image)} alt={selectedArtist.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-3 md:mb-4">{selectedArtist.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Button 
                  onClick={() => artistSongs.length > 0 && playSong(artistSongs[0], artistSongs)}
                  className="rounded-full px-6 md:px-8 h-10 md:h-12 font-bold gap-2 shadow-xl shadow-primary/20"
                >
                  <Play size={16} fill="currentColor" />
                  Play All
                </Button>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLanguages.map(lang => (
                    <Badge key={lang} variant="secondary" className="bg-primary/10 text-primary border-none uppercase text-[9px] font-bold">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-12 md:space-y-16">
            {focusedLanguage ? (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Globe size={18} className="text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">{focusedLanguage} Tracks</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {groupedSongs[focusedLanguage]?.map((song, index) => (
                    <div key={`${song.id}-${index}`} ref={index === (groupedSongs[focusedLanguage]?.length || 0) - 1 ? lastSongElementRef : null}>
                      <SongCard song={song} allSongs={groupedSongs[focusedLanguage]} />
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              Object.entries(groupedSongs).map(([language, songs]) => (
                <section key={language} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-accent/10 p-2 rounded-lg">
                        <Globe size={16} className="text-muted-foreground" />
                      </div>
                      <h2 className="text-xl md:text-2xl font-black tracking-tight">{language}</h2>
                    </div>
                    <Button 
                      variant="link" 
                      className="text-primary font-bold gap-1 hover:no-underline group h-auto p-0"
                      onClick={() => setFocusedLanguage(language)}
                    >
                      View All
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {songs.slice(0, 10).map((song, index) => (
                      <SongCard key={`${song.id}-${index}`} song={song} allSongs={songs} />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          )}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-10">
          <div className="bg-primary/20 p-2 md:p-3 rounded-xl md:rounded-2xl">
            <Mic2 className="text-primary" size={24} md:size={32} />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">Tamil Legends</h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">The icons who shaped the sound of Tamil cinema.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 md:gap-8">
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
                <div className="relative w-full aspect-square rounded-full overflow-hidden mb-3 md:mb-4 shadow-xl border-4 border-transparent group-hover:border-primary/30 transition-all duration-300 bg-accent/10">
                  <img 
                    src={getHighResImage(artist.image)} 
                    alt={artist.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                  <div className="absolute bottom-2 right-2 bg-primary p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Star size={10} fill="white" className="text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-xs md:text-sm group-hover:text-primary transition-colors line-clamp-1">{artist.name}</h3>
                <p className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Legend</p>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Artists;
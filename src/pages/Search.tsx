"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song, Album } from '@/services/musicApi';
import { SongCard } from '@/components/SongCard';
import { AlbumCard } from '@/components/AlbumCard';
import { Search as SearchIcon, Loader2, Music, Disc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMusic } from '@/context/MusicContext';
import { Skeleton } from '@/components/ui/skeleton';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const { selectedLanguages } = useMusic();
  
  const [query, setQuery] = useState(urlQuery);
  const [songResults, setSongResults] = useState<Song[]>([]);
  const [albumResults, setAlbumResults] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('songs');

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const [songs, albums] = await Promise.all([
        musicApi.searchSongs(searchQuery, 1, 50),
        musicApi.searchAlbums(searchQuery, 1, 50)
      ]);
      
      // We show all results for explicit searches to ensure the user finds what they typed,
      // but we can still sort them to prioritize selected languages if we wanted.
      // For now, let's just show everything so results aren't "hidden".
      setSongResults(songs);
      setAlbumResults(albums);
    } catch (error) {
      console.error('Search failed', error);
      setSongResults([]);
      setAlbumResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (urlQuery) {
      setQuery(urlQuery);
      performSearch(urlQuery);
    }
  }, [urlQuery, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query });
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-black mb-6 md:mb-8 tracking-tight text-center">Find Your Sound</h1>
          <form onSubmit={handleSubmit} className="relative group flex items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Songs, movies, or albums..." 
                className="pl-11 pr-4 py-6 bg-accent/5 border-2 border-transparent focus-visible:ring-0 focus-visible:border-primary/20 rounded-2xl text-sm md:text-base transition-all h-12 md:h-14"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground px-4 md:px-6 h-12 md:h-14 rounded-2xl font-bold text-xs md:text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0 shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <SearchIcon size={16} />}
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </div>

        {loading ? (
          <div className="space-y-8">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ) : (songResults.length > 0 || albumResults.length > 0) ? (
          <Tabs defaultValue="songs" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-accent/5 p-1 rounded-2xl mb-6 md:mb-8 w-fit">
              <TabsTrigger value="songs" className="rounded-xl px-4 md:px-6 py-2 font-bold gap-1.5 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-white">
                <Music size={16} />
                Songs
                <span className="ml-1 text-[9px] md:text-[10px] bg-white/20 px-1.5 rounded-full">{songResults.length}</span>
              </TabsTrigger>
              <TabsTrigger value="albums" className="rounded-xl px-4 md:px-6 py-2 font-bold gap-1.5 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-white">
                <Disc size={16} />
                Albums
                <span className="ml-1 text-[9px] md:text-[10px] bg-white/20 px-1.5 rounded-full">{albumResults.length}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="songs" className="animate-in fade-in duration-500">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {songResults.map((song) => (
                  <SongCard key={song.id} song={song} allSongs={songResults} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="albums" className="animate-in fade-in duration-500">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {albumResults.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : !loading && (
          <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center animate-in slide-in-from-top-4 duration-500">
            <div className="bg-accent/5 p-6 md:p-8 rounded-full mb-4 md:mb-6">
              <SearchIcon size={40} className="text-muted-foreground/30" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2">
              {urlQuery ? `No results found for "${urlQuery}"` : "Start Exploring"}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xs">
              {urlQuery ? "Try searching for a different song, artist, or movie." : "Search for your favorite tracks and listen to them instantly for free."}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Search;
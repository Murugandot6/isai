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
        musicApi.searchSongs(searchQuery, 1, 50), // Fetch more to allow for filtering
        musicApi.searchAlbums(searchQuery, 1, 50)
      ]);
      
      // Filter results by selected languages
      const filteredSongs = songs.filter(s => 
        selectedLanguages.includes(s.language.toLowerCase())
      );
      const filteredAlbums = albums.filter(a => 
        selectedLanguages.includes(a.language.toLowerCase())
      );

      setSongResults(filteredSongs);
      setAlbumResults(filteredAlbums);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  }, [selectedLanguages]);

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
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-black mb-8 tracking-tight text-center">Find Your Sound</h1>
          <form onSubmit={handleSubmit} className="relative group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={24} />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for songs, movies, or albums..." 
              className="pl-12 py-7 bg-accent/5 border-2 border-transparent focus-visible:ring-0 focus-visible:border-primary/20 rounded-2xl text-lg transition-all"
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-5 py-2 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="space-y-8">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
            <TabsList className="bg-accent/5 p-1 rounded-2xl mb-8 w-fit">
              <TabsTrigger value="songs" className="rounded-xl px-6 font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Music size={16} />
                Songs
                <span className="ml-1 text-[10px] bg-white/20 px-1.5 rounded-full">{songResults.length}</span>
              </TabsTrigger>
              <TabsTrigger value="albums" className="rounded-xl px-6 font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Disc size={16} />
                Albums
                <span className="ml-1 text-[10px] bg-white/20 px-1.5 rounded-full">{albumResults.length}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="songs" className="animate-in fade-in duration-500">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {songResults.map((song) => (
                  <SongCard key={song.id} song={song} allSongs={songResults} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="albums" className="animate-in fade-in duration-500">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {albumResults.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in slide-in-from-top-4 duration-500">
            <div className="bg-accent/5 p-8 rounded-full mb-6">
              <SearchIcon size={48} className="text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {urlQuery ? `No results for "${urlQuery}" in your selected languages` : "Start Exploring"}
            </h3>
            <p className="text-muted-foreground max-w-xs">
              {urlQuery ? "Try searching for something else or check your language filters in the header." : "Search for your favorite tracks and listen to them instantly for free."}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Search;
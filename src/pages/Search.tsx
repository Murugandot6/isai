"use client";

import React, { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song } from '@/services/musicApi';
import { SongCard } from '@/components/SongCard';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await musicApi.searchSongs(query);
      setResults(data);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-black mb-8 tracking-tight text-center">Find Your Sound</h1>
          <form onSubmit={handleSearch} className="relative group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={24} />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for songs, artists, or albums..." 
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

        <AnimatePresence mode="wait">
          {results.length > 0 ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              {results.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </motion.div>
          ) : !loading && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="bg-accent/5 p-8 rounded-full mb-6">
                <SearchIcon size={48} className="text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-bold mb-2">Start Exploring</h3>
              <p className="text-muted-foreground max-w-xs">Search for your favorite tracks and listen to them instantly for free.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};

export default Search;
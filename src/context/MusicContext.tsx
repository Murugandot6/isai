"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Song, musicApi } from '@/services/musicApi';
import { RadioStation } from '@/services/radioApi';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, Auth } from '@supabase/supabase-js';
import { useAuth } from './AuthContext';

export interface Playlist { ... } // unchanged

export interface Movie { ... } // unchanged

export interface SongMemory { ... } // unchanged

interface MusicContextType {
  // ... existing fields
  recentlyWatched: Movie[];
  addToWatchHistory: (movie: Movie) => void;
  loadWatchHistory: () => void;
  // ... rest unchanged
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  // ... existing state vars
  const [watchHistory, setWatchHistory] = useState<Movie[]>([]);
  const [watchHistoryLoaded, setWatchHistoryLoaded] = useState(false);

  // Load watch history from Supabase on mount
  useEffect(() => {
    const loadWatchHistory = async () => {
      if (!user) {
        setWatchHistory([]);
        setWatchHistoryLoaded(true);
        return;
      }
      
      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .order('played_at', { ascending: false })
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error loading watch history:', error);
        setWatchHistory([]);
      } else {
        setWatchHistory(data || []);
      }
      setWatchHistoryLoaded(true);
    };

    loadWatchHistory();
  }, [user]);

  const addToWatchHistory = async (movie: Movie) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('watch_history')
      .upsert({
        user_id: user.id,
        movie_id: movie.id,
        title: movie.title,
        poster: movie.poster,
        played_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .single();

      if (error) {
        console.error('Error adding to watch history:', error);
      } else {
        // Optimistically update local state
        setWatchHistory(prev => [movie, ...prev]);
      }
  };

  // ... rest of existing context code (playSong, etc.)

  return (
    <MusicContext.Provider value={{ ...context, 
      addToWatchHistory, 
      loadWatchHistory,
      watchHistory,
      watchHistoryLoaded
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within MusicProvider');
  return context;
};
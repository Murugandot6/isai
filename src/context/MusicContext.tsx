"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Song, Album, Playlist, Movie } from '@/services/musicApi';

export type { Song, Album, Playlist, Movie };

export interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'none' | 'all' | 'one';
  queue: Song[];
  likedSongs: Song[];
  playlists: Playlist[];
  recentlyPlayed: Song[];
  recentlyWatched: Movie[];
  likedMovies: Movie[];
  likedStations: any[];
  selectedLanguages: string[];
  roomCode: string | null;
  isHost: boolean;
  memories: any[];
  user: any;
  playSong: (song: Song, newQueue?: Song[], fromSync?: boolean) => void;
  playNext: (fromSync?: boolean) => void;
  playPrevious: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: (fromSync?: boolean) => void;
  toggleRepeat: () => void;
  toggleLike: (song: Song) => void;
  isLiked: (songId: string) => boolean;
  addToPlaylist: (playlistId: string, song: Song) => void;
  createPlaylist: (name: string) => void;
  addMemory: (song: Song, text: string) => void;
  deleteMemory: (memoryId: string) => void;
  toggleLikeMovie: (movie: Movie) => void;
  isMovieLiked: (movieId: string) => boolean;
  playMovie: (movie: Movie) => void;
  toggleLikeStation: (station: any) => void;
  isStationLiked: (stationId: string) => boolean;
  toggleLanguage: (lang: string) => void;
  setRoomCode: (code: string | null) => void;
  setIsHost: (host: boolean) => void;
  broadcast: (event: string, data: any) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [memories, setMemories] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [queue, setQueue] = useState<Song[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<Movie[]>([]);
  const [likedMovies, setLikedMovies] = useState<Movie[]>([]);
  const [likedStations, setLikedStations] = useState<any[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);

  const canDeleteMemory = useCallback((memoryId: string) => {
    const memory = memories.find(m => m.id === memoryId);
    return memory && memory.userId === user?.id;
  }, [memories, user]);

  const deleteMemory = useCallback((memoryId: string) => {
    if (!canDeleteMemory(memoryId)) {
      toast.error('You do not have permission to delete this memory.');
      return;
    }
    setMemories(prev => prev.filter(m => m.id !== memoryId));
  }, [canDeleteMemory]);

  const value = {
    currentSong: null,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    queue,
    likedSongs,
    playlists,
    recentlyPlayed,
    recentlyWatched,
    likedMovies,
    likedStations,
    selectedLanguages,
    roomCode,
    isHost,
    memories,
    user,
    playSong: () => {},
    playNext: () => {},
    playPrevious: () => {},
    togglePlay: () => {},
    seek: () => {},
    setVolume: setVolumeState,
    toggleMute: () => {},
    toggleShuffle: () => {},
    toggleRepeat: () => {},
    toggleLike: () => {},
    isLiked: () => false,
    addToPlaylist: () => {},
    createPlaylist: () => {},
    addMemory: () => {},
    deleteMemory,
    toggleLikeMovie: () => {},
    isMovieLiked: () => false,
    playMovie: () => {},
    toggleLikeStation: () => {},
    isStationLiked: () => false,
    toggleLanguage: () => {},
    setRoomCode,
    setIsHost,
    broadcast: () => {},
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

export default MusicContext;
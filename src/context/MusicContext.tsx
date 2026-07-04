"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Song, Album, Playlist, Movie } from '@/services/musicApi';
import { toast } from 'sonner';

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
  playRandom: (fromSync?: boolean) => void;
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
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  const playSong = useCallback((song: Song, newQueue?: Song[], fromSync = false) => {
    setCurrentSong(song);
    setIsPlaying(true);
    if (newQueue) {
      setQueue(newQueue);
    }
  }, []);

  const playRandom = useCallback((fromSync = false) => {
    if (queue.length === 0) return;
    const randomIndex = Math.floor(Math.random() * queue.length);
    const song = queue[randomIndex];
    playSong(song, queue, fromSync);
  }, [queue, playSong]);

  const playNext = useCallback((fromSync = false) => {
    if (queue.length === 0) return;
    const nextSong = queue[0];
    playSong(nextSong, queue, fromSync);
    setQueue(prev => prev.slice(1));
  }, [queue, playSong]);

  const playPrevious = useCallback(() => {
    // Navigate to previous song in queue
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const seek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (vol === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleShuffle = useCallback((fromSync = false) => {
    setIsShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  }, []);

  const toggleLike = useCallback((song: Song) => {
    setLikedSongs(prev => {
      const exists = prev.find(s => s.id === song.id);
      if (exists) {
        return prev.filter(s => s.id !== song.id);
      }
      return [song, ...prev];
    });
  }, []);

  const isLiked = useCallback((songId: string) => {
    return likedSongs.some(s => s.id === songId);
  }, [likedSongs]);

  const addToPlaylist = useCallback((playlistId: string, song: Song) => {
    // Add song to playlist
  }, []);

  const createPlaylist = useCallback((name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      image: null,
      songs: [],
    };
    setPlaylists(prev => [newPlaylist, ...prev]);
  }, []);

  const addMemory = useCallback((song: Song, text: string) => {
    const newMemory = {
      id: Date.now().toString(),
      text,
      song,
      createdAt: new Date().toISOString(),
      userId: user?.id,
    };
    setMemories(prev => [newMemory, ...prev]);
  }, [user]);

  const deleteMemory = useCallback((memoryId: string) => {
    setMemories(prev => prev.filter(m => m.id !== memoryId));
  }, []);

  const toggleLikeMovie = useCallback((movie: Movie) => {
    setLikedMovies(prev => {
      const exists = prev.find(m => m.id === movie.id);
      if (exists) {
        return prev.filter(m => m.id !== movie.id);
      }
      return [movie, ...prev];
    });
  }, []);

  const isMovieLiked = useCallback((movieId: string) => {
    return likedMovies.some(m => m.id === movieId);
  }, [likedMovies]);

  const playMovie = useCallback((movie: Movie) => {
    setRecentlyWatched(prev => {
      const exists = prev.find(m => m.id === movie.id);
      if (exists) return prev;
      return [movie, ...prev.slice(0, 50)];
    });
  }, []);

  const toggleLikeStation = useCallback((station: any) => {
    setLikedStations(prev => {
      const exists = prev.find(s => s.stationuuid === station.stationuuid);
      if (exists) {
        return prev.filter(s => s.stationuuid !== station.stationuuid);
      }
      return [station, ...prev];
    });
  }, []);

  const isStationLiked = useCallback((stationId: string) => {
    return likedStations.some(s => s.stationuuid === stationId);
  }, [likedStations]);

  const toggleLanguage = useCallback((lang: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(lang)) {
        return prev.filter(l => l !== lang);
      }
      return [...prev, lang];
    });
  }, []);

  const broadcast = useCallback((event: string, data: any) => {
    // Broadcast to other connected users
  }, []);

  const value = {
    currentSong,
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
    playSong,
    playNext,
    playPrevious,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    isLiked,
    addToPlaylist,
    createPlaylist,
    addMemory,
    deleteMemory,
    toggleLikeMovie,
    isMovieLiked,
    playMovie,
    toggleLikeStation,
    isStationLiked,
    toggleLanguage,
    setRoomCode,
    setIsHost,
    broadcast,
    playRandom,
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
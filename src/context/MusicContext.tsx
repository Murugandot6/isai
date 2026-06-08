"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Song, musicApi } from '@/services/musicApi';
import { RadioStation } from '@/services/radioApi';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

export interface Movie {
  id: string;
  title: string;
  overview: string;
  backdrop: string;
  poster: string;
  rating: number;
  year: string;
  genre: string;
  language: string;
}

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song, queue?: Song[], fromSync?: boolean) => Promise<void>;
  pauseSong: (fromSync?: boolean) => void;
  resumeSong: (fromSync?: boolean) => void;
  togglePlay: () => void;
  playNext: (fromSync?: boolean) => void;
  playPrevious: (fromSync?: boolean) => void;
  addToNext: (song: Song) => void;
  currentTime: number;
  duration: number;
  volume: number;
  setVolume: (v: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  seek: (time: number, fromSync?: boolean) => void;
  roomCode: string | null;
  setRoomCode: (code: string | null) => void;
  isHost: boolean;
  setIsHost: (isHost: boolean) => void;
  selectedLanguages: string[];
  toggleLanguage: (lang: string) => void;
  likedSongs: Song[];
  toggleLike: (song: Song) => void;
  isLiked: (songId: string) => boolean;
  likedStations: RadioStation[];
  toggleLikeStation: (station: RadioStation) => void;
  isStationLiked: (stationId: string) => boolean;
  recentlyPlayed: Song[];
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  isShuffle: boolean;
  toggleShuffle: (fromSync?: boolean) => void;
  repeatMode: 'none' | 'one' | 'all';
  toggleRepeat: (fromSync?: boolean) => void;
  queue: Song[];
  currentMovie: Movie | null;
  playMovie: (movie: Movie, fromSync?: boolean) => void;
  closeMovie: (fromSync?: boolean) => void;
  likedMovies: Movie[];
  toggleLikeMovie: (movie: Movie) => void;
  isMovieLiked: (movieId: string) => boolean;
  recentlyWatched: Movie[];
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['tamil']);
  
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');

  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [likedMovies, setLikedMovies] = useState<Movie[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<Movie[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<any>(null);
  const isChannelReady = useRef(false);

  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [likedStations, setLikedStations] = useState<RadioStation[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const savedLiked = localStorage.getItem('isai_liked_songs');
    const savedStations = localStorage.getItem('isai_liked_stations');
    const savedRecent = localStorage.getItem('isai_recent_songs');
    const savedPlaylists = localStorage.getItem('isai_playlists');
    const savedLikedMovies = localStorage.getItem('isai_liked_movies');
    const savedRecentMovies = localStorage.getItem('isai_recent_movies');

    if (savedLiked) try { setLikedSongs(JSON.parse(savedLiked)); } catch (e) {}
    if (savedStations) try { setLikedStations(JSON.parse(savedStations)); } catch (e) {}
    if (savedRecent) try { setRecentlyPlayed(JSON.parse(savedRecent)); } catch (e) {}
    if (savedPlaylists) try { setPlaylists(JSON.parse(savedPlaylists)); } catch (e) {}
    if (savedLikedMovies) try { setLikedMovies(JSON.parse(savedLikedMovies)); } catch (e) {}
    if (savedRecentMovies) try { setRecentlyWatched(JSON.parse(savedRecentMovies)); } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('isai_liked_songs', JSON.stringify(likedSongs));
    localStorage.setItem('isai_liked_stations', JSON.stringify(likedStations));
    localStorage.setItem('isai_recent_songs', JSON.stringify(recentlyPlayed));
    localStorage.setItem('isai_playlists', JSON.stringify(playlists));
    localStorage.setItem('isai_liked_movies', JSON.stringify(likedMovies));
    localStorage.setItem('isai_recent_movies', JSON.stringify(recentlyWatched));
  }, [likedSongs, likedStations, recentlyPlayed, playlists, likedMovies, recentlyWatched]);

  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const broadcast = useCallback((type: string, data: any) => {
    if (roomCode && channelRef.current && isChannelReady.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'sync',
        payload: { type, data, timestamp: Date.now() }
      });
    }
  }, [roomCode]);

  const playSong = useCallback(async (song: Song, newQueue?: Song[], fromSync: boolean = false) => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    
    const toastId = fromSync ? null : toast.loading("Fetching high quality stream...");
    
    try {
      if (currentMovie) setCurrentMovie(null);

      const isRadio = song.type === 'radio' || song.album?.id === 'radio';
      let fullDetails = song;

      // Fetch fresh details for streams if it's not a radio
      if (!isRadio) {
        const data = await musicApi.getSongDetails(song.id);
        if (data) fullDetails = data;
      }

      const streams = fullDetails.downloadUrl || [];
      // Prefer 320kbps (usually last in the list)
      const stream = streams.find(s => s.quality === '320kbps') || streams[streams.length - 1];
      const streamUrl = stream?.url || (song as any).url_resolved || (song as any).url;

      if (!streamUrl) throw new Error("No stream URL found");

      audio.src = streamUrl.replace('http://', 'https://');
      audio.load();
      await audio.play();

      setCurrentSong(fullDetails);
      setIsPlaying(true);
      
      if (newQueue) {
        setQueue(newQueue);
        setCurrentIndex(newQueue.findIndex(s => s.id === song.id));
      } else {
        const existingIdx = queue.findIndex(s => s.id === song.id);
        if (existingIdx !== -1) setCurrentIndex(existingIdx);
      }

      if (toastId) toast.dismiss(toastId);
      
      if (!fromSync) {
        setRecentlyPlayed(prev => [fullDetails, ...prev.filter(s => s.id !== fullDetails.id)].slice(0, 30));
        broadcast('play', { song: fullDetails, time: 0, queue: newQueue || queue });
      }
    } catch (error) {
      console.error(error);
      if (toastId) toast.error("Unable to play this track", { id: toastId });
      setIsPlaying(false);
    }
  }, [queue, currentMovie, broadcast]);

  const togglePlay = () => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      broadcast('pause', {});
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      broadcast('resume', {});
    }
  };

  const playNext = (fromSync: boolean = false) => {
    if (queue.length === 0) return;
    let nextIdx = currentIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeatMode === 'all') nextIdx = 0;
      else return;
    }
    playSong(queue[nextIdx]);
    if (!fromSync) broadcast('next', {});
  };

  const playPrevious = (fromSync: boolean = false) => {
    if (queue.length === 0) return;
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      if (repeatMode === 'all') prevIdx = queue.length - 1;
      else prevIdx = 0;
    }
    playSong(queue[prevIdx]);
    if (!fromSync) broadcast('prev', {});
  };

  const seek = (time: number, fromSync: boolean = false) => {
    if (audioRef.current && isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (!fromSync) broadcast('seek', { time });
    }
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) 
        ? (prev.length > 1 ? prev.filter(l => l !== lang) : prev) 
        : [...prev, lang]
    );
  };

  const isLiked = (songId: string) => likedSongs.some(s => s.id === songId);
  const toggleLike = (song: Song) => {
    setLikedSongs(prev => isLiked(song.id) ? prev.filter(s => s.id !== song.id) : [song, ...prev]);
  };

  const playMovie = (movie: Movie, fromSync: boolean = false) => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    setCurrentMovie(movie);
    if (!fromSync) {
      setRecentlyWatched(prev => [movie, ...prev.filter(m => m.id !== movie.id)].slice(0, 20));
      broadcast('play_movie', { movie });
    }
  };

  const closeMovie = (fromSync: boolean = false) => {
    setCurrentMovie(null);
    if (!fromSync) broadcast('close_movie', {});
  };

  const toggleLikeMovie = (movie: Movie) => {
    setLikedMovies(prev => prev.some(m => m.id === movie.id) ? prev.filter(m => m.id !== movie.id) : [movie, ...prev]);
  };

  const isMovieLiked = (movieId: string) => likedMovies.some(m => m.id === movieId);

  return (
    <MusicContext.Provider value={{
      currentSong, isPlaying, playSong, pauseSong: () => {}, resumeSong: () => {}, togglePlay, playNext, playPrevious,
      addToNext: (s) => setQueue(prev => [...prev.slice(0, currentIndex + 1), s, ...prev.slice(currentIndex + 1)]),
      currentTime, duration, volume, setVolume, isMuted, toggleMute, seek, roomCode, setRoomCode, isHost, setIsHost,
      selectedLanguages, toggleLanguage, likedSongs, toggleLike, isLiked, likedStations, toggleLikeStation: () => {}, isStationLiked: () => false,
      recentlyPlayed, playlists, 
      createPlaylist: (name) => setPlaylists(prev => [{ id: Math.random().toString(36).substr(2, 9), name, songs: [], createdAt: Date.now() }, ...prev]),
      addToPlaylist: (id, s) => setPlaylists(prev => prev.map(p => p.id === id ? { ...p, songs: [s, ...p.songs] } : p)),
      removeFromPlaylist: (id, sid) => setPlaylists(prev => prev.map(p => p.id === id ? { ...p, songs: p.songs.filter(s => s.id !== sid) } : p)),
      isShuffle, toggleShuffle: () => setIsShuffle(!isShuffle),
      repeatMode, toggleRepeat: () => setRepeatMode(prev => prev === 'none' ? 'one' : prev === 'one' ? 'all' : 'none'),
      queue, currentMovie, playMovie, closeMovie, likedMovies, toggleLikeMovie, isMovieLiked, recentlyWatched
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
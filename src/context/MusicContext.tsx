"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Song, musicApi, normalizeSong } from '@/services/musicApi';
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
  const messageQueue = useRef<any[]>([]);

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

    if (savedLiked) setLikedSongs(JSON.parse(savedLiked));
    if (savedStations) setLikedStations(JSON.parse(savedStations));
    if (savedRecent) setRecentlyPlayed(JSON.parse(savedRecent));
    if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));
    if (savedLikedMovies) setLikedMovies(JSON.parse(savedLikedMovies));
    if (savedRecentMovies) setRecentlyWatched(JSON.parse(savedRecentMovies));
  }, []);

  useEffect(() => {
    localStorage.setItem('isai_liked_stations', JSON.stringify(likedStations));
    localStorage.setItem('isai_recent_songs', JSON.stringify(recentlyPlayed));
    localStorage.setItem('isai_playlists', JSON.stringify(playlists));
    localStorage.setItem('isai_liked_movies', JSON.stringify(likedMovies));
    localStorage.setItem('isai_recent_movies', JSON.stringify(recentlyWatched));
  }, [likedStations, recentlyPlayed, playlists, likedMovies, recentlyWatched]);

  const toggleLike = async (song: Song) => {
    const isCurrentlyLiked = likedSongs.some(s => s.id === song.id);
    let newLikedSongs;
    if (isCurrentlyLiked) {
      newLikedSongs = likedSongs.filter(s => s.id !== song.id);
    } else {
      newLikedSongs = [song, ...likedSongs];
    }
    setLikedSongs(newLikedSongs);
    localStorage.setItem('isai_liked_songs', JSON.stringify(newLikedSongs));
  };

  const isLiked = (songId: string) => likedSongs.some(s => s.id === songId);

  const toggleLikeMovie = (movie: Movie) => {
    setLikedMovies(prev => {
      const exists = prev.find(m => m.id === movie.id);
      if (exists) return prev.filter(m => m.id !== movie.id);
      return [movie, ...prev];
    });
  };

  const isMovieLiked = (movieId: string) => likedMovies.some(m => m.id === movieId);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.preload = "auto";
    }
    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : volume;
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [volume, isMuted]);

  const stateRef = useRef({ currentSong, isPlaying, roomCode, queue, currentIndex, isShuffle, repeatMode, currentMovie });
  useEffect(() => {
    stateRef.current = { currentSong, isPlaying, roomCode, queue, currentIndex, isShuffle, repeatMode, currentMovie };
  }, [currentSong, isPlaying, roomCode, queue, currentIndex, isShuffle, repeatMode, currentMovie]);

  const broadcast = useCallback((type: string, data: any) => {
    const payload = { type, data, timestamp: Date.now() };
    if (stateRef.current.roomCode && channelRef.current && isChannelReady.current) {
      channelRef.current.send({ type: 'broadcast', event: 'sync', payload });
    } else if (stateRef.current.roomCode) {
      messageQueue.current.push(payload);
    }
  }, []);

  const playSong = useCallback(async (song: Song, newQueue?: Song[], fromSync: boolean = false) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
    }
    
    const audio = audioRef.current;
    const toastId = fromSync ? null : toast.loading("Loading stream...");
    
    try {
      if (stateRef.current.currentMovie) {
        setCurrentMovie(null);
      }

      const isRadio = song.type === 'radio' || song.id.includes('ISAI-RADIO') || song.album?.id === 'radio';
      
      let fullSong = song;
      // If it's not a radio and doesn't have download URLs, fetch them
      if (!isRadio && (!song.downloadUrl || song.downloadUrl.length === 0)) {
        const details = await musicApi.getSongDetails(song.id);
        if (details) fullSong = details;
      }
      
      fullSong = normalizeSong(fullSong);
      const downloadUrls = fullSong.downloadUrl || [];

      if (downloadUrls.length === 0 && !isRadio) {
        if (toastId) toast.error("No stream links found.", { id: toastId });
        return;
      }

      audio.pause();
      
      // Prepare links: Radio uses url_resolved, Songs use downloadUrl array
      const links = isRadio 
        ? [{ link: (song as any).downloadUrl?.[0]?.link || (song as any).url_resolved || (song as any).url }] 
        : [...downloadUrls].reverse(); // Try highest quality first
      
      let success = false;
      for (const linkObj of links) {
        const rawUrl = linkObj.link || (linkObj as any).url;
        if (!rawUrl) continue;
        
        try {
          const streamUrl = rawUrl.replace('http://', 'https://');
          audio.src = streamUrl;
          audio.load();
          
          // Direct play attempt
          await audio.play();
          success = true;
          break;
        } catch (e) {
          console.warn("Failed to play link, trying next...", e);
          continue;
        }
      }

      if (!success) throw new Error("All stream links failed");

      setCurrentSong(fullSong);
      setIsPlaying(true);
      if (toastId) toast.dismiss(toastId);

      if (newQueue) {
        setQueue(newQueue.map(normalizeSong));
        const idx = newQueue.findIndex(s => s.id === song.id);
        setCurrentIndex(idx);
      } else if (stateRef.current.queue.length > 0) {
        const idx = stateRef.current.queue.findIndex(s => s.id === song.id);
        setCurrentIndex(idx);
      } else {
        setQueue([fullSong]);
        setCurrentIndex(0);
      }

      if (!fromSync) {
        setRecentlyPlayed(prev => [fullSong, ...prev.filter(s => s.id !== fullSong.id)].slice(0, 30));
        broadcast('play', { song: fullSong, playing: true, time: 0, queue: newQueue || stateRef.current.queue });
      }
    } catch (error) {
      console.error('Playback Error:', error);
      if (toastId) toast.error("Failed to play this track.", { id: toastId });
      setIsPlaying(false);
    }
  }, [broadcast]);

  const playMovie = useCallback((movie: Movie, fromSync: boolean = false) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentMovie(movie);

    if (!fromSync) {
      setRecentlyWatched(prev => [movie, ...prev.filter(m => m.id !== movie.id)].slice(0, 20));
      toast.success(`Now playing: ${movie.title}`);
      broadcast('play_movie', { movie });
    }
  }, [broadcast]);

  const closeMovie = useCallback((fromSync: boolean = false) => {
    setCurrentMovie(null);
    if (!fromSync) {
      broadcast('close_movie', {});
    }
  }, [broadcast]);

  const playNext = useCallback((fromSync: boolean = false) => {
    const { queue, currentIndex, isShuffle, repeatMode, currentSong } = stateRef.current;
    if (queue.length === 0) return;
    
    let nextIndex = currentIndex + 1;
    
    if (isShuffle) {
      const sameLangSongs = queue.filter(s => s.language === currentSong?.language);
      if (sameLangSongs.length > 1) {
        const randomSong = sameLangSongs[Math.floor(Math.random() * sameLangSongs.length)];
        nextIndex = queue.findIndex(s => s.id === randomSong.id);
      } else {
        nextIndex = Math.floor(Math.random() * queue.length);
      }
    } else if (nextIndex >= queue.length) {
      if (repeatMode === 'all') nextIndex = 0;
      else return;
    }
    
    playSong(queue[nextIndex]);
    if (!fromSync) broadcast('next', {});
  }, [playSong, broadcast]);

  const playPrevious = useCallback((fromSync: boolean = false) => {
    const { queue, currentIndex, repeatMode } = stateRef.current;
    if (queue.length === 0) return;
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (repeatMode === 'all') prevIndex = queue.length - 1;
      else prevIndex = 0;
    }
    playSong(queue[prevIndex]);
    if (!fromSync) broadcast('prev', {});
  }, [playSong, broadcast]);

  const addToNext = useCallback((song: Song) => {
    const normalized = normalizeSong(song);
    setQueue(prev => {
      const newQueue = [...prev];
      const insertAt = currentIndex + 1;
      newQueue.splice(insertAt, 0, normalized);
      return newQueue;
    });
    toast.success("Added to play next");
    broadcast('queue_update', { queue: [...stateRef.current.queue] });
  }, [currentIndex, broadcast]);

  const pauseSong = useCallback((fromSync: boolean = false) => {
    audioRef.current?.pause();
    setIsPlaying(false);
    if (!fromSync) broadcast('pause', {});
  }, [broadcast]);

  const resumeSong = useCallback((fromSync: boolean = false) => {
    audioRef.current?.play().catch(() => {});
    setIsPlaying(true);
    if (!fromSync) broadcast('resume', {});
  }, [broadcast]);

  const seek = useCallback((time: number, fromSync: boolean = false) => {
    const isRadio = stateRef.current.currentSong?.type === 'radio' || stateRef.current.currentSong?.album?.id === 'radio';
    if (isRadio) return;

    if (audioRef.current && isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (!fromSync) broadcast('seek', { time });
    }
  }, [broadcast]);

  const toggleShuffle = (fromSync: boolean = false) => {
    setIsShuffle(prev => {
      const next = !prev;
      if (!fromSync) broadcast('shuffle', { isShuffle: next });
      return next;
    });
  };

  const toggleRepeat = (fromSync: boolean = false) => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
    setRepeatMode(prev => {
      const next = modes[(modes.indexOf(prev) + 1) % modes.length];
      if (!fromSync) broadcast('repeat', { repeatMode: next });
      return next;
    });
  };

  const toggleMute = () => setIsMuted(prev => !prev);

  const functionsRef = useRef({ playSong, pauseSong, resumeSong, seek, broadcast, playNext, playPrevious, toggleShuffle, toggleRepeat, addToNext, playMovie, closeMovie });
  useEffect(() => {
    functionsRef.current = { playSong, pauseSong, resumeSong, seek, broadcast, playNext, playPrevious, toggleShuffle, toggleRepeat, addToNext, playMovie, closeMovie };
  }, [playSong, pauseSong, resumeSong, seek, broadcast, playNext, playPrevious, toggleShuffle, toggleRepeat, addToNext, playMovie, closeMovie]);

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const handleEnded = () => {
      if (stateRef.current.repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        functionsRef.current.playNext();
      }
    };
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  useEffect(() => {
    if (!roomCode) {
      if (channelRef.current) channelRef.current.unsubscribe();
      isChannelReady.current = false;
      return;
    }
    const channel = supabase.channel(`room:${roomCode}`, { config: { broadcast: { self: false, ack: true } } });
    channel
      .on('broadcast', { event: 'sync' }, ({ payload }) => {
        const { type, data } = payload;
        const { playSong: play, pauseSong: pause, resumeSong: resume, seek: sk, broadcast: bc, playNext: next, playPrevious: prev, toggleShuffle: shuf, toggleRepeat: rep, playMovie: pm, closeMovie: cm } = functionsRef.current;
        switch (type) {
          case 'request_state':
            if (stateRef.current.currentMovie) {
              bc('play_movie', { movie: stateRef.current.currentMovie });
            } else if (stateRef.current.currentSong) {
              bc('play', { song: stateRef.current.currentSong, playing: stateRef.current.isPlaying, time: audioRef.current?.currentTime || 0, queue: stateRef.current.queue });
            }
            break;
          case 'play':
            if (data.song) {
              const isRadioSong = data.song.type === 'radio' || data.song.album?.id === 'radio';
              play(data.song, data.queue, true).then(() => { 
                if (data.time && !isRadioSong && audioRef.current) {
                  audioRef.current.currentTime = data.time; 
                }
              });
            }
            break;
          case 'play_movie':
            if (data.movie) {
              pm(data.movie, true);
            }
            break;
          case 'close_movie':
            cm(true);
            break;
          case 'pause': pause(true); break;
          case 'resume': resume(true); break;
          case 'next': next(true); break;
          case 'prev': prev(true); break;
          case 'seek': sk(data.time, true); break;
          case 'shuffle': shuf(true); break;
          case 'repeat': rep(true); break;
          case 'queue_update': setQueue(data.queue); break;
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isChannelReady.current = true;
          toast.success("Connected to room!");
          while (messageQueue.current.length > 0) channel.send({ type: 'broadcast', event: 'sync', payload: messageQueue.current.shift() });
          setTimeout(() => functionsRef.current.broadcast('request_state', {}), 1000);
        }
      });
    channelRef.current = channel;
    return () => { channel.unsubscribe(); isChannelReady.current = false; };
  }, [roomCode]);

  const togglePlay = () => isPlaying ? pauseSong() : resumeSong();
  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = { id: Math.random().toString(36).substr(2, 9), name, songs: [], createdAt: Date.now() };
    setPlaylists(prev => [newPlaylist, ...prev]);
    toast.success(`Playlist "${name}" created!`);
  };
  const addToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        if (p.songs.some(s => s.id === song.id)) { toast.info("Song already in playlist"); return p; }
        toast.success(`Added to ${p.name}`);
        return { ...p, songs: [song, ...p.songs] };
      }
      return p;
    }));
  };
  const removeFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, songs: p.songs.filter(s => s.id !== songId) } : p));
  };
  const toggleLanguage = (lang: string) => setSelectedLanguages(prev => prev.includes(lang) ? prev.length > 1 ? prev.filter(l => l !== lang) : prev : [...prev, lang]);
  
  const toggleLikeStation = (station: RadioStation) => setLikedStations(prev => {
    const exists = prev.find(s => s.stationuuid === station.stationuuid);
    if (exists) return prev.filter(s => s.stationuuid !== station.stationuuid);
    return [station, ...prev];
  });
  const isStationLiked = (stationId: string) => likedStations.some(s => s.stationuuid === stationId);

  return (
    <MusicContext.Provider value={{
      currentSong, isPlaying, playSong, pauseSong, resumeSong, togglePlay, playNext, playPrevious, addToNext,
      currentTime, duration, volume, setVolume, isMuted, toggleMute, seek, roomCode, setRoomCode, isHost, setIsHost,
      selectedLanguages, toggleLanguage, likedSongs, toggleLike, isLiked, likedStations, toggleLikeStation, isStationLiked,
      recentlyPlayed, playlists, createPlaylist, addToPlaylist, removeFromPlaylist, isShuffle, toggleShuffle, repeatMode, toggleRepeat,
      queue,
      currentMovie, playMovie, closeMovie,
      likedMovies, toggleLikeMovie, isMovieLiked, recentlyWatched
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
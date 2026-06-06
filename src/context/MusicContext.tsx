"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Song, musicApi } from '@/services/musicApi';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
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
  currentTime: number;
  duration: number;
  volume: number;
  setVolume: (v: number) => void;
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
  recentlyPlayed: Song[];
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  isShuffle: boolean;
  toggleShuffle: () => void;
  repeatMode: 'none' | 'one' | 'all';
  toggleRepeat: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['english', 'hindi', 'tamil']);
  
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<any>(null);
  const isChannelReady = useRef(false);
  const messageQueue = useRef<any[]>([]);

  // Initialize Audio on mount
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    const audio = audioRef.current;
    audio.volume = volume;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const stateRef = useRef({ currentSong, isPlaying, roomCode, queue, currentIndex, isShuffle, repeatMode });
  useEffect(() => {
    stateRef.current = { currentSong, isPlaying, roomCode, queue, currentIndex, isShuffle, repeatMode };
  }, [currentSong, isPlaying, roomCode, queue, currentIndex, isShuffle, repeatMode]);

  const [likedSongs, setLikedSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('sonic_liked_songs');
    return saved ? JSON.parse(saved) : [];
  });

  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>(() => {
    const saved = localStorage.getItem('sonic_recent_songs');
    return saved ? JSON.parse(saved) : [];
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('sonic_playlists');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sonic_liked_songs', JSON.stringify(likedSongs));
    localStorage.setItem('sonic_recent_songs', JSON.stringify(recentlyPlayed));
    localStorage.setItem('sonic_playlists', JSON.stringify(playlists));
  }, [likedSongs, recentlyPlayed, playlists]);

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
    }
    
    const toastId = fromSync ? null : toast.loading("Loading track...");
    
    try {
      const isRadio = song.type === 'radio' || song.id.includes('ISAI-RADIO');
      const fullSong = isRadio ? song : (await musicApi.getSongDetails(song.id) || song);
      
      const downloadUrls = fullSong.downloadUrl || [];
      if (downloadUrls.length === 0) {
        if (toastId) toast.error("No stream links found.", { id: toastId });
        return;
      }

      // Try highest quality first (usually last in array)
      const links = [...downloadUrls].reverse();
      let success = false;

      for (const linkObj of links) {
        try {
          const rawUrl = linkObj.link || linkObj.url;
          if (!rawUrl) continue;
          const streamUrl = rawUrl.replace('http://', 'https://');
          
          const audio = audioRef.current;
          audio.pause();
          audio.src = streamUrl;
          audio.load();
          
          await new Promise((resolve, reject) => {
            const onCanPlay = () => { resolve(true); audio.removeEventListener('canplay', onCanPlay); };
            const onError = () => { reject(new Error("Link broken")); audio.removeEventListener('error', onError); };
            audio.addEventListener('canplay', onCanPlay);
            audio.addEventListener('error', onError);
            setTimeout(() => reject(new Error("Timeout")), 10000);
          });

          await audio.play();
          success = true;
          break;
        } catch (e) { continue; }
      }

      if (!success) throw new Error("All stream links failed");
      
      setCurrentSong(fullSong);
      setIsPlaying(true);
      if (toastId) toast.success(`Playing: ${fullSong.name}`, { id: toastId });

      if (newQueue) {
        setQueue(newQueue);
        const idx = newQueue.findIndex(s => s.id === song.id);
        setCurrentIndex(idx);
      } else if (stateRef.current.queue.length > 0) {
        const idx = stateRef.current.queue.findIndex(s => s.id === song.id);
        setCurrentIndex(idx);
      }

      if (!fromSync) {
        setRecentlyPlayed(prev => [fullSong, ...prev.filter(s => s.id !== fullSong.id)].slice(0, 30));
        broadcast('play', { song: fullSong, playing: true, time: 0, queue: newQueue });
      }
    } catch (error) {
      console.error('Playback Error:', error);
      if (toastId) toast.error("Failed to play this track.", { id: toastId });
      setIsPlaying(false);
    }
  }, [broadcast]);

  const playNext = useCallback((fromSync: boolean = false) => {
    const { queue, currentIndex, isShuffle, repeatMode } = stateRef.current;
    if (queue.length === 0) return;

    let nextIndex = currentIndex + 1;
    
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
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
    if (audioRef.current && isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (!fromSync) broadcast('seek', { time });
    }
  }, [broadcast]);

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
    toast.info(`Shuffle ${!isShuffle ? 'On' : 'Off'}`);
  };

  const toggleRepeat = () => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
    const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    setRepeatMode(nextMode);
    toast.info(`Repeat Mode: ${nextMode.toUpperCase()}`);
  };

  const functionsRef = useRef({ playSong, pauseSong, resumeSong, seek, broadcast, playNext, playPrevious });
  useEffect(() => {
    functionsRef.current = { playSong, pauseSong, resumeSong, seek, broadcast, playNext, playPrevious };
  }, [playSong, pauseSong, resumeSong, seek, broadcast, playNext, playPrevious]);

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
        const { playSong: play, pauseSong: pause, resumeSong: resume, seek: sk, broadcast: bc, playNext: next, playPrevious: prev } = functionsRef.current;
        switch (type) {
          case 'request_state':
            if (stateRef.current.currentSong) bc('play', { song: stateRef.current.currentSong, playing: stateRef.current.isPlaying, time: audioRef.current?.currentTime || 0, queue: stateRef.current.queue });
            break;
          case 'play':
            if (data.song) play(data.song, data.queue, true).then(() => { if (data.time) audioRef.current!.currentTime = data.time; });
            break;
          case 'pause': pause(true); break;
          case 'resume': resume(true); break;
          case 'next': next(true); break;
          case 'prev': prev(true); break;
          case 'seek': sk(data.time, true); break;
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
  const toggleLike = (song: Song) => setLikedSongs(prev => {
    const exists = prev.find(s => s.id === song.id);
    if (exists) { toast.info(`Removed from liked songs`); return prev.filter(s => s.id !== song.id); }
    toast.success(`Added to liked songs`); return [song, ...prev];
  });
  const isLiked = (songId: string) => likedSongs.some(s => s.id === songId);

  return (
    <MusicContext.Provider value={{
      currentSong, isPlaying, playSong, pauseSong, resumeSong, togglePlay, playNext, playPrevious,
      currentTime, duration, volume, setVolume, seek, roomCode, setRoomCode, isHost, setIsHost,
      selectedLanguages, toggleLanguage, likedSongs, toggleLike, isLiked, recentlyPlayed, playlists,
      createPlaylist, addToPlaylist, removeFromPlaylist, isShuffle, toggleShuffle, repeatMode, toggleRepeat
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
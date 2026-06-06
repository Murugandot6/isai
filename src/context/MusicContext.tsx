"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
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
  playSong: (song: Song, fromSync?: boolean) => Promise<void>;
  pauseSong: (fromSync?: boolean) => void;
  resumeSong: (fromSync?: boolean) => void;
  togglePlay: () => void;
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('sonic_liked_songs', JSON.stringify(likedSongs));
    localStorage.setItem('sonic_recent_songs', JSON.stringify(recentlyPlayed));
    localStorage.setItem('sonic_playlists', JSON.stringify(playlists));
  }, [likedSongs, recentlyPlayed, playlists]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    const audio = audioRef.current;
    audio.volume = volume;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const broadcast = (type: string, data: any) => {
    if (roomCode && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'sync',
        payload: { type, data }
      });
    }
  };

  // Sync effect with initialization request
  useEffect(() => {
    if (!roomCode) {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      return;
    }

    const channel = supabase.channel(`room:${roomCode}`, {
      config: { broadcast: { self: false } }
    });

    channel
      .on('broadcast', { event: 'sync' }, ({ payload }) => {
        const { type, data } = payload;
        
        switch (type) {
          case 'request_state':
            // If someone joins and asks for state, and we are playing, share it
            if (currentSong) {
              broadcast('play', { 
                song: currentSong, 
                playing: isPlaying, 
                time: audioRef.current?.currentTime 
              });
            }
            break;
          case 'play':
            if (data.song) {
              // Only trigger play if it's a different song or we are starting from scratch
              if (!currentSong || currentSong.id !== data.song.id) {
                playSong(data.song, true).then(() => {
                  if (data.time) audioRef.current!.currentTime = data.time;
                  if (data.playing === false) audioRef.current?.pause();
                });
              } else if (data.time && Math.abs(data.time - audioRef.current!.currentTime) > 3) {
                audioRef.current!.currentTime = data.time;
              }
            }
            break;
          case 'pause':
            pauseSong(true);
            break;
          case 'resume':
            resumeSong(true);
            break;
          case 'seek':
            if (Math.abs(data.time - audioRef.current!.currentTime) > 2) {
              seek(data.time, true);
            }
            break;
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Ask for current state as soon as we join the room
          setTimeout(() => broadcast('request_state', {}), 500);
        }
      });

    channelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [roomCode, currentSong, isPlaying]);

  const playSong = async (song: Song, fromSync: boolean = false) => {
    if (!audioRef.current) return;
    
    try {
      // Get fresh details to ensure we have the correct download links
      const details = await musicApi.getSongDetails(song.id);
      const fullSong = details || song;
      
      const downloadUrls = fullSong.downloadUrl || [];
      if (downloadUrls.length === 0) {
        toast.error("No stream links found for this track.");
        return;
      }

      // Find best quality link and ensure it's HTTPS
      const bestLink = downloadUrls[downloadUrls.length - 1].link;
      const streamUrl = bestLink.replace('http://', 'https://');
      
      const audio = audioRef.current;
      audio.pause();
      audio.src = streamUrl;
      audio.load();
      await audio.play();
      
      setCurrentSong(fullSong);
      setIsPlaying(true);

      if (!fromSync) {
        setRecentlyPlayed(prev => [fullSong, ...prev.filter(s => s.id !== fullSong.id)].slice(0, 30));
        broadcast('play', { 
          song: fullSong, 
          playing: true, 
          time: 0 
        });
      }
    } catch (error) {
      console.error('Playback Error:', error);
      toast.error("Failed to play this track. Link might be expired.");
      setIsPlaying(false);
    }
  };

  const pauseSong = (fromSync: boolean = false) => {
    audioRef.current?.pause();
    setIsPlaying(false);
    if (!fromSync) broadcast('pause', {});
  };

  const resumeSong = (fromSync: boolean = false) => {
    audioRef.current?.play().catch(() => {});
    setIsPlaying(true);
    if (!fromSync) broadcast('resume', {});
  };

  const togglePlay = () => isPlaying ? pauseSong() : resumeSong();

  const seek = (time: number, fromSync: boolean = false) => {
    if (audioRef.current && isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (!fromSync) broadcast('seek', { time });
    }
  };

  // Rest of the implementation...
  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      songs: [],
      createdAt: Date.now()
    };
    setPlaylists(prev => [newPlaylist, ...prev]);
    toast.success(`Playlist "${name}" created!`);
  };

  const addToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        if (p.songs.some(s => s.id === song.id)) {
          toast.info("Song already in playlist");
          return p;
        }
        toast.success(`Added to ${p.name}`);
        return { ...p, songs: [song, ...p.songs] };
      }
      return p;
    }));
  };

  const removeFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter(s => s.id !== songId) };
      }
      return p;
    }));
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) 
        ? prev.length > 1 ? prev.filter(l => l !== lang) : prev 
        : [...prev, lang]
    );
  };

  const toggleLike = (song: Song) => {
    setLikedSongs(prev => {
      const exists = prev.find(s => s.id === song.id);
      if (exists) {
        toast.info(`Removed from liked songs`);
        return prev.filter(s => s.id !== song.id);
      }
      toast.success(`Added to liked songs`);
      return [song, ...prev];
    });
  };

  const isLiked = (songId: string) => likedSongs.some(s => s.id === songId);

  return (
    <MusicContext.Provider value={{
      currentSong, isPlaying, playSong, pauseSong, resumeSong,
      togglePlay, currentTime, duration, volume, setVolume, seek,
      roomCode, setRoomCode, isHost, setIsHost,
      selectedLanguages, toggleLanguage,
      likedSongs, toggleLike, isLiked,
      recentlyPlayed, playlists, createPlaylist, addToPlaylist, removeFromPlaylist
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
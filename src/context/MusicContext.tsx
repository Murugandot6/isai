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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<any>(null);
  const isChannelReady = useRef(false);
  const messageQueue = useRef<any[]>([]);

  // State Ref for Realtime access
  const stateRef = useRef({ currentSong, isPlaying, roomCode });
  useEffect(() => {
    stateRef.current = { currentSong, isPlaying, roomCode };
  }, [currentSong, isPlaying, roomCode]);

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

  const broadcast = useCallback((type: string, data: any) => {
    const payload = { type, data, timestamp: Date.now() };
    
    if (stateRef.current.roomCode && channelRef.current && isChannelReady.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'sync',
        payload
      });
    } else if (stateRef.current.roomCode) {
      // Queue message if channel isn't ready yet
      messageQueue.current.push(payload);
    }
  }, []);

  const playSong = useCallback(async (song: Song, fromSync: boolean = false) => {
    if (!audioRef.current) return;
    
    const toastId = fromSync ? null : toast.loading("Loading track...");
    
    try {
      const details = await musicApi.getSongDetails(song.id);
      const fullSong = details || song;
      
      const downloadUrls = fullSong.downloadUrl || [];
      if (downloadUrls.length === 0) {
        if (toastId) toast.error("No stream links found.", { id: toastId });
        return;
      }

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
            const onCanPlay = () => {
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              resolve(true);
            };
            const onError = () => {
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              reject(new Error("Link broken"));
            };
            audio.addEventListener('canplay', onCanPlay);
            audio.addEventListener('error', onError);
            setTimeout(() => reject(new Error("Timeout")), 10000);
          });

          await audio.play();
          success = true;
          break;
        } catch (e) {
          continue;
        }
      }

      if (!success) throw new Error("All stream links failed");
      
      setCurrentSong(fullSong);
      setIsPlaying(true);
      if (toastId) toast.success(`Playing: ${fullSong.name}`, { id: toastId });

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
      if (toastId) toast.error("Failed to play this track.", { id: toastId });
      setIsPlaying(false);
    }
  }, [broadcast]);

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

  // Functions Ref to avoid stale closures in subscription
  const functionsRef = useRef({ playSong, pauseSong, resumeSong, seek, broadcast });
  useEffect(() => {
    functionsRef.current = { playSong, pauseSong, resumeSong, seek, broadcast };
  }, [playSong, pauseSong, resumeSong, seek, broadcast]);

  useEffect(() => {
    if (!roomCode) {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      isChannelReady.current = false;
      return;
    }

    const channel = supabase.channel(`room:${roomCode}`, {
      config: { broadcast: { self: false, ack: true } }
    });

    channel
      .on('broadcast', { event: 'sync' }, ({ payload }) => {
        const { type, data } = payload;
        const { playSong: play, pauseSong: pause, resumeSong: resume, seek: sk, broadcast: bc } = functionsRef.current;
        const currentAudio = audioRef.current;
        
        switch (type) {
          case 'request_state':
            if (stateRef.current.currentSong) {
              bc('play', { 
                song: stateRef.current.currentSong, 
                playing: stateRef.current.isPlaying, 
                time: currentAudio?.currentTime || 0
              });
            }
            break;
          case 'play':
            if (data.song) {
              const isDifferentSong = !stateRef.current.currentSong || stateRef.current.currentSong.id !== data.song.id;
              if (isDifferentSong) {
                play(data.song, true).then(() => {
                  if (data.time && audioRef.current) {
                    audioRef.current.currentTime = data.time;
                  }
                });
              } else if (data.time && currentAudio && Math.abs(data.time - currentAudio.currentTime) > 3) {
                currentAudio.currentTime = data.time;
              }
            }
            break;
          case 'pause':
            pause(true);
            break;
          case 'resume':
            resume(true);
            break;
          case 'seek':
            if (currentAudio && Math.abs(data.time - currentAudio.currentTime) > 2) {
              sk(data.time, true);
            }
            break;
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isChannelReady.current = true;
          toast.success("Connected to room!");
          
          // Send any queued messages
          while (messageQueue.current.length > 0) {
            const msg = messageQueue.current.shift();
            channel.send({ type: 'broadcast', event: 'sync', payload: msg });
          }

          // Ask for current state
          setTimeout(() => {
            functionsRef.current.broadcast('request_state', {});
          }, 1000);
        }
      });

    channelRef.current = channel;
    return () => { 
      channel.unsubscribe(); 
      isChannelReady.current = false;
    };
  }, [roomCode]);

  const togglePlay = () => isPlaying ? pauseSong() : resumeSong();

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
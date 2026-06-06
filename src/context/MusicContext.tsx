"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Song, musicApi } from '@/services/musicApi';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      // Important for cross-origin audio streams
      audioRef.current.crossOrigin = "anonymous";
    }
    
    const audio = audioRef.current;
    audio.volume = volume;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleError = (e: any) => {
      console.error("Audio error:", audio.error);
      setIsPlaying(false);
      if (audio.src) {
        toast.error("Unable to play this track. It might be restricted or unavailable.");
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Real-time Sync logic using Supabase
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
        if (isHost) return; 
        const { song, playing, time } = payload;
        if (song && (!currentSong || currentSong.id !== song.id)) playSong(song, true);
        if (playing !== undefined && playing !== isPlaying) playing ? resumeSong(true) : pauseSong(true);
        if (time !== undefined && Math.abs(time - audioRef.current!.currentTime) > 3) seek(time, true);
      })
      .subscribe();

    channelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [roomCode, isHost, currentSong, isPlaying]);

  // Host broadcasting
  useEffect(() => {
    if (!isHost || !roomCode || !channelRef.current) return;
    const interval = setInterval(() => {
      channelRef.current.send({
        type: 'broadcast',
        event: 'sync',
        payload: { song: currentSong, playing: isPlaying, time: audioRef.current?.currentTime || 0 }
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isHost, roomCode, currentSong, isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const playSong = async (song: Song, fromSync: boolean = false) => {
    if (!audioRef.current) return;
    
    try {
      let fullSong = song;
      // Fetch details if download links are missing
      if (!song.downloadUrl || song.downloadUrl.length === 0) {
        const details = await musicApi.getSongDetails(song.id);
        if (details) fullSong = details;
      }
      
      const downloadUrls = fullSong.downloadUrl;
      if (!downloadUrls || downloadUrls.length === 0) {
        toast.error("No playable source found.");
        return;
      }
      
      // Select 160kbps (index 2 or 3) as it's the most compatible across browsers
      const qualityIndex = downloadUrls.length >= 3 ? 2 : downloadUrls.length - 1;
      let streamUrl = (downloadUrls[qualityIndex] as any).link || (downloadUrls[qualityIndex] as any).url;
      
      if (!streamUrl) {
        toast.error("Invalid stream URL.");
        return;
      }

      // Ensure HTTPS and remove any accidental encoding that breaks audio tags
      streamUrl = String(streamUrl).replace('http://', 'https://');
      
      const audio = audioRef.current;
      audio.pause();
      audio.src = streamUrl;
      audio.load();
      
      await audio.play();
      
      setCurrentSong(fullSong);
      setIsPlaying(true);

      if (isHost && roomCode && !fromSync && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'sync',
          payload: { song: fullSong, playing: true, time: 0 }
        });
      }
    } catch (error: any) {
      console.error('Playback failed:', error);
      setIsPlaying(false);
    }
  };

  const pauseSong = (fromSync: boolean = false) => {
    audioRef.current?.pause();
    setIsPlaying(false);
    if (isHost && roomCode && !fromSync && channelRef.current) {
      channelRef.current.send({ type: 'broadcast', event: 'sync', payload: { playing: false, time: audioRef.current?.currentTime } });
    }
  };

  const resumeSong = (fromSync: boolean = false) => {
    if (audioRef.current?.src) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
      if (isHost && roomCode && !fromSync && channelRef.current) {
        channelRef.current.send({ type: 'broadcast', event: 'sync', payload: { playing: true, time: audioRef.current?.currentTime } });
      }
    }
  };

  const togglePlay = () => isPlaying ? pauseSong() : resumeSong();

  const seek = (time: number, fromSync: boolean = false) => {
    if (audioRef.current && isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (isHost && roomCode && !fromSync && channelRef.current) {
        channelRef.current.send({ type: 'broadcast', event: 'sync', payload: { time } });
      }
    }
  };

  return (
    <MusicContext.Provider value={{
      currentSong, isPlaying, playSong, pauseSong, resumeSong,
      togglePlay, currentTime, duration, volume, setVolume, seek,
      roomCode, setRoomCode, isHost, setIsHost
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
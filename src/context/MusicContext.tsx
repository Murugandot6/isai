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

  // Initialize Audio
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    // Removing crossOrigin as it can sometimes block streams that don't have perfect CORS headers
    // audio.crossOrigin = "anonymous"; 
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleError = (e: any) => {
      console.error("Audio engine error:", e);
      const errorCode = audio.error?.code;
      const errorMessage = audio.error?.message;
      console.error(`Error Code: ${errorCode}, Message: ${errorMessage}`);
      
      setIsPlaying(false);
      if (currentSong) {
        toast.error("Failed to play this track. It might be unavailable.");
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
  }, [currentSong]);

  // Supabase Real-time Sync
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
        
        if (song && (!currentSong || currentSong.id !== song.id)) {
          playSong(song, true);
        }

        if (playing !== undefined && playing !== isPlaying) {
          if (playing) resumeSong(true);
          else pauseSong(true);
        }

        if (time !== undefined && Math.abs(time - audioRef.current!.currentTime) > 2) {
          seek(time, true);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [roomCode, isHost, currentSong, isPlaying]);

  // Broadcast state if Host
  useEffect(() => {
    if (!isHost || !roomCode || !channelRef.current) return;

    const interval = setInterval(() => {
      channelRef.current.send({
        type: 'broadcast',
        event: 'sync',
        payload: {
          song: currentSong,
          playing: isPlaying,
          time: audioRef.current?.currentTime || 0
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isHost, roomCode, currentSong, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playSong = async (song: Song, fromSync: boolean = false) => {
    if (!audioRef.current) return;
    
    try {
      let fullSong = song;
      // If we don't have download URLs, fetch them
      if (!song.downloadUrl || song.downloadUrl.length === 0) {
        const details = await musicApi.getSongDetails(song.id);
        if (details) {
          fullSong = details;
        } else {
          toast.error("Could not fetch song details.");
          return;
        }
      }
      
      const downloadUrls = fullSong.downloadUrl;
      if (!downloadUrls || downloadUrls.length === 0) {
        toast.error("No streamable links found for this track.");
        return;
      }
      
      // Get highest quality link
      const bestQualityObj = downloadUrls[downloadUrls.length - 1];
      let streamUrl = (bestQualityObj as any).link || (bestQualityObj as any).url;
      
      if (!streamUrl) {
        toast.error("Invalid stream URL.");
        return;
      }

      streamUrl = String(streamUrl).replace('http://', 'https://');
      
      // Stop current playback
      audioRef.current.pause();
      audioRef.current.src = streamUrl;
      
      // Important: wait for the play promise to handle autoplay restrictions
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      
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
      console.error('Playback Error:', error);
      setIsPlaying(false);
      // Don't toast here as the error listener already handles it
    }
  };

  const pauseSong = (fromSync: boolean = false) => {
    audioRef.current?.pause();
    setIsPlaying(false);
    if (isHost && roomCode && !fromSync && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'sync',
        payload: { playing: false, time: audioRef.current?.currentTime }
      });
    }
  };

  const resumeSong = (fromSync: boolean = false) => {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play().catch(err => {
        console.error("Resume failed:", err);
      });
      setIsPlaying(true);
      if (isHost && roomCode && !fromSync && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'sync',
          payload: { playing: true, time: audioRef.current?.currentTime }
        });
      }
    }
  };

  const togglePlay = () => {
    if (isPlaying) pauseSong();
    else resumeSong();
  };

  const seek = (time: number, fromSync: boolean = false) => {
    if (audioRef.current && isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (isHost && roomCode && !fromSync && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'sync',
          payload: { time }
        });
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
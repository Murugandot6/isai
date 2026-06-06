"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Song, musicApi } from '@/services/musicApi';
import { toast } from 'sonner';

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song) => Promise<void>;
  pauseSong: () => void;
  resumeSong: () => void;
  togglePlay: () => void;
  currentTime: number;
  duration: number;
  volume: number;
  setVolume: (v: number) => void;
  seek: (time: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audio.crossOrigin = "anonymous"; // Important for cross-origin streams
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: any) => {
      console.error("Audio error:", e);
      toast.error("Failed to load audio stream. Please try again.");
      setIsPlaying(false);
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
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playSong = async (song: Song) => {
    if (!audioRef.current) return;
    
    try {
      // Step 1: Ensure we have full details including downloadUrl
      let fullSong = song;
      if (!song.downloadUrl || song.downloadUrl.length === 0) {
        fullSong = await musicApi.getSongDetails(song.id);
      }
      
      // Step 2: Extract highest quality download link
      const downloadUrls = fullSong.downloadUrl;
      if (!downloadUrls || downloadUrls.length === 0) {
        throw new Error("No stream URL available");
      }
      
      // Get the highest quality (last item) and force HTTPS
      let streamUrl = downloadUrls[downloadUrls.length - 1].link;
      streamUrl = streamUrl.replace('http://', 'https://');
      
      audioRef.current.src = streamUrl;
      audioRef.current.load(); // Force load the new source
      
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise;
      }
      
      setCurrentSong(fullSong);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing song:', error);
      toast.error("Could not play this track. It might be restricted in your region.");
      setIsPlaying(false);
    }
  };

  const pauseSong = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const resumeSong = () => {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play().catch(err => {
        console.error("Resume error:", err);
        toast.error("Could not resume playback");
      });
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (isPlaying) pauseSong();
    else resumeSong();
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <MusicContext.Provider value={{
      currentSong, isPlaying, playSong, pauseSong, resumeSong,
      togglePlay, currentTime, duration, volume, setVolume, seek
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
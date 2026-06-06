"use client";

import React from 'react';
import { useMusic } from '@/context/MusicContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const MusicPlayer = () => {
  const { currentSong, isPlaying, togglePlay, currentTime, duration, seek, volume, setVolume } = useMusic();

  if (!currentSong) return null;

  const imageUrl = currentSong.image[0].link;

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border p-4 px-6 z-50 flex flex-col md:flex-row items-center gap-4"
    >
      {/* Current Song Info */}
      <div className="flex items-center gap-4 w-full md:w-1/3">
        <img src={imageUrl} alt={currentSong.name} className="w-14 h-14 rounded-lg shadow-lg" />
        <div className="overflow-hidden">
          <h4 className="font-bold text-sm truncate" dangerouslySetInnerHTML={{ __html: currentSong.name }}></h4>
          <p className="text-xs text-muted-foreground truncate" dangerouslySetInnerHTML={{ __html: currentSong.primaryArtists }}></p>
        </div>
      </div>

      {/* Controls & Progress */}
      <div className="flex flex-col items-center gap-2 w-full md:w-1/3">
        <div className="flex items-center gap-6">
          <button className="text-muted-foreground hover:text-foreground transition-colors"><Shuffle size={18} /></button>
          <button className="text-foreground hover:text-primary transition-colors"><SkipBack size={24} fill="currentColor" /></button>
          <button 
            onClick={togglePlay}
            className="bg-primary text-primary-foreground p-3 rounded-full hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
          <button className="text-foreground hover:text-primary transition-colors"><SkipForward size={24} fill="currentColor" /></button>
          <button className="text-muted-foreground hover:text-foreground transition-colors"><Repeat size={18} /></button>
        </div>
        
        <div className="flex items-center gap-3 w-full max-w-md">
          <span className="text-[10px] font-medium text-muted-foreground w-8 text-right">{formatTime(currentTime)}</span>
          <Slider 
            value={[currentTime]} 
            max={duration || 100} 
            step={1}
            onValueChange={([val]) => seek(val)}
            className="flex-1 cursor-pointer"
          />
          <span className="text-[10px] font-medium text-muted-foreground w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume & Extras */}
      <div className="hidden md:flex items-center justify-end gap-3 w-1/3">
        <Volume2 size={20} className="text-muted-foreground" />
        <Slider 
          value={[volume * 100]} 
          max={100} 
          step={1}
          onValueChange={([val]) => setVolume(val / 100)}
          className="w-24 cursor-pointer"
        />
      </div>
    </motion.div>
  );
};
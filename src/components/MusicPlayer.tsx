"use client";

import React from 'react';
import { useMusic } from '@/context/MusicContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Repeat1 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { getHighResImage } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const MusicPlayer = () => {
  const { 
    currentSong, isPlaying, togglePlay, currentTime, duration, seek, 
    volume, setVolume, playNext, playPrevious, isShuffle, toggleShuffle, 
    repeatMode, toggleRepeat 
  } = useMusic();

  if (!currentSong) return null;

  const imageUrl = getHighResImage(currentSong.image);

  return (
    <div 
      className="fixed bottom-[60px] lg:bottom-0 left-0 right-0 bg-background/90 backdrop-blur-2xl border-t border-border p-3 px-4 lg:p-4 lg:px-6 z-40 flex flex-col md:flex-row items-center gap-2 md:gap-4 animate-in slide-in-from-bottom duration-500"
    >
      {/* Progress Bar - Top of player on mobile */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent/10 md:hidden">
        <div 
          className="h-full bg-primary transition-all duration-300" 
          style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
        />
      </div>

      {/* Current Song Info */}
      <div className="flex items-center gap-3 w-full md:w-1/3">
        <img src={imageUrl} alt={currentSong.name} className="w-10 h-10 md:w-14 md:h-14 rounded-lg shadow-lg object-cover bg-accent/10" />
        <div className="overflow-hidden min-w-0 flex-1">
          <h4 className="font-bold text-xs md:text-sm truncate" dangerouslySetInnerHTML={{ __html: currentSong.name }}></h4>
          <p className="text-[10px] md:text-xs text-muted-foreground truncate" dangerouslySetInnerHTML={{ __html: currentSong.primaryArtists }}></p>
        </div>
        <div className="flex items-center gap-4 md:hidden">
           <button onClick={togglePlay} className="text-foreground">
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
        </div>
      </div>

      {/* Controls & Progress (Desktop) */}
      <div className="hidden md:flex flex-col items-center gap-2 w-full md:w-1/3">
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleShuffle}
            className={cn("transition-colors", isShuffle ? "text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            <Shuffle size={18} />
          </button>
          <button 
            onClick={() => playPrevious()}
            className="text-foreground hover:text-primary transition-colors"
          >
            <SkipBack size={24} fill="currentColor" />
          </button>
          <button 
            onClick={togglePlay}
            className="bg-primary text-primary-foreground p-3 rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/20"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
          <button 
            onClick={() => playNext()}
            className="text-foreground hover:text-primary transition-colors"
          >
            <SkipForward size={24} fill="currentColor" />
          </button>
          <button 
            onClick={toggleRepeat}
            className={cn("transition-colors", repeatMode !== 'none' ? "text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>
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

      {/* Volume (Desktop) */}
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
    </div>
  );
};
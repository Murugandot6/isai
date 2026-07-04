"use client";

import React, { useState, useEffect } from 'react';
import { useMusic } from '@/context/MusicContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Repeat1, ListMusic, ChevronDown, Heart, BookOpen } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { getHighResImage } from '@/lib/image-utils';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const MusicPlayer = () => {
  const { 
    currentSong, isPlaying, togglePlay, currentTime, duration, seek, 
    volume, setVolume, isMuted, toggleMute, playNext, playPrevious, 
    isShuffle, toggleShuffle, repeatMode, toggleRepeat, queue, playSong,
    toggleLike, isLiked
  } = useMusic();

  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [memoryText, setMemoryText] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) {
      setIsMobileExpanded(false);
    }
  }, [isMobile]);

  if (!currentSong) return null;

  const imageUrl = getHighResImage(currentSong.image);
  const liked = isLiked(currentSong.id);

  const handleMiniPlayerClick = () => {
    if (isMobile) {
      setIsMobileExpanded(true);
    }
  };

  const handleSaveMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryText.trim()) return;
    // addMemory(currentSong, memoryText);
    setMemoryText('');
    setIsJournalOpen(false);
  };

  return (
    <>
      {/* Mini Player */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 border-t border-border p-3 lg:p-4 z-40 flex items-center justify-between gap-4">
        {/* Current Song Info */}
        <div className="flex items-center gap-3 flex-1">
          <div 
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
            onClick={handleMiniPlayerClick}
          >
            <img src={imageUrl} alt={currentSong.name} className="w-10 h-10 rounded-lg shadow-lg object-cover bg-accent/10 shrink-0" />
            <div className="overflow-hidden min-w-0 flex-1">
              <h4 className="font-bold text-xs lg:text-sm truncate" dangerouslySetInnerHTML={{ __html: currentSong.name }}></h4>
              <p className="text-[10px] lg:text-xs text-muted-foreground truncate" dangerouslySetInnerHTML={{ __html: currentSong.primaryArtists }}></p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => toggleShuffle()}
            className={cn("transition-colors", isShuffle ? "text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            <Shuffle size={18} />
          </button>
          <button 
            onClick={() => playPrevious()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <SkipBack size={24} fill="currentColor" />
          </button>
          <button 
            onClick={togglePlay}
            className="bg-primary text-primary-foreground p-3 rounded-full hover:scale-105 transition-transform shadow-lg"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
          </button>
          <button 
            onClick={() => playNext()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <SkipForward size={24} fill="currentColor" />
          </button>
          <button 
            onClick={() => toggleRepeat()}
            className={cn("transition-colors", repeatMode !== 'none' ? "text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="text-muted-foreground">
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <Slider 
            value={[isMuted ? 0 : volume * 100]} 
            max={100} 
            step={1}
            onValueChange={([val]) => setVolume(val / 100)}
            className="w-24 cursor-pointer"
          />
        </div>
      </div>

      {/* Full-Screen Mobile Player Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/98 backdrop-blur-3xl z-50 flex flex-col p-6 pb-safe transition-all duration-500 ease-out md:hidden",
          isMobileExpanded ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setIsMobileExpanded(false)}
            className="p-2 rounded-full bg-accent/10 text-foreground hover:bg-accent/20 transition-colors"
          >
            <ChevronDown size={24} />
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Now Playing</span>
        </div>

        {/* Album Art */}
        <div className="flex-1 flex items-center justify-center my-4 min-h-0">
          <div className="relative aspect-square w-full max-w-[280px] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={imageUrl} 
              alt={currentSong.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Song Details */}
        <div className="space-y-2 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-black tracking-tight text-foreground truncate" dangerouslySetInnerHTML={{ __html: currentSong.name }}></h2>
              <p className="text-xs text-muted-foreground truncate mt-1" dangerouslySetInnerHTML={{ __html: currentSong.primaryArtists }}></p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsJournalOpen(true)}
                className="p-2.5 rounded-full bg-accent/5 border border-border/50 text-muted-foreground hover:text-primary transition-all"
              >
                <BookOpen size={20} />
              </button>
              <button 
                onClick={() => toggleLike(currentSong)}
                className={cn(
                  "p-2.5 rounded-full bg-accent/5 border border-border/50 transition-all",
                  liked ? "text-primary bg-primary/10 border-primary/20" : "text-muted-foreground"
                )}
              >
                <Heart size={20} fill={liked ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Slider */}
        <div className="space-y-2 mb-6">
          <Slider 
            value={[currentTime]} 
            max={duration || 100} 
            step={1}
            onValueChange={([val]) => seek(val)}
            className="w-full cursor-pointer py-2"
          />
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between gap-2 mb-6 px-2">
          <button 
            onClick={() => toggleShuffle()}
            className={cn("p-2.5 rounded-full transition-colors", isShuffle ? "text-primary bg-primary/10" : "text-muted-foreground")}
          >
            <Shuffle size={20} />
          </button>
          
          <button 
            onClick={() => playPrevious()}
            className="p-2.5 rounded-full text-foreground hover:bg-accent/10 transition-colors"
          >
            <SkipBack size={24} fill="currentColor" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="bg-primary text-primary-foreground p-5 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          
          <button 
            onClick={() => playNext()}
            className="p-2.5 rounded-full text-foreground hover:bg-accent/10 transition-colors"
          >
            <SkipForward size={24} fill="currentColor" />
          </button>
          
          <button 
            onClick={() => toggleRepeat()}
            className={cn("p-2.5 rounded-full transition-colors", repeatMode !== 'none' ? "text-primary bg-primary/10" : "text-muted-foreground")}
          >
            {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-4 px-2 mb-4">
          <button onClick={toggleMute} className="text-muted-foreground">
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <Slider 
            value={[isMuted ? 0 : volume * 100]} 
            max={100} 
            step={1}
            onValueChange={([val]) => setVolume(val / 100)}
            className="flex-1 cursor-pointer"
          />
        </div>
      </div>

      {/* Write Memory Dialog */}
      <Dialog open={isJournalOpen} onOpenChange={setIsJournalOpen}>
        <DialogContent className="bg-card border-border max-w-[90vw] sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <BookOpen className="text-primary" />
              Music Journal
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-accent/5 border border-border/50 my-2">
            <img src={imageUrl} alt={currentSong.name} className="w-12 h-12 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm truncate" dangerouslySetInnerHTML={{ __html: currentSong.name }}></h4>
              <p className="text-xs text-muted-foreground truncate" dangerouslySetInnerHTML={{ __html: currentSong.primaryArtists }}></p>
            </div>
          </div>
          <form onSubmit={handleSaveMemory} className="space-y-4">
            <Textarea 
              placeholder="What memory or feeling does this song bring back?" 
              value={memoryText}
              onChange={(e) => setMemoryText(e.target.value)}
              className="bg-accent/5 h-32 rounded-2xl border-none font-medium text-sm focus-visible:ring-primary/20 resize-none"
              required
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setIsJournalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
              <Button type="submit" className="rounded-xl font-bold px-6">Save Memory</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
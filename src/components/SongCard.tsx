"use client";

import React from 'react';
import { Song } from '@/services/musicApi';
import { Play, Pause, Globe } from 'lucide-react';
import { useMusic } from '@/context/MusicContext';
import { getHighResImage } from '@/lib/image-utils';
import { Badge } from '@/components/ui/badge';

export const SongCard: React.FC<{ song: Song }> = ({ song }) => {
  const { currentSong, isPlaying, playSong, togglePlay } = useMusic();
  const isCurrent = currentSong?.id === song.id;
  
  const imageUrl = getHighResImage(song.image);

  const handleClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  return (
    <div 
      className="group relative bg-card/50 hover:bg-accent/10 p-3 rounded-2xl transition-all duration-300 cursor-pointer border border-transparent hover:border-accent/20 hover:-translate-y-1"
      onClick={handleClick}
    >
      <div className="relative aspect-square mb-3 overflow-hidden rounded-xl bg-accent/10 shadow-lg">
        <img 
          src={imageUrl} 
          alt={song.name} 
          className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Language Badge */}
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-[9px] font-bold uppercase border-none text-white flex items-center gap-1 py-0.5">
            <Globe size={10} />
            {song.language}
          </Badge>
        </div>

        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isCurrent && isPlaying ? 'opacity-100' : ''}`}>
          <div className="bg-primary text-primary-foreground p-3 rounded-full shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
            {isCurrent && isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </div>
        </div>
      </div>
      <h3 className="font-semibold text-sm truncate mb-0.5" dangerouslySetInnerHTML={{ __html: song.name }}></h3>
      <p className="text-xs text-muted-foreground truncate" dangerouslySetInnerHTML={{ __html: song.primaryArtists }}></p>
    </div>
  );
};
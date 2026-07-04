"use client";

import DOMPurify from 'dompurify';
import { useMusic } from '@/context/MusicContext';
import { getHighResImage } from '@/lib/image-utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Heart, Play } from 'lucide-react';

interface SongCardProps {
  song: {
    id: string;
    name: string;
    primaryArtists: string;
    image: any;
    duration?: number;
  };
  allSongs?: any[];
  fallbackImage?: string;
}

export const SongCard = ({ song, allSongs, fallbackImage }: SongCardProps) => {
  const { playSong, toggleLike, isLiked } = useMusic();
  const imageUrl = getHighResImage(song.image, fallbackImage);
  const isCurrent = allSongs?.some(s => s.id === song.id);
  
  return (
    <div className="group bg-card/50 border border-border/50 rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden">
        <img src={imageUrl} alt={song.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
            <Play size={14} fill="currentColor" className="ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-bold text-sm truncate" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(song.name) }} />
        <p className="text-xs text-muted-foreground truncate mt-1">
          {DOMPurify.sanitize(song.primaryArtists || 'Unknown Artist')}
        </p>
      </div>
    </div>
  );
};
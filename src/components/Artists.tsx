"use client";

import { getHighResImage } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface ArtistProps {
  artist: {
    id: string;
    name: string;
    role: string;
    image: any;
    followerCount?: number;
  };
}

export const Artists = ({ artist }: ArtistProps) => {
  const imageUrl = getHighResImage(artist.image);
  
  return (
    <div className="group bg-card/50 border border-border/50 rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden">
        <img src={imageUrl} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-3">
        <h4 className="font-bold text-sm truncate">{artist.name}</h4>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
          {artist.role}
        </p>
      </div>
    </div>
  );
};
"use client";

import DOMPurify from 'dompurify';
import { getHighResImage } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface AlbumCardProps {
  album: {
    id: string;
    name: string;
    year: string | number;
    image: any;
    songCount?: string;
  };
}

export const AlbumCard = ({ album }: AlbumCardProps) => {
  const imageUrl = getHighResImage(album.image);
  return (
    <div className="group relative bg-card/50 border border-border/50 rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-xl">
      <img src={imageUrl} alt={album.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
          <h3 className="text-white font-bold text-lg truncate" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(album.name) }} />
          <p className="text-xs text-zinc-400 font-bold mt-1">
            {DOMPurify.sanitize(album.year?.toString() || 'N/A')}
          </p>
        </div>
      </div>
    </div>
  );
};
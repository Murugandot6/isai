"use client";

import React from 'react';
import { Album } from '@/services/musicApi';
import { Play, Disc, Calendar } from 'lucide-react';
import { getHighResImage } from '@/lib/image-utils';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export const AlbumCard: React.FC<{ album: Album }> = ({ album }) => {
  const navigate = useNavigate();
  
  if (!album) return null;

  const imageUrl = getHighResImage(album.image);
  
  // Resilient song count detection for various API versions/endpoints
  const getSongCount = () => {
    const a = album as any;
    // Check direct fields
    if (a.songCount && parseInt(a.songCount) > 0) return a.songCount;
    if (a.song_count && parseInt(a.song_count) > 0) return a.song_count;
    
    // Check nested more_info (common in search results)
    if (a.more_info?.song_count && parseInt(a.more_info.song_count) > 0) return a.more_info.song_count;
    if (a.more_info?.total_songs && parseInt(a.more_info.total_songs) > 0) return a.more_info.total_songs;
    
    // Fallback to songs array length
    if (album.songs && album.songs.length > 0) return album.songs.length.toString();
    
    return "0";
  };

  const songCount = getSongCount();

  return (
    <div 
      className="group relative bg-card/50 hover:bg-accent/10 p-3 rounded-2xl transition-all duration-300 cursor-pointer border border-transparent hover:border-accent/20 hover:-translate-y-1"
      onClick={() => navigate(`/album/${album.id}`)}
    >
      <div className="relative aspect-square mb-3 overflow-hidden rounded-xl bg-accent/10 shadow-lg">
        <img 
          src={imageUrl} 
          alt={album.name || 'Album'} 
          className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-[9px] font-bold uppercase border-none text-white flex items-center gap-1 py-0.5">
            <Disc size={10} />
            {songCount} Songs
          </Badge>
        </div>

        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-primary text-primary-foreground p-3 rounded-full shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play size={24} fill="currentColor" />
          </div>
        </div>
      </div>
      <h3 className="font-semibold text-sm truncate mb-0.5" dangerouslySetInnerHTML={{ __html: album.name || 'Unknown Album' }}></h3>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar size={12} />
        <span className="text-[10px] font-bold">{album.year || 'N/A'}</span>
      </div>
    </div>
  );
};
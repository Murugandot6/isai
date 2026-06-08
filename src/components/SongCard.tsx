"use client";

import React, { useState, useEffect } from 'react';
import { Song, musicApi } from '@/services/musicApi';
import { Play, Pause, Globe, Heart, MoreHorizontal, Plus, Share2, ListMusic, ListPlus } from 'lucide-react';
import { useMusic } from '@/context/MusicContext';
import { getHighResImage } from '@/lib/image-utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

export const SongCard: React.FC<{ song: Song, allSongs?: Song[], fallbackImage?: string }> = ({ song, allSongs, fallbackImage }) => {
  const { currentSong, isPlaying, playSong, togglePlay, toggleLike, isLiked, playlists, addToPlaylist, addToNext } = useMusic();
  const [detailedSong, setDetailedSong] = useState<Song | null>(null);
  
  if (!song) return null;

  // Fetch individual song details in the background to get the correct song-specific single/promo artwork
  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      try {
        const data = await musicApi.getSongDetails(song.id);
        if (data && isMounted) {
          setDetailedSong(data);
        }
      } catch (err) {
        console.error("Failed to fetch song details for card", err);
      }
    };
    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [song.id]);

  const displaySong = detailedSong || song;
  const isCurrent = currentSong?.id === displaySong.id;
  const liked = isLiked(displaySong.id);
  
  // Use the detailed song's image if available, otherwise fallback
  const imageUrl = getHighResImage(displaySong.image, fallbackImage);

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.action-button')) return;
    
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(displaySong, allSongs);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + `/#/search?q=${encodeURIComponent(displaySong.name || '')}`);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div 
      className="group relative bg-card/50 hover:bg-accent/10 p-3 rounded-2xl transition-all duration-300 cursor-pointer border border-transparent hover:border-accent/20 hover:-translate-y-1"
      onClick={handleClick}
    >
      <div className="relative aspect-square mb-3 overflow-hidden rounded-xl bg-accent/10 shadow-lg">
        <img 
          src={imageUrl} 
          alt={displaySong.name || 'Song'} 
          className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-[9px] font-bold uppercase border-none text-white flex items-center gap-1 py-0.5">
            <Globe size={10} />
            {displaySong.language || 'unknown'}
          </Badge>
        </div>

        <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(displaySong);
            }}
            className={cn(
              "action-button p-2 rounded-full transition-all duration-300 backdrop-blur-md",
              liked ? "bg-primary text-white opacity-100" : "bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60"
            )}
          >
            <Heart size={14} fill={liked ? "currentColor" : "none"} />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                onClick={(e) => e.stopPropagation()}
                className="action-button p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 backdrop-blur-md transition-all"
              >
                <MoreHorizontal size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 rounded-xl bg-card border-border shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  addToNext(displaySong);
                }} 
                className="gap-2 rounded-lg m-1 cursor-pointer"
              >
                <ListPlus size={16} />
                <span>Play Next</span>
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 rounded-lg m-1 cursor-pointer">
                  <Plus size={16} />
                  <span>Add to Playlist</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="rounded-xl bg-card border-border shadow-2xl min-w-[180px]">
                  {playlists && playlists.length > 0 ? (
                    playlists.map(p => (
                      <DropdownMenuItem 
                        key={p.id} 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToPlaylist(p.id, displaySong);
                        }}
                        className="gap-2 rounded-lg m-1 cursor-pointer"
                      >
                        <ListMusic size={14} />
                        <span className="truncate">{p.name}</span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled className="text-xs italic p-4">No playlists found</DropdownMenuItem>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuItem onClick={handleShare} className="gap-2 rounded-lg m-1 cursor-pointer">
                <Share2 size={16} />
                <span>Share Song</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isCurrent && isPlaying ? 'opacity-100' : ''}`}>
          <div className="bg-primary text-primary-foreground p-3 rounded-full shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
            {isCurrent && isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </div>
        </div>
      </div>
      <h3 className="font-semibold text-sm truncate mb-0.5" dangerouslySetInnerHTML={{ __html: displaySong.name || 'Unknown Track' }}></h3>
      <p className="text-xs text-muted-foreground truncate" dangerouslySetInnerHTML={{ __html: displaySong.primaryArtists || 'Unknown Artist' }}></p>
    </div>
  );
};
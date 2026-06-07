"use client";

import React, { useEffect, useState } from 'react';
import { Sparkles, Music, ChevronDown, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { musicApi, Playlist } from '@/services/musicApi';
import { getHighResImage } from '@/lib/image-utils';

const TOP_PLAYLISTS = [
  'R2ISZzIDGJc_', // Semma Mass Tamil
  '1133105280',   // Tamil Hit Songs
  '1134651042',   // Tamil Superhits Top 50
  '1074590003',   // Tamil BGM
];

export const HeaderPlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);
      try {
        const data = await Promise.all(
          TOP_PLAYLISTS.map(id => musicApi.getPlaylistDetails(id))
        );
        setPlaylists(data.filter(p => p !== null) as Playlist[]);
      } catch (error) {
        console.error('Failed to load header playlists', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-full bg-accent/5 border-border hover:bg-accent/10 transition-all font-bold gap-2 text-xs h-9 md:h-10 px-4">
          <Sparkles size={14} className="text-primary animate-pulse" />
          <span className="hidden sm:inline">Featured Playlists</span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-2xl bg-card border-border shadow-2xl p-2">
        <DropdownMenuLabel className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground p-2">
          Top Collections
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="animate-spin text-primary" size={20} />
          </div>
        ) : playlists.length > 0 ? (
          playlists.map((playlist) => (
            <DropdownMenuItem
              key={playlist.id}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              className="rounded-xl p-2 cursor-pointer focus:bg-primary/10 transition-all flex items-center gap-3"
            >
              <img 
                src={getHighResImage(playlist.image)} 
                alt={playlist.name} 
                className="w-10 h-10 rounded-lg object-cover bg-accent/10 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs truncate text-foreground" dangerouslySetInnerHTML={{ __html: playlist.name }}></p>
                <p className="text-[10px] text-muted-foreground">{playlist.songCount} Tracks</p>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No playlists loaded
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
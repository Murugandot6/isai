export interface Song {
  id: string;
  name: string;
  primaryArtists: string;
  image: any;
  downloadUrl?: any[];
  language: string;
  album?: { id: string; name: string; url: string };
  year: string;
  duration: number;
  type?: string;
}

export interface Album {
  id: string;
  name: string;
  year: string;
  image: any;
  songs: Song[];
  songCount?: string;
  language?: string;
}

export interface Playlist {
  id: string;
  name: string;
  image: any;
  songs: Song[];
  songCount?: string;
  language?: string;
  year?: string;
}

export interface Movie {
  id: string;
  title: string;
  overview: string;
  backdrop: string;
  poster: string;
  rating: number;
  year: string;
  genre: string;
  language?: string;
  streamUrl?: string;
}

export const getContainerCount = (album: Album): number => {
  return album.songs?.length || 0;
};

export const radioApi = {
  getStations: async (language: string = 'english', limit: number = 50) => {
    const res = await fetch(`https://de1.api.radio-browser.info/json/stations/bylanguage/${encodeURIComponent(language)}?limit=${limit}&order=votes&reverse=true`);
    const data = await res.json();
    return data;
  },
  searchStations: async (query: string) => {
    const res = await fetch(`https://de1.api.radio-browser.info/json/stations/byname/${encodeURIComponent(query)}?limit=30`);
    const data = await res.json();
    return data;
  }
};

export const musicApi = {
  getTrending: async (language: string = 'english', limit: number = 50): Promise<Song[]> => {
    const res = await fetch(`https://de1.api.radio-browser.info/json/stations/bylanguage/${encodeURIComponent(language)}?limit=${limit}`);
    const data = await res.json();
    return data as Song[];
  },
  searchSongs: async (query: string, page: number = 1, limit: number = 50): Promise<Song[]> => {
    const res = await fetch(`https://de1.api.radio-browser.info/json/stations/byname/${encodeURIComponent(query)}?limit=${limit}`);
    const data = await res.json();
    return data as Song[];
  },
  searchPlaylists: async (query: string, page: number = 1, limit: number = 50): Promise<Playlist[]> => {
    return [];
  },
  getAlbumDetails: async (id: string): Promise<Album> => {
    return { id, name: 'Album', year: '2024', image: null, songs: [] };
  },
  getPlaylistDetails: async (id: string): Promise<Playlist> => {
    return { id, name: 'Playlist', image: null, songs: [] };
  },
};</arg_value>

<dyad-write path="src/components/AlbumCard.tsx">
"use client";

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
          <h3 className="text-white font-bold text-lg truncate">{album.name}</h3>
          <p className="text-xs text-zinc-400 font-bold mt-1">
            {album.year?.toString() || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};
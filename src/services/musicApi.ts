"use client";

// Define the basic structures for our music app
export interface Song {
  id: string | number;
  name: string;
  album: string;
  year?: string;
  releaseDate?: string;
  duration?: string;
  label?: string;
  primaryArtists?: string;
  featuredArtists?: string;
  singers?: string;
  image: string | any[];
  downloadUrl?: any[];
  url?: string;
  [key: string]: any;
}

export interface Album {
  id: string | number;
  name: string;
  year?: string;
  type?: string;
  language?: string;
  image: string | any[];
  songs?: Song[];
  songCount?: string | number;
  [key: string]: any;
}

// Robust helper to get the song count from any album/playlist object
export const getContainerCount = (item: any): number => {
  if (!item) return 0;
  
  // 1. Check if songs array exists and has length
  if (Array.isArray(item.songs) && item.songs.length > 0) {
    return item.songs.length;
  }
  
  // 2. Check songCount property (common in search results)
  if (item.songCount !== undefined && item.songCount !== null) {
    return parseInt(String(item.songCount)) || 0;
  }
  
  // 3. Check for more_info nested property (raw Saavn API)
  if (item.more_info?.song_count) {
    return parseInt(String(item.more_info.song_count)) || 0;
  }

  // 4. Check for nested list length
  if (Array.isArray(item.list)) {
    return item.list.length;
  }
  
  return 0;
};

// API Mock/Service layer
const BASE_URL = 'https://saavn.dev/api';

export const musicApi = {
  getAlbumDetails: async (id: string): Promise<Album> => {
    const response = await fetch(`${BASE_URL}/albums?id=${id}`);
    const res = await response.json();
    // Some API wrappers return data in a 'data' property
    const albumData = res.data || res;
    
    // Ensure songs array is present if the API uses 'list' or other names
    if (!albumData.songs && Array.isArray(albumData.list)) {
      albumData.songs = albumData.list;
    }
    
    return albumData;
  },

  getSongsDetailsBulk: async (ids: string[]): Promise<Song[]> => {
    if (!ids.length) return [];
    const response = await fetch(`${BASE_URL}/songs?ids=${ids.join(',')}`);
    const res = await response.json();
    return res.data || res || [];
  },

  // Add other methods as needed...
};
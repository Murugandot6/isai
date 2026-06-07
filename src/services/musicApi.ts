"use client";

// Define the basic structures for our music app
export interface Song {
  id: string | number;
  name: string;
  album: any;
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
  language: string;
  type?: string;
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

export interface Playlist {
  id: string | number;
  name: string;
  image: string | any[];
  songs?: Song[];
  language?: string;
  year?: string;
  [key: string]: any;
}

// Helper to ensure song objects have a consistent structure across different API responses
export const normalizeSong = (song: any): Song => {
  if (!song) return song;

  return {
    ...song,
    id: song.id?.toString() || '',
    name: song.name || song.title || 'Unknown Track',
    album: typeof song.album === 'string' ? { name: song.album, id: '' } : (song.album || { name: 'Unknown Album', id: '' }),
    primaryArtists: song.primaryArtists || song.singers || song.artist || 'Unknown Artist',
    image: song.image || [],
    downloadUrl: song.downloadUrl || [],
    language: song.language || 'tamil',
    year: song.year || '',
    duration: song.duration || '0'
  };
};

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

const BASE_URL = 'https://saavn.dev/api';

export const musicApi = {
  getTrending: async (languages: string = 'tamil'): Promise<Song[]> => {
    try {
      const response = await fetch(`${BASE_URL}/search/songs?query=trending&language=${languages}&limit=20`);
      const res = await response.json();
      return (res.data?.results || []).map(normalizeSong);
    } catch (e) {
      console.error("Trending fetch error", e);
      return [];
    }
  },

  searchSongs: async (query: string, page: number = 1, limit: number = 20): Promise<Song[]> => {
    const response = await fetch(`${BASE_URL}/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    const res = await response.json();
    return (res.data?.results || []).map(normalizeSong);
  },

  searchAlbums: async (query: string, page: number = 1, limit: number = 20): Promise<Album[]> => {
    const response = await fetch(`${BASE_URL}/search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    const res = await response.json();
    return res.data?.results || [];
  },

  searchArtists: async (query: string): Promise<any[]> => {
    const response = await fetch(`${BASE_URL}/search/artists?query=${encodeURIComponent(query)}`);
    const res = await response.json();
    return res.data?.results || [];
  },

  getAlbumDetails: async (id: string): Promise<Album> => {
    const response = await fetch(`${BASE_URL}/albums?id=${id}`);
    const res = await response.json();
    const albumData = res.data || res;
    
    if (!albumData.songs && Array.isArray(albumData.list)) {
      albumData.songs = albumData.list;
    }
    
    if (albumData.songs) {
      albumData.songs = albumData.songs.map(normalizeSong);
    }
    
    return albumData;
  },

  getPlaylistDetails: async (id: string): Promise<Playlist | null> => {
    try {
      const response = await fetch(`${BASE_URL}/playlists?id=${id}`);
      const res = await response.json();
      return res.data || null;
    } catch (e) {
      return null;
    }
  },

  getArtistDetails: async (id: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/artists?id=${id}`);
      const res = await response.json();
      return res.data || null;
    } catch (e) {
      return null;
    }
  },

  getArtistSongs: async (id: string, page: number = 0): Promise<Song[]> => {
    try {
      const response = await fetch(`${BASE_URL}/artists/${id}/songs?page=${page}`);
      const res = await response.json();
      return (res.data?.songs || []).map(normalizeSong);
    } catch (e) {
      return [];
    }
  },

  getSongDetails: async (id: string | number): Promise<Song | null> => {
    try {
      const response = await fetch(`${BASE_URL}/songs?ids=${id}`);
      const res = await response.json();
      const songData = (res.data && res.data[0]) || (Array.isArray(res) && res[0]);
      return songData ? normalizeSong(songData) : null;
    } catch (e) {
      return null;
    }
  },

  getSongsDetailsBulk: async (ids: string[]): Promise<Song[]> => {
    if (!ids.length) return [];
    try {
      const response = await fetch(`${BASE_URL}/songs?ids=${ids.join(',')}`);
      const res = await response.json();
      const songs = res.data || res || [];
      return Array.isArray(songs) ? songs.map(normalizeSong) : [];
    } catch (e) {
      return [];
    }
  }
};
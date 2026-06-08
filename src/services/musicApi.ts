"use client";

// Define the structure based on the provided API documentation
export interface Song {
  id: string;
  name: string;
  type: string;
  album: {
    id: string;
    name: string;
    url: string;
  };
  year: string;
  releaseDate: string;
  duration: string;
  label: string;
  primaryArtists: string;
  featuredArtists: string;
  singers: string;
  image: { quality: string; url: string }[];
  downloadUrl: { quality: string; url: string }[];
  language: string;
  url: string;
}

export interface Album {
  id: string;
  name: string;
  year: string;
  type: string;
  language: string;
  image: { quality: string; url: string }[];
  songs: Song[];
  songCount?: string | number;
}

export interface Playlist {
  id: string;
  name: string;
  image: { quality: string; url: string }[];
  songs: Song[];
  language: string;
  year: string;
  songCount?: string | number;
}

const BASE_URL = 'https://jiosaavn-api.imurugan.workers.dev';

// Robust helper to get the song count from any album/playlist object
export const getContainerCount = (item: any): number => {
  if (!item) return 0;
  
  if (Array.isArray(item.songs) && item.songs.length > 0) {
    return item.songs.length;
  }
  
  if (item.songCount !== undefined) {
    return parseInt(String(item.songCount)) || 0;
  }
  
  return 0;
};

// Helper to ensure song objects have a consistent structure
export const normalizeSong = (song: any): Song => {
  if (!song) return song;

  return {
    ...song,
    id: song.id?.toString() || '',
    name: song.name || song.title || 'Unknown Track',
    album: song.album || { name: 'Unknown Album', id: '' },
    primaryArtists: song.primaryArtists || song.singers || 'Unknown Artist',
    image: Array.isArray(song.image) ? song.image : [],
    downloadUrl: Array.isArray(song.downloadUrl) ? song.downloadUrl : [],
    language: song.language || 'unknown',
    year: song.year || '',
    duration: song.duration || '0'
  };
};

export const musicApi = {
  getTrending: async (languages: string = 'tamil'): Promise<Song[]> => {
    try {
      // Using global search for trending as specified in patterns
      const response = await fetch(`${BASE_URL}/api/search/songs?query=trending&limit=20`);
      const res = await response.json();
      const results = res.data?.results || [];
      return results.filter((s: any) => 
        !languages || languages.split(',').includes(s.language?.toLowerCase())
      ).map(normalizeSong);
    } catch (e) {
      console.error("Trending fetch error", e);
      return [];
    }
  },

  searchSongs: async (query: string, page: number = 0, limit: number = 20): Promise<Song[]> => {
    const response = await fetch(`${BASE_URL}/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    const res = await response.json();
    return (res.data?.results || []).map(normalizeSong);
  },

  searchAlbums: async (query: string): Promise<Album[]> => {
    const response = await fetch(`${BASE_URL}/api/search/albums?query=${encodeURIComponent(query)}`);
    const res = await response.json();
    return res.data?.results || [];
  },

  searchArtists: async (query: string): Promise<any[]> => {
    const response = await fetch(`${BASE_URL}/api/search/artists?query=${encodeURIComponent(query)}`);
    const res = await response.json();
    return res.data?.results || [];
  },

  getAlbumDetails: async (id: string): Promise<Album> => {
    const response = await fetch(`${BASE_URL}/api/albums/${id}`);
    const res = await response.json();
    const data = res.data || res;
    if (data.songs) data.songs = data.songs.map(normalizeSong);
    return data;
  },

  getPlaylistDetails: async (id: string): Promise<Playlist | null> => {
    try {
      // Standard pattern for playlists usually follows /api/playlists/{id}
      const response = await fetch(`${BASE_URL}/api/playlists/${id}`);
      const res = await response.json();
      const data = res.data || res;
      if (data.songs) data.songs = data.songs.map(normalizeSong);
      return data;
    } catch (e) {
      return null;
    }
  },

  getArtistDetails: async (id: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/api/artists/${id}`);
      const res = await response.json();
      return res.data || null;
    } catch (e) {
      return null;
    }
  },

  getArtistSongs: async (id: string, page: number = 0): Promise<Song[]> => {
    try {
      const response = await fetch(`${BASE_URL}/api/artists/${id}/songs?page=${page}`);
      const res = await response.json();
      return (res.data?.songs || []).map(normalizeSong);
    } catch (e) {
      return [];
    }
  },

  getSongDetails: async (id: string): Promise<Song | null> => {
    try {
      const response = await fetch(`${BASE_URL}/api/songs/${id}`);
      const res = await response.json();
      const songData = res.data?.[0] || (Array.isArray(res.data) ? res.data[0] : res.data);
      return songData ? normalizeSong(songData) : null;
    } catch (e) {
      return null;
    }
  },

  getSongsDetailsBulk: async (ids: string[]): Promise<Song[]> => {
    if (!ids.length) return [];
    try {
      const response = await fetch(`${BASE_URL}/api/songs/${ids.join(',')}`);
      const res = await response.json();
      const songs = res.data || [];
      return Array.isArray(songs) ? songs.map(normalizeSong) : [];
    } catch (e) {
      return [];
    }
  }
};
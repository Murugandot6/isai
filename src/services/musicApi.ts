"use client";

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

// Helper to get the song count from any album/playlist object consistently
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

export const musicApi = {
  // Global search for all types
  searchAll: async (query: string) => {
    const response = await fetch(`${BASE_URL}/api/search?query=${encodeURIComponent(query)}`);
    const res = await response.json();
    return res.data || null;
  },

  // Specific search endpoints
  searchSongs: async (query: string, page: number = 0, limit: number = 20): Promise<Song[]> => {
    const response = await fetch(`${BASE_URL}/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    const res = await response.json();
    return res.data?.results || [];
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

  searchPlaylists: async (query: string): Promise<Playlist[]> => {
    const response = await fetch(`${BASE_URL}/api/search/playlists?query=${encodeURIComponent(query)}`);
    const res = await response.json();
    return res.data?.results || [];
  },

  // Detail endpoints
  getSongDetails: async (id: string): Promise<Song | null> => {
    try {
      const response = await fetch(`${BASE_URL}/api/songs/${id}`);
      const res = await response.json();
      return res.data?.[0] || null;
    } catch (e) {
      return null;
    }
  },

  getAlbumDetails: async (id: string): Promise<Album | null> => {
    try {
      const response = await fetch(`${BASE_URL}/api/albums/${id}`);
      const res = await response.json();
      return res.data || null;
    } catch (e) {
      return null;
    }
  },

  getPlaylistDetails: async (id: string): Promise<Playlist | null> => {
    try {
      const response = await fetch(`${BASE_URL}/api/playlists/${id}`);
      const res = await response.json();
      return res.data || null;
    } catch (e) {
      return null;
    }
  },

  // Trending songs endpoint
  getTrending: async (languages: string = 'tamil'): Promise<Song[]> => {
    try {
      const langList = languages.split(',').filter(Boolean);
      const primaryLang = langList[0] || 'tamil';
      // Fetch trending songs by searching for popular hits in the selected language
      const response = await fetch(`${BASE_URL}/api/search/songs?query=${encodeURIComponent(primaryLang + ' hits')}&limit=30`);
      const res = await response.json();
      return res.data?.results || [];
    } catch (e) {
      console.error("Error in getTrending:", e);
      return [];
    }
  },

  // Artist details endpoint
  getArtistDetails: async (id: string): Promise<any | null> => {
    try {
      const response = await fetch(`${BASE_URL}/api/artists/${id}`);
      const res = await response.json();
      return res.data || null;
    } catch (e) {
      console.error("Error in getArtistDetails:", e);
      return null;
    }
  },

  // Artist songs endpoint
  getArtistSongs: async (id: string, page: number = 0): Promise<Song[]> => {
    try {
      const response = await fetch(`${BASE_URL}/api/artists/${id}/songs?page=${page}`);
      const res = await response.json();
      return res.data?.songs || res.data?.results || [];
    } catch (e) {
      console.error("Error in getArtistSongs:", e);
      return [];
    }
  }
};
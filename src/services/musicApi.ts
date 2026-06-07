"use client";

// Using a CORS proxy to ensure stability across different environments
const PROXY = 'https://corsproxy.io/?';
const API_BASE = 'https://jiosaavn.rajputhemant.dev/api';
const BASE_URL = `${PROXY}${encodeURIComponent(API_BASE)}`;

export interface Image {
  quality: string;
  link?: string;
  url?: string;
}

export interface DownloadUrl {
  quality: string;
  link?: string;
  url?: string;
}

export interface Song {
  id: string;
  name: string;
  type: string;
  language: string;
  album: {
    id: string;
    name: string;
    url: string;
  };
  year: string;
  duration: number;
  primaryArtists: string;
  image: Image[];
  downloadUrl: DownloadUrl[];
}

export interface Album {
  id: string;
  name: string;
  year: string;
  type: string;
  playCount: string;
  language: string;
  explicitContent: boolean;
  songCount: string;
  url: string;
  primaryArtists: string;
  image: Image[];
  songs?: Song[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  year: string;
  type: string;
  playCount: string;
  language: string;
  explicitContent: boolean;
  songCount: string;
  url: string;
  image: Image[];
  songs?: Song[];
}

/**
 * Normalizes song data from the API to maintain compatibility with the UI.
 * Handles variations in field names and structures.
 */
export const normalizeSong = (song: any): Song => {
  if (!song) return song;

  // Handle primary artists (can be string, array of objects, or nested in 'artists')
  let primaryArtists = song.primaryArtists;
  if (Array.isArray(primaryArtists)) {
    primaryArtists = primaryArtists.map((a: any) => a.name).join(', ');
  } else if (typeof primaryArtists === 'object' && primaryArtists !== null) {
    primaryArtists = primaryArtists.name || 'Unknown Artist';
  } else if (!primaryArtists && song.artists?.primary) {
    primaryArtists = Array.isArray(song.artists.primary) 
      ? song.artists.primary.map((a: any) => a.name).join(', ')
      : song.artists.primary;
  }

  // Normalize images
  let images = song.image || song.images;
  if (images && !Array.isArray(images)) {
    images = [{ quality: '500x500', link: typeof images === 'string' ? images : (images.link || images.url) }];
  } else if (Array.isArray(images)) {
    images = images.map((img: any) => ({
      quality: img.quality || '500x500',
      link: img.link || img.url || (typeof img === 'string' ? img : '')
    }));
  }

  // Normalize download URLs
  let downloadUrls = song.downloadUrl || song.download_url;
  if (downloadUrls && !Array.isArray(downloadUrls)) {
    downloadUrls = [{ quality: '320kbps', link: typeof downloadUrls === 'string' ? downloadUrls : (downloadUrls.link || downloadUrls.url) }];
  } else if (Array.isArray(downloadUrls)) {
    downloadUrls = downloadUrls.map((dl: any) => ({
      quality: dl.quality || '320kbps',
      link: dl.link || dl.url || (typeof dl === 'string' ? dl : '')
    }));
  }

  return {
    ...song,
    name: song.name || song.title || 'Unknown Track',
    primaryArtists: primaryArtists || 'Unknown Artist',
    image: images || [],
    downloadUrl: downloadUrls || [],
    language: song.language || 'unknown',
    album: song.album || { id: 'unknown', name: 'Unknown Album', url: '' }
  };
};

const fetchWithProxy = async (endpoint: string) => {
  const url = `${PROXY}${encodeURIComponent(`${API_BASE}${endpoint}`)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const json = await res.json();
  // The API wraps data in a 'data' field
  return json.data || json;
};

export const musicApi = {
  getTrending: async (languages: string = 'hindi,english') => {
    try {
      // Using search/songs with 'trending' query as recommended for curated lists
      const data = await fetchWithProxy(`/search/songs?query=trending&language=${encodeURIComponent(languages)}&limit=20`);
      const results = (data.results || data || []) as any[];
      return results.map(normalizeSong);
    } catch (error) {
      console.error("Trending fetch error:", error);
      return await musicApi.searchSongs('latest hits');
    }
  },
  searchSongs: async (query: string, page: number = 0, limit: number = 20) => {
    try {
      const data = await fetchWithProxy(`/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      const results = (data.results || data || []) as any[];
      return results.map(normalizeSong);
    } catch (error) {
      console.error("Search fetch error:", error);
      return [];
    }
  },
  searchAlbums: async (query: string, page: number = 0, limit: number = 20) => {
    try {
      const data = await fetchWithProxy(`/search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return (data.results || data || []) as Album[];
    } catch (error) {
      console.error("Album search error:", error);
      return [];
    }
  },
  searchArtists: async (query: string, page: number = 0, limit: number = 20) => {
    try {
      const data = await fetchWithProxy(`/search/artists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return (data.results || data || []) as any[];
    } catch (error) {
      console.error("Artist search error:", error);
      return [];
    }
  },
  getAlbumDetails: async (id: string) => {
    try {
      const data = await fetchWithProxy(`/albums?id=${id}`);
      if (data && data.songs) {
        data.songs = data.songs.map(normalizeSong);
      }
      return data as Album;
    } catch (error) {
      console.error("Album details fetch error:", error);
      return null;
    }
  },
  getPlaylistDetails: async (id: string) => {
    try {
      const data = await fetchWithProxy(`/playlists?id=${id}`);
      if (data && data.songs) {
        data.songs = data.songs.map(normalizeSong);
      }
      return data as Playlist;
    } catch (error) {
      console.error("Playlist details fetch error:", error);
      return null;
    }
  },
  getSongDetails: async (id: string) => {
    try {
      // Using the /songs?id= format which supports single or multiple IDs
      const data = await fetchWithProxy(`/songs?id=${id}`);
      const songData = Array.isArray(data) ? data[0] : data;
      return songData ? normalizeSong(songData) : null;
    } catch (error) {
      console.error("Details fetch error:", error);
      return null;
    }
  },
  getSongsDetailsBulk: async (ids: string[]) => {
    try {
      const data = await fetchWithProxy(`/songs?id=${ids.join(',')}`);
      const results = (Array.isArray(data) ? data : [data]) as any[];
      return results.map(normalizeSong);
    } catch (error) {
      console.error("Bulk details fetch error:", error);
      return [];
    }
  },
  getArtistDetails: async (id: string) => {
    try {
      const data = await fetchWithProxy(`/artists?id=${id}`);
      if (data && data.topSongs) {
        data.topSongs = data.topSongs.map(normalizeSong);
      }
      return data;
    } catch (error) {
      console.error("Artist details fetch error:", error);
      return null;
    }
  },
  getArtistSongs: async (id: string, page: number = 0) => {
    try {
      const data = await fetchWithProxy(`/artists/${id}/songs?page=${page}`);
      const results = (data.results || data || []) as any[];
      return results.map(normalizeSong);
    } catch (error) {
      console.error("Artist songs fetch error:", error);
      return [];
    }
  }
};
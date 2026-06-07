"use client";

// Using a CORS proxy to bypass browser restrictions
const PROXY = 'https://corsproxy.io/?';
const API_BASE = 'https://saavn.dev/api';
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
 * Normalizes song data from different API endpoints to a consistent format.
 */
export const normalizeSong = (song: any): Song => {
  if (!song) return song;

  let primaryArtists = song.primaryArtists;
  if (Array.isArray(primaryArtists)) {
    primaryArtists = primaryArtists.map((a: any) => a.name).join(', ');
  } else if (typeof primaryArtists === 'object' && primaryArtists !== null) {
    primaryArtists = primaryArtists.name || 'Unknown Artist';
  }

  let images = song.image;
  if (images && !Array.isArray(images)) {
    images = [{ quality: '500x500', link: typeof images === 'string' ? images : (images.link || images.url) }];
  } else if (Array.isArray(images)) {
    images = images.map((img: any) => ({
      quality: img.quality || '500x500',
      link: img.link || img.url || (typeof img === 'string' ? img : '')
    }));
  }

  let downloadUrls = song.downloadUrl;
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
    primaryArtists: primaryArtists || 'Unknown Artist',
    image: images || [],
    downloadUrl: downloadUrls || []
  };
};

const fetchWithProxy = async (endpoint: string) => {
  const url = `${PROXY}${encodeURIComponent(`${API_BASE}${endpoint}`)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
};

export const musicApi = {
  getTrending: async (languages: string = 'hindi,english') => {
    try {
      const data = await fetchWithProxy(`/search/songs?query=trending&language=${encodeURIComponent(languages)}&limit=20`);
      const results = (data.data?.results || []) as any[];
      return results.map(normalizeSong);
    } catch (error) {
      console.error("Trending fetch error:", error);
      return await musicApi.searchSongs('latest hits');
    }
  },
  searchSongs: async (query: string, page: number = 1, limit: number = 20) => {
    try {
      const data = await fetchWithProxy(`/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      const results = (data.data?.results || []) as any[];
      return results.map(normalizeSong);
    } catch (error) {
      console.error("Search fetch error:", error);
      return [];
    }
  },
  searchAlbums: async (query: string, page: number = 1, limit: number = 20) => {
    try {
      const data = await fetchWithProxy(`/search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return (data.data?.results || []) as Album[];
    } catch (error) {
      console.error("Album search error:", error);
      return [];
    }
  },
  searchArtists: async (query: string, page: number = 1, limit: number = 20) => {
    try {
      const data = await fetchWithProxy(`/search/artists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return (data.data?.results || []) as any[];
    } catch (error) {
      console.error("Artist search error:", error);
      return [];
    }
  },
  getAlbumDetails: async (id: string) => {
    try {
      const data = await fetchWithProxy(`/albums?id=${id}`);
      const album = data.data;
      if (album && album.songs) {
        album.songs = album.songs.map(normalizeSong);
      }
      return album as Album;
    } catch (error) {
      console.error("Album details fetch error:", error);
      return null;
    }
  },
  getPlaylistDetails: async (id: string) => {
    try {
      const data = await fetchWithProxy(`/playlists?id=${id}`);
      const playlist = data.data;
      if (playlist && playlist.songs) {
        playlist.songs = playlist.songs.map(normalizeSong);
      }
      return playlist as Playlist;
    } catch (error) {
      console.error("Playlist details fetch error:", error);
      return null;
    }
  },
  getSongDetails: async (id: string) => {
    try {
      const data = await fetchWithProxy(`/songs?ids=${id}`);
      if (data.data && data.data.length > 0) {
        return normalizeSong(data.data[0]);
      }
      return null;
    } catch (error) {
      console.error("Details fetch error:", error);
      return null;
    }
  },
  getSongsDetailsBulk: async (ids: string[]) => {
    try {
      const data = await fetchWithProxy(`/songs?ids=${ids.join(',')}`);
      const results = (data.data || []) as any[];
      return results.map(normalizeSong);
    } catch (error) {
      console.error("Bulk details fetch error:", error);
      return [];
    }
  },
  getArtistDetails: async (id: string, page: number = 0) => {
    try {
      const data = await fetchWithProxy(`/artists?id=${id}&page=${page}`);
      const artistData = data.data;
      if (artistData && artistData.topSongs) {
        artistData.topSongs = artistData.topSongs.map(normalizeSong);
      }
      return artistData;
    } catch (error) {
      console.error("Artist details fetch error:", error);
      return null;
    }
  }
};
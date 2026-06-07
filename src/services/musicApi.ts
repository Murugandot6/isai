"use client";

// Base URL includes the /api prefix as documented
const API_BASE = 'https://jiosaavn-api.imurugan.workers.dev/api';
// Proxy for handling potential CORS or direct fetch issues
const PROXY = 'https://api.allorigins.win/raw?url=';

export interface Image {
  quality: string;
  url?: string;
  link?: string; // Fallback for some variations
}

export interface DownloadUrl {
  quality: string;
  url?: string;
  link?: string; // Fallback for some variations
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
 * Robust utility to get the track count from any album or playlist object.
 * Prioritizes the actual songs array length as per documentation best practices.
 */
export const getContainerCount = (item: any): string => {
  if (!item) return "0";
  
  // 1. Documentation says: songCount = album.songs.length
  if (item.songs && Array.isArray(item.songs) && item.songs.length > 0) {
    return item.songs.length.toString();
  }

  // 2. Fallback to documented field names
  const count = item.songCount || 
                item.song_count || 
                item.songs_count || 
                item.total_songs || 
                item.more_info?.song_count || 
                item.more_info?.total_songs;

  if (count !== null && count !== undefined && count !== '') {
    return count.toString();
  }
  
  return "0";
};

/**
 * Normalizes song data from the API to maintain compatibility with the UI.
 * Prioritizes the "url" field inside image and download arrays as per documentation.
 */
export const normalizeSong = (song: any): Song => {
  if (!song) return song;

  // Handle artist formats
  let artists = 'Unknown Artist';
  if (song.artists) {
    const primary = song.artists.primary || song.artists.all || [];
    if (Array.isArray(primary)) {
      artists = primary.map((a: any) => a.name).join(', ');
    } else if (typeof primary === 'string') {
      artists = primary;
    }
  } else if (song.primaryArtists) {
    artists = Array.isArray(song.primaryArtists) 
      ? song.primaryArtists.map((a: any) => typeof a === 'string' ? a : a.name).join(', ')
      : song.primaryArtists;
  }

  // Handle images - prioritize .url as per docs
  let rawImages = song.image || [];
  let images: Image[] = [];
  if (Array.isArray(rawImages)) {
    images = rawImages.map((img: any) => ({
      quality: img.quality || '500x500',
      url: img.url || img.link || (typeof img === 'string' ? img : '')
    }));
  } else if (typeof rawImages === 'string') {
    images = [{ quality: '500x500', url: rawImages }];
  }

  // Fallback to album image if song image is missing
  if (images.length === 0 && song.album?.image) {
    const albumImg = song.album.image;
    if (Array.isArray(albumImg)) {
      images = albumImg.map((img: any) => ({
        quality: img.quality || '500x500',
        url: img.url || img.link || (typeof img === 'string' ? img : '')
      }));
    }
  }

  // Handle download URLs - prioritize .url
  let rawDownloads = song.downloadUrl || [];
  let downloads: DownloadUrl[] = [];
  if (Array.isArray(rawDownloads)) {
    downloads = rawDownloads.map((dl: any) => ({
      quality: dl.quality || '320kbps',
      url: dl.url || dl.link || (typeof dl === 'string' ? dl : '')
    }));
  }

  return {
    ...song,
    id: song.id?.toString() || '',
    name: song.name || song.title || 'Unknown Track',
    primaryArtists: artists,
    image: images,
    downloadUrl: downloads,
    language: song.language || 'unknown',
    album: song.album || { id: 'unknown', name: 'Unknown Album', url: '' }
  };
};

const fetchWithProxy = async (endpoint: string) => {
  const targetUrl = `${API_BASE}${endpoint}`;
  
  try {
    const res = await fetch(targetUrl);
    if (res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (e) {
    console.warn("Direct fetch failed, falling back to proxy:", e);
  }

  const url = `${PROXY}${encodeURIComponent(targetUrl)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const json = await res.json();
  return json.data || json;
};

export const musicApi = {
  getTrending: async (languages: string = 'tamil,hindi') => {
    try {
      const data = await fetchWithProxy(`/search/songs?query=trending&language=${encodeURIComponent(languages)}&limit=20`);
      const results = (data.results || data || []) as any[];
      return results.map(normalizeSong);
    } catch (error) {
      return [];
    }
  },
  searchSongs: async (query: string, page: number = 0, limit: number = 20) => {
    try {
      const data = await fetchWithProxy(`/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      const results = (data.results || data || []) as any[];
      return results.map(normalizeSong);
    } catch (error) {
      return [];
    }
  },
  searchAlbums: async (query: string, page: number = 0, limit: number = 20) => {
    try {
      const data = await fetchWithProxy(`/search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return (data.results || data || []) as Album[];
    } catch (error) {
      return [];
    }
  },
  searchArtists: async (query: string, page: number = 0, limit: number = 20) => {
    try {
      const data = await fetchWithProxy(`/search/artists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return (data.results || data || []) as any[];
    } catch (error) {
      return [];
    }
  },
  getAlbumDetails: async (id: string) => {
    try {
      // Using path parameter as documented: /api/albums/{id}
      const data = await fetchWithProxy(`/albums/${id}`);
      if (data && data.songs) {
        data.songs = data.songs.map(normalizeSong);
      }
      return data as Album;
    } catch (e) {
      return null;
    }
  },
  getPlaylistDetails: async (id: string) => {
    try {
      // Documentation structure: /api/playlists/{id}
      const data = await fetchWithProxy(`/playlists/${id}`);
      if (data && data.songs) {
        data.songs = data.songs.map(normalizeSong);
      }
      return data as Playlist;
    } catch (e) {
      return null;
    }
  },
  getSongDetails: async (id: string) => {
    try {
      // Documented path: /api/songs/{id}
      const data = await fetchWithProxy(`/songs/${id}`);
      const songData = Array.isArray(data) ? data[0] : data;
      return songData ? normalizeSong(songData) : null;
    } catch (e) {
      return null;
    }
  },
  getSongsDetailsBulk: async (ids: string[]) => {
    if (!ids || ids.length === 0) return [];
    try {
      // Bulk fetch documented using query param: /api/songs?ids={ids}
      const data = await fetchWithProxy(`/songs?ids=${ids.join(',')}`);
      const results = (Array.isArray(data) ? data : (data.results ? data.results : [data])) as any[];
      return results.filter(Boolean).map(normalizeSong);
    } catch (e) {
      return [];
    }
  },
  getArtistDetails: async (id: string) => {
    try {
      const data = await fetchWithProxy(`/artists/${id}`);
      if (data && data.topSongs) data.topSongs = data.topSongs.map(normalizeSong);
      return data;
    } catch (error) {
      return null;
    }
  },
  getArtistSongs: async (id: string, page: number = 0) => {
    try {
      const data = await fetchWithProxy(`/artists/${id}/songs?page=${page}`);
      const results = (data.songs || data.results || data || []) as any[];
      return results.map(normalizeSong);
    } catch (error) {
      return [];
    }
  }
};
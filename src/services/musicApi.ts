"use client";

// Base URL for the JioSaavn API worker
const API_BASE = 'https://jiosaavn-api.imurugan.workers.dev/api';
// Using corsproxy.io as it's generally more reliable and faster for raw data
const PROXY = 'https://corsproxy.io/?';

export interface Image {
  quality: string;
  url?: string;
  link?: string;
}

export interface DownloadUrl {
  quality: string;
  url?: string;
  link?: string;
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
 */
export const getContainerCount = (item: any): string => {
  if (!item) return "0";
  
  if (item.songs && Array.isArray(item.songs) && item.songs.length > 0) {
    return item.songs.length.toString();
  }

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
 */
export const normalizeSong = (song: any): Song => {
  if (!song) return song;

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

  if (images.length === 0 && song.album?.image) {
    const albumImg = song.album.image;
    if (Array.isArray(albumImg)) {
      images = albumImg.map((img: any) => ({
        quality: img.quality || '500x500',
        url: img.url || img.link || (typeof img === 'string' ? img : '')
      }));
    }
  }

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
  
  // Try direct fetch first as it's the most efficient
  try {
    const res = await fetch(targetUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (e) {
    console.warn("Direct fetch failed or timed out, trying proxy...");
  }

  // Fallback to proxy
  try {
    const proxyUrl = `${PROXY}${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
    const json = await res.json();
    return json.data || json;
  } catch (e) {
    console.error("All fetch attempts failed:", e);
    throw e;
  }
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
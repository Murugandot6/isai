"use client";

// Using allorigins as a fallback proxy for raw API data if direct fetch fails
const PROXY = 'https://api.allorigins.win/raw?url=';
const API_BASE = 'https://jiosaavn-api.imurugan.workers.dev/api';

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
 * Robust utility to get the track count from any album or playlist object.
 * Handles diverse API formats including nested fields, ID lists, and different naming conventions.
 */
export const getContainerCount = (item: any): string => {
  if (!item) return "0";
  
  // 1. Aggressively check all possible direct and nested count fields
  const count = item.songCount || 
                item.song_count || 
                item.songs_count || 
                item.total_songs || 
                item.more_info?.song_count || 
                item.more_info?.total_songs || 
                item.more_info?.songs_count ||
                item.more_info?.song_pids?.split(',').length ||
                item.more_info?.pids?.split(',').length;

  if (count !== null && count !== undefined && count !== '') {
    const parsed = parseInt(count.toString());
    if (!isNaN(parsed) && parsed > 0) return parsed.toString();
  }
  
  // 2. Fallback to the actual songs array length if populated
  if (item.songs && Array.isArray(item.songs) && item.songs.length > 0) {
    return item.songs.length.toString();
  }
  
  // 3. Last resort: check if there's a list of IDs in string format
  const pids = item.more_info?.song_pids || item.more_info?.pids;
  if (pids && typeof pids === 'string') {
    const c = pids.split(',').filter(Boolean).length;
    if (c > 0) return c.toString();
  }
  
  return "0";
};

/**
 * Normalizes song data from the API to maintain compatibility with the UI.
 */
export const normalizeSong = (song: any): Song => {
  if (!song) return song;

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

  // Find images in various possible fields
  let images = song.image || song.images || [];
  if (!Array.isArray(images)) {
    images = [{ quality: '500x500', link: typeof images === 'string' ? images : (images.link || images.url) }];
  } else if (images.length === 0 && song.album?.image) {
    const albumImg = song.album.image;
    images = Array.isArray(albumImg) ? albumImg : [{ quality: '500x500', link: albumImg }];
  } else {
    images = images.map((img: any) => ({
      quality: img.quality || '500x500',
      link: img.link || img.url || (typeof img === 'string' ? img : '')
    }));
  }

  let downloadUrls = song.downloadUrl || song.download_url || [];
  if (!Array.isArray(downloadUrls)) {
    downloadUrls = [{ quality: '320kbps', link: typeof downloadUrls === 'string' ? downloadUrls : (downloadUrls.link || downloadUrls.url) }];
  } else {
    downloadUrls = downloadUrls.map((dl: any) => ({
      quality: dl.quality || '320kbps',
      link: dl.link || dl.url || (typeof dl === 'string' ? dl : '')
    }));
  }

  return {
    ...song,
    name: song.name || song.title || 'Unknown Track',
    primaryArtists: primaryArtists || 'Unknown Artist',
    image: images,
    downloadUrl: downloadUrls,
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
  getTrending: async (languages: string = 'hindi,english') => {
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
    let data = null;
    try {
      data = await fetchWithProxy(`/albums?id=${id}`);
    } catch (e) {}
    
    if (!data || !data.songs || data.songs.length === 0) {
      try {
        const pathData = await fetchWithProxy(`/albums/${id}`);
        if (pathData && pathData.songs) data = pathData;
      } catch (e) {}
    }

    if (data && data.songs) {
      data.songs = data.songs.map(normalizeSong);
    }
    return data as Album;
  },
  getPlaylistDetails: async (id: string) => {
    let data = null;
    try {
      data = await fetchWithProxy(`/playlists?id=${id}`);
    } catch (e) {}
    
    if (!data || !data.songs || data.songs.length === 0) {
      try {
        const pathData = await fetchWithProxy(`/playlists/${id}`);
        if (pathData && pathData.songs) data = pathData;
      } catch (e) {}
    }

    if (data && data.songs) {
      data.songs = data.songs.map(normalizeSong);
    }
    return data as Playlist;
  },
  getSongDetails: async (id: string) => {
    let data = null;
    try {
      data = await fetchWithProxy(`/songs?ids=${id}`);
    } catch (e) {}
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
      try {
        data = await fetchWithProxy(`/songs/${id}`);
      } catch (e) {}
    }
    
    const songData = Array.isArray(data) ? data[0] : (data.results ? data.results[0] : data);
    return songData ? normalizeSong(songData) : null;
  },
  getSongsDetailsBulk: async (ids: string[]) => {
    if (!ids || ids.length === 0) return [];
    let data = null;
    
    try {
      data = await fetchWithProxy(`/songs?ids=${ids.join(',')}`);
    } catch (e) {}
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
      try {
        const results = await Promise.allSettled(ids.map(id => fetchWithProxy(`/songs/${id}`)));
        data = results
          .filter(r => r.status === 'fulfilled')
          .map(r => (r as PromiseFulfilledResult<any>).value);
      } catch (e) {}
    }
    
    const results = (Array.isArray(data) ? data : (data.results ? data.results : [data])) as any[];
    return results.filter(Boolean).map(normalizeSong);
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
      const results = (data.results || data.songs || data || []) as any[];
      return results.map(normalizeSong);
    } catch (error) {
      return [];
    }
  },
  getArtistAlbums: async (id: string, page: number = 0) => {
    try {
      const data = await fetchWithProxy(`/artists/${id}/albums?page=${page}`);
      return (data.results || data.albums || data || []) as Album[];
    } catch (error) {
      return [];
    }
  }
};
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

  let images = song.image || song.images || [];
  if (!Array.isArray(images)) {
    images = [{ quality: '500x500', link: typeof images === 'string' ? images : (images.link || images.url) }];
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
    // Try direct fetch first (much faster, no proxy overhead, native CORS support on Cloudflare Workers)
    const res = await fetch(targetUrl);
    if (res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (e) {
    console.warn("Direct fetch failed, falling back to proxy:", e);
  }

  // Fallback to proxy if direct fetch fails
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
      // Try query param first
      let data = await fetchWithProxy(`/albums?id=${id}`);
      
      // If it doesn't have songs, try path param
      if (!data || !data.songs || data.songs.length === 0) {
        try {
          const pathData = await fetchWithProxy(`/albums/${id}`);
          if (pathData && pathData.songs && pathData.songs.length > 0) {
            data = pathData;
          }
        } catch (e) {
          console.warn("Path param fetch failed for album:", e);
        }
      }

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
      // Try query param first
      let data = await fetchWithProxy(`/playlists?id=${id}`);
      
      // If it doesn't have songs, try path param
      if (!data || !data.songs || data.songs.length === 0) {
        try {
          const pathData = await fetchWithProxy(`/playlists/${id}`);
          if (pathData && pathData.songs && pathData.songs.length > 0) {
            data = pathData;
          }
        } catch (e) {
          console.warn("Path param fetch failed for playlist:", e);
        }
      }

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
      let data = await fetchWithProxy(`/songs?ids=${id}`);
      if (!data || (Array.isArray(data) && data.length === 0)) {
        try {
          data = await fetchWithProxy(`/songs/${id}`);
        } catch (e) {
          console.warn("Path param fetch failed for song:", e);
        }
      }
      const songData = Array.isArray(data) ? data[0] : (data.results ? data.results[0] : data);
      return songData ? normalizeSong(songData) : null;
    } catch (error) {
      console.error("Details fetch error:", error);
      return null;
    }
  },
  getSongsDetailsBulk: async (ids: string[]) => {
    try {
      let data = await fetchWithProxy(`/songs?ids=${ids.join(',')}`);
      if (!data || (Array.isArray(data) && data.length === 0)) {
        try {
          data = await Promise.all(ids.map(id => fetchWithProxy(`/songs/${id}`)));
        } catch (e) {
          console.warn("Path param fetch failed for bulk songs:", e);
        }
      }
      const results = (Array.isArray(data) ? data : (data.results ? data.results : [data])) as any[];
      return results.map(normalizeSong);
    } catch (error) {
      console.error("Bulk details fetch error:", error);
      return [];
    }
  },
  getArtistDetails: async (id: string) => {
    try {
      const data = await fetchWithProxy(`/artists/${id}`);
      if (data) {
        const songsList = data.topSongs || data.songs || [];
        data.topSongs = songsList.map(normalizeSong);
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
      const results = (data.results || data.songs || data || []) as any[];
      return results.map(normalizeSong);
    } catch (error) {
      console.error("Artist songs fetch error:", error);
      return [];
    }
  },
  getArtistAlbums: async (id: string, page: number = 0) => {
    try {
      const data = await fetchWithProxy(`/artists/${id}/albums?page=${page}`);
      return (data.results || data.albums || data || []) as Album[];
    } catch (error) {
      console.error("Artist albums fetch error:", error);
      return [];
    }
  }
};
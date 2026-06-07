"use client";

const BASE_URL = 'https://saavn.sumit.co/api';

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
  
  if (!primaryArtists && song.artists) {
    if (Array.isArray(song.artists.primary)) {
      primaryArtists = song.artists.primary.map((a: any) => a.name).join(', ');
    } else if (Array.isArray(song.artists.all)) {
      primaryArtists = song.artists.all.map((a: any) => a.name).join(', ');
    }
  }

  // Ensure image is always an array
  let images = song.image;
  if (images && !Array.isArray(images)) {
    images = [{ quality: '500x500', link: typeof images === 'string' ? images : (images.link || images.url) }];
  }

  // Ensure downloadUrl is always an array
  let downloadUrls = song.downloadUrl;
  if (downloadUrls && !Array.isArray(downloadUrls)) {
    downloadUrls = [{ quality: '320kbps', link: typeof downloadUrls === 'string' ? downloadUrls : (downloadUrls.link || downloadUrls.url) }];
  }

  return {
    ...song,
    primaryArtists: primaryArtists || 'Unknown Artist',
    image: Array.isArray(images) ? images : [],
    downloadUrl: Array.isArray(downloadUrls) ? downloadUrls : []
  };
};

export const musicApi = {
  getTrending: async (languages: string = 'hindi,english') => {
    try {
      const res = await fetch(`${BASE_URL}/trending?language=${encodeURIComponent(languages)}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const songs = (data.data || []) as any[];
      return songs.map(normalizeSong);
    } catch (error) {
      console.error("Trending fetch error:", error);
      return await musicApi.searchSongs('latest hits');
    }
  },
  searchSongs: async (query: string, page: number = 1, limit: number = 20) => {
    try {
      const res = await fetch(`${BASE_URL}/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const results = (data.data?.results || []) as any[];
      return results.map(normalizeSong);
    } catch (error) {
      console.error("Search fetch error:", error);
      return [];
    }
  },
  searchAlbums: async (query: string, page: number = 1, limit: number = 20) => {
    try {
      const res = await fetch(`${BASE_URL}/search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return (data.data?.results || []) as Album[];
    } catch (error) {
      console.error("Album search error:", error);
      return [];
    }
  },
  searchArtists: async (query: string, page: number = 1, limit: number = 20) => {
    try {
      const res = await fetch(`${BASE_URL}/search/artists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return (data.data?.results || []) as any[];
    } catch (error) {
      console.error("Artist search error:", error);
      return [];
    }
  },
  getAlbumDetails: async (id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/albums?id=${id}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
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
      const res = await fetch(`${BASE_URL}/playlists?id=${id}&limit=100`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
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
      const res = await fetch(`${BASE_URL}/songs?ids=${id}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
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
      const res = await fetch(`${BASE_URL}/songs?ids=${ids.join(',')}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const results = (data.data || []) as any[];
      return results.map(normalizeSong);
    } catch (error) {
      console.error("Bulk details fetch error:", error);
      return [];
    }
  },
  getArtistDetails: async (id: string, page: number = 0) => {
    try {
      const res = await fetch(`${BASE_URL}/artists/${id}?page=${page}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
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
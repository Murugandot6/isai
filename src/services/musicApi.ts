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

/**
 * Normalizes song data from different API endpoints to a consistent format.
 * Some endpoints return artists as objects, others as strings.
 */
export const normalizeSong = (song: any): Song => {
  if (!song) return song;

  let primaryArtists = song.primaryArtists;
  
  // If primaryArtists is missing but artists object exists (common in Artist Top Songs API)
  if (!primaryArtists && song.artists) {
    if (Array.isArray(song.artists.primary)) {
      primaryArtists = song.artists.primary.map((a: any) => a.name).join(', ');
    } else if (Array.isArray(song.artists.all)) {
      primaryArtists = song.artists.all.map((a: any) => a.name).join(', ');
    }
  }

  return {
    ...song,
    primaryArtists: primaryArtists || 'Unknown Artist',
    // Ensure image and downloadUrl are arrays
    image: Array.isArray(song.image) ? song.image : [],
    downloadUrl: Array.isArray(song.downloadUrl) ? song.downloadUrl : []
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
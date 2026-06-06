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

export const musicApi = {
  getTrending: async (languages: string = 'hindi,english') => {
    try {
      const res = await fetch(`${BASE_URL}/trending?language=${encodeURIComponent(languages)}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return (data.data || []) as Song[];
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
      return (data.data?.results || []) as Song[];
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
      return (data.data && data.data.length > 0) ? data.data[0] as Song : null;
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
      return data.data;
    } catch (error) {
      console.error("Artist details fetch error:", error);
      return null;
    }
  },
  searchArtists: async (query: string) => {
    try {
      const res = await fetch(`${BASE_URL}/search/artists?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return (data.data?.results || []) as any[];
    } catch (error) {
      console.error("Artist search error:", error);
      return [];
    }
  }
};
"use client";

// Switching to a more stable instance that often has better CORS support
const BASE_URL = 'https://saavn.me';

export interface Image {
  quality: string;
  link: string;
}

export interface DownloadUrl {
  quality: string;
  link: string;
}

export interface Artist {
  id: string;
  name: string;
  role: string;
  type: string;
  image: Image[];
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
  releaseDate: string;
  duration: number;
  label: string;
  primaryArtists: string;
  featuredArtists: string;
  artists: {
    primary: Artist[];
    all: Artist[];
  };
  image: Image[];
  downloadUrl: DownloadUrl[];
  hasLyrics: boolean;
}

export const musicApi = {
  getTrending: async (languages: string = 'hindi,english') => {
    try {
      // The endpoints are usually directly under the root or /api depending on the instance
      // We'll try the common structure
      const res = await fetch(`${BASE_URL}/search/songs?query=trending&limit=40&language=${languages}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      return (data.data?.results || []) as Song[];
    } catch (error) {
      console.error("Trending fetch error:", error);
      // Fallback: Try without the /api prefix or different structure if needed
      return [];
    }
  },
  searchSongs: async (query: string) => {
    try {
      const res = await fetch(`${BASE_URL}/search/songs?query=${encodeURIComponent(query)}&limit=40`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      return (data.data?.results || []) as Song[];
    } catch (error) {
      console.error("Search fetch error:", error);
      return [];
    }
  },
  getSongDetails: async (id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/songs?id=${id}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      return (data.data && data.data.length > 0) ? data.data[0] as Song : null;
    } catch (error) {
      console.error("Details fetch error:", error);
      return null;
    }
  }
};
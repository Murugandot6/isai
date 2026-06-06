"use client";

// Using a highly stable and well-maintained instance
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
      // Use the specific trending endpoint if available, otherwise search for popular
      const res = await fetch(`${BASE_URL}/modules?language=${languages}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      
      // Extract trending from modules if available, else fallback to a general search
      if (data.data?.trending?.songs) {
        return data.data.trending.songs as Song[];
      }
      
      const searchRes = await fetch(`${BASE_URL}/search/songs?query=top%20songs&limit=40&language=${languages}`);
      const searchData = await searchRes.json();
      return (searchData.data?.results || []) as Song[];
    } catch (error) {
      console.error("Trending fetch error:", error);
      return [];
    }
  },
  searchSongs: async (query: string) => {
    try {
      const res = await fetch(`${BASE_URL}/search/songs?query=${encodeURIComponent(query)}&limit=40`);
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
      const res = await fetch(`${BASE_URL}/songs?id=${id}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return (data.data && data.data.length > 0) ? data.data[0] as Song : null;
    } catch (error) {
      console.error("Details fetch error:", error);
      return null;
    }
  }
};
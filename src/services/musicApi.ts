"use client";

// Using the API endpoint provided by the user
const BASE_URL = 'https://saavn.sumit.co/api';

export interface Image {
  quality: string;
  link: string;
}

export interface DownloadUrl {
  quality: string;
  link: string;
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
      // The trending endpoint on this API
      const res = await fetch(`${BASE_URL}/trending?language=${encodeURIComponent(languages)}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      
      // Structure: data -> results
      return (data.data || []) as Song[];
    } catch (error) {
      console.error("Trending fetch error:", error);
      // Fallback search
      return await musicApi.searchSongs('latest hits');
    }
  },
  searchSongs: async (query: string) => {
    try {
      const res = await fetch(`${BASE_URL}/search/songs?query=${encodeURIComponent(query)}&limit=20`);
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
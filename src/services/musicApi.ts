"use client";

const BASE_URL = 'https://saavn.sumit.co/api';

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
  getTrending: async () => {
    const res = await fetch(`${BASE_URL}/search/songs?query=trending&limit=20`);
    const data = await res.json();
    return (data.data?.results || []) as Song[];
  },
  searchSongs: async (query: string) => {
    const res = await fetch(`${BASE_URL}/search/songs?query=${encodeURIComponent(query)}&limit=30`);
    const data = await res.json();
    return (data.data?.results || []) as Song[];
  },
  getSongDetails: async (id: string) => {
    // The plan suggests /api/songs/{id} format
    const res = await fetch(`${BASE_URL}/songs/${id}`);
    const data = await res.json();
    // Return the first song in the data array if it exists
    return (data.data && data.data.length > 0) ? data.data[0] as Song : null;
  }
};
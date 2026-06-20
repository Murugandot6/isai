"use client";

import { Movie } from "@/context/MusicContext";

const API_KEY = "c9a3033fe3a3f5e6378891c5d0e887bf";
const BASE_URL = "https://api.themoviedb.org/3";

const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
};

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

const mapTMDbToMovie = (item: any): Movie => {
  const genres = item.genre_ids && Array.isArray(item.genre_ids)
    ? item.genre_ids.map((id: number) => GENRE_MAP[id] || '').filter(Boolean).slice(0, 2).join(' / ')
    : 'Movie';

  let year = 'N/A';
  if (item.release_date && typeof item.release_date === 'string') {
    year = item.release_date.split('-')[0] || 'N/A';
  } else if (item.first_air_date && typeof item.first_air_date === 'string') {
    year = item.first_air_date.split('-')[0] || 'N/A';
  }

  return {
    id: (item.id || '').toString(),
    title: item.title || item.name || 'Untitled Movie',
    overview: item.overview || 'No overview available.',
    backdrop: item.backdrop_path 
      ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` 
      : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200',
    poster: item.poster_path 
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
      : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=400',
    rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 0,
    year,
    genre: genres || 'Drama',
    language: item.original_language ? item.original_language.toUpperCase() : 'EN',
    imdbId: item.imdb_id || undefined
  };
};

export const tmdbApi = {
  getTrendingMovies: async (): Promise<Movie[]> => {
    try {
      const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
      if (!res.ok) throw new Error("Failed to fetch trending movies");
      const data = await res.json();
      return (data.results || []).map(mapTMDbToMovie);
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  getPopularMovies: async (): Promise<Movie[]> => {
    try {
      const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
      if (!res.ok) throw new Error("Failed to fetch popular movies");
      const data = await res.json();
      return (data.results || []).map(mapTMDbToMovie);
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  getTopRatedMovies: async (): Promise<Movie[]> => {
    try {
      const res = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`);
      if (!res.ok) throw new Error("Failed to fetch top rated movies");
      const data = await res.json();
      return (data.results || []).map(mapTMDbToMovie);
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  getUpcomingMovies: async (): Promise<Movie[]> => {
    try {
      const res = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`);
      if (!res.ok) throw new Error("Failed to fetch upcoming movies");
      const data = await res.json();
      return (data.results || []).map(mapTMDbToMovie);
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  searchMovies: async (query: string): Promise<Movie[]> => {
    try {
      const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Failed to search movies");
      const data = await res.json();
      return (data.results || []).map(mapTMDbToMovie);
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  getMovieImdbId: async (movieId: string): Promise<string | null> => {
    try {
      const res = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=external_ids`);
      if (!res.ok) throw new Error("Failed to fetch movie details");
      const data = await res.json();
      return data.imdb_id || data.external_ids?.imdb_id || null;
    } catch (error) {
      console.error("Error fetching IMDB ID:", error);
      return null;
    }
  },

  getMovieCredits: async (movieId: string): Promise<CastMember[]> => {
    try {
      const res = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`);
      if (!res.ok) throw new Error("Failed to fetch movie credits");
      const data = await res.json();
      return (data.cast || []).slice(0, 10).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profile_path: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
      }));
    } catch (error) {
      console.error("Error fetching credits:", error);
      return [];
    }
  }
};
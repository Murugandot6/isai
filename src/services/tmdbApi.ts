export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  backdrop: string;
  poster: string;
  rating: number;
  year: string;
  genre: string;
  language: string;
  imdbId?: string;
  streamUrl?: string;
}

// Default export contains API functions
const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = 'YOUR_API_KEY'; // In real app, use env variable

export const getTrendingMovies = async (): Promise<Movie[]> => {
  const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
  const data = await response.json();
  return data.results.map(movie => ({
    ...movie,
    rating: movie.vote_average,
    year: movie.release_date?.slice(0, 4) || 'N/A',
    genre: movie.genre_ids?.join(', ') || 'Unknown',
    language: movie.original_language,
    imdbId: movie.id.toString(),
    streamUrl: `${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`
  }));
};

export const getPopularMovies = async (): Promise<Movie[]> => {
  const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  const data = await response.json();
  return data.results.map(movie => ({
    ...movie,
    rating: movie.vote_average,
    year: movie.release_date?.slice(0, 4) || 'N/A',
    genre: movie.genre_ids?.join(', ') || 'Unknown',
    language: movie.original_language,
    imdbId: movie.id.toString(),
    streamUrl: `${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`
  }));
};

export const getTopRatedMovies = async (): Promise<Movie[]> => {
  const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`);
  const data = await response.json();
  return data.results.map(movie => ({
    ...movie,
    rating: movie.vote_average,
    year: movie.release_date?.slice(0, 4) || 'N/A',
    genre: movie.genre_ids?.join(', ') || 'Unknown',
    language: movie.original_language,
    imdbId: movie.id.toString(),
    streamUrl: `${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`
  }));
};

export const getUpcomingMovies = async (): Promise<Movie[]> => {
  const response = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`);
  const data = await response.json();
  return data.results.map(movie => ({
    ...movie,
    rating: movie.vote_average,
    year: movie.release_date?.slice(0, 4) || 'N/A',
    genre: movie.genre_ids?.join(', ') || 'Unknown',
    language: movie.original_language,
    imdbId: movie.id.toString(),
    streamUrl: `${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`
  }));
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
  const data = await response.json();
  return data.results.map(movie => ({
    ...movie,
    rating: movie.vote_average,
    year: movie.release_date?.slice(0, 4) || 'N/A',
    genre: movie.genre_ids?.join(', ') || 'Unknown',
    language: movie.original_language,
    imdbId: movie.id.toString(),
    streamUrl: `${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`
  }));
};

export default {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  searchMovies
};
export interface Movie {
  id: string;
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
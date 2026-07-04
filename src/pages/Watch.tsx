"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useMusic } from '@/context/MusicContext';
import tmdbApi from '@/services/tmdbApi';
import { StreamPlayer } from '@/components/StreamPlayer';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AlertCircle, Film, Tv, ExternalLink } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Watch = () => {
  const { playMovie, currentMovie, closeMovie } = useMusic();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const movieId = searchParams.get('movie');
    if (movieId) {
      const fetchMovie = async () => {
        setLoading(true);
        try {
          const results = await tmdbApi.searchMovies(movieId);
          if (results[0]) {
            // Convert tmdbApi Movie to MusicContext Movie (id: number -> string)
            const movieData = {
              ...results[0],
              id: results[0].id.toString(),
            };
            setMovie(movieData);
            playMovie(movieData);
          } else {
            setError("Movie not found");
          }
        } catch (err) {
          setError("Failed to load movie");
        } finally {
          setLoading(false);
        }
      };
      fetchMovie();
    } else {
      setError("No movie specified");
      setLoading(false);
    }
  }, [searchParams, playMovie]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin text-purple-400" style={{ width: 48, height: 48 }} />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">Unable to Load Movie</h2>
          <p className="text-zinc-400 mb-6">{error || "Movie not found"}</p>
          <Button onClick={() => navigate('/movies')} className="bg-purple-600 hover:bg-purple-700">
            Back to Movies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <StreamPlayer movie={movie} />
    </div>
  );
};

export default Watch;
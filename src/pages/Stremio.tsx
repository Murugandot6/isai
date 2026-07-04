"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/MainLayout";
import { useMusic, Movie } from "@/context/MusicContext";
import { StreamPlayer } from "@/components/StreamPlayer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, AlertCircle, Film, Tv, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import tmdbApi from "@/services/tmdbApi";

const Stremio = () => {
  const { playMovie, currentMovie, closeMovie } = useMusic();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const results = await tmdbApi.searchMovies(searchQuery);
      if (results[0]) {
        // Convert tmdbApi Movie to MusicContext Movie (id: number -> string)
        const movie: Movie = {
          ...results[0],
          id: results[0].id.toString(),
        };
        setSelectedMovie(movie);
        navigate(`/watch?movie=${results[0].id}`);
      }
    } catch (err) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Stremio Hub</h2>

        <form onSubmit={handleSearch} className="mb-6">
          <Input
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 bg-zinc-800 text-white rounded-lg border border-zinc-700"
          />
          <Button className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2">
            Search
          </Button>
        </form>

        {selectedMovie && <StreamPlayer movie={selectedMovie} />}

        <Badge className="mt-4 rounded-lg bg-purple-600 text-purple-100 px-2 py-1 text-xs">
          New Releases
        </Badge>
      </div>
    </MainLayout>
  );
};

export default Stremio;
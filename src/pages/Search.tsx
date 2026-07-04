"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMusic } from "@/context/MusicContext";
import tmdbApi from "@/services/tmdbApi";
import { Song } from "@/services/musicApi";
import { Search as SearchIcon, Loader2 } from "lucide-react";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?type=movies&q=${encodeURIComponent(searchQuery)}`);
  };

  // Close search on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target && !target.closest(".search-container")) {
      setIsSearchOpen(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Search overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setIsSearchOpen(false)}
            className="absolute top-6 right-6 p-2 text-white hover:text-purple-400 transition-colors"
            title="Close"
          >
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <form onSubmit={handleSubmit} className="relative w-full max-w-lg text-center space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-widest text-purple-400">Search Movies</h2>
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-zinc-900 border-2 border-transparent focus-visible:border-purple-600/30 h-11 rounded-lg text-sm text-white"
                autoFocus
              />
            </div>
          </form>
        </div>
      )}

      {/* Main page content – replace with your existing layout */}
      <div className="flex-1 overflow-y-auto">
        {/* ... existing page markup ... */}
      </div>
    </div>
  );
};

export default Search;
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const debounced = setTimeout(() => {
      if (searchQuery.trim()) {
        setSearchParams({ q: searchQuery });
      }
    }, 500);
    return () => clearTimeout(debounced);
  }, [searchQuery, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto">
      <form onSubmit={handleSearch} className="max-w-md mx-auto">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
            Search
          </Button>
        </div>
      </form>
    </div>
  );
}
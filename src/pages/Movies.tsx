"use client";

import React, { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useMusic, Movie } from '@/context/MusicContext';
import { Play, Film, Star, Search, Tv, X, RefreshCw, Users, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const CURATED_MOVIES: Movie[] = [
  {
    id: '968051',
    title: 'Leo',
    overview: 'An ordinary cafe owner becomes the target of a ruthless drug cartel who suspect him of being a legendary former assassin.',
    backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200',
    poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=400',
    rating: 8.2,
    year: '2023',
    genre: 'Action / Thriller',
    language: 'Tamil'
  },
  {
    id: '828814',
    title: 'Vikram',
    overview: 'A special ops team is summoned to investigate a series of brutal murders committed by a masked group of vigilantes.',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200',
    poster: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=400',
    rating: 8.5,
    year: '2022',
    genre: 'Action / Crime',
    language: 'Tamil'
  },
  {
    id: '943822',
    title: 'Jailer',
    overview: 'A retired prison warden goes on a relentless manhunt to track down his son\'s kidnappers, unleashing his dark past.',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=400',
    rating: 8.0,
    year: '2023',
    genre: 'Action / Drama',
    language: 'Tamil'
  },
  {
    id: '157336',
    title: 'Interstellar',
    overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200',
    poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=400',
    rating: 8.7,
    year: '2014',
    genre: 'Sci-Fi / Adventure',
    language: 'English'
  },
  {
    id: '693134',
    title: 'Dune: Part Two',
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    backdrop: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=1200',
    poster: 'https://images.unsplash.com/photo-1547483238-f400e65ccd56?q=80&w=400',
    rating: 8.6,
    year: '2024',
    genre: 'Sci-Fi / Drama',
    language: 'English'
  },
  {
    id: '27205',
    title: 'Inception',
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.',
    backdrop: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200',
    poster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=400',
    rating: 8.8,
    year: '2010',
    genre: 'Sci-Fi / Action',
    language: 'English'
  },
  {
    id: '579974',
    title: 'RRR',
    overview: 'A fictional history of two legendary revolutionaries and their journey away from home before they began fighting for their country.',
    backdrop: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200',
    poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=400',
    rating: 8.3,
    year: '2022',
    genre: 'Action / Drama',
    language: 'Telugu'
  }
];

const Movies = () => {
  const { currentMovie, playMovie, closeMovie, roomCode } = useMusic();
  const [searchQuery, setSearchQuery] = useState('');
  const [server, setServer] = useState<'vidsrc' | 'vidsrc_xyz'>('vidsrc');

  const filteredMovies = CURATED_MOVIES.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEmbedUrl = (movieId: string) => {
    if (server === 'vidsrc') {
      return `https://vidsrc.to/embed/movie/${movieId}`;
    }
    return `https://vidsrc.xyz/embed/movie/${movieId}`;
  };

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/20 p-2 rounded-xl">
                <Film className="text-primary" size={24} />
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">CINEMA</Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tight">isai Cinema</h1>
            <p className="text-muted-foreground font-medium">Watch blockbusters together in real-time sync.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies or genres..." 
              className="pl-10 bg-accent/5 border-none h-11 rounded-xl focus-visible:ring-primary/20"
            />
          </div>
        </div>

        {/* Theater Mode Player Overlay */}
        {currentMovie && (
          <div className="fixed inset-0 bg-black/95 z-50 flex flex-col animate-in fade-in duration-300">
            {/* Player Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-black">
              <div className="flex items-center gap-3">
                <Tv className="text-primary" size={24} />
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    {currentMovie.title}
                    <span className="text-xs text-muted-foreground font-normal">({currentMovie.year})</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">{currentMovie.genre}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {roomCode && (
                  <Badge className="bg-green-500 text-white gap-1.5 py-1 px-3 rounded-full font-bold text-xs animate-pulse">
                    <Users size={12} />
                    Synced Room: {roomCode}
                  </Badge>
                )}

                {/* Server Switcher */}
                <div className="flex bg-white/10 rounded-lg p-0.5 text-xs">
                  <button 
                    onClick={() => setServer('vidsrc')}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all ${server === 'vidsrc' ? 'bg-primary text-white' : 'text-white/60 hover:text-white'}`}
                  >
                    Server 1
                  </button>
                  <button 
                    onClick={() => setServer('vidsrc_xyz')}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all ${server === 'vidsrc_xyz' ? 'bg-primary text-white' : 'text-white/60 hover:text-white'}`}
                  >
                    Server 2
                  </button>
                </div>

                <button 
                  onClick={() => closeMovie()}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Video Iframe Container */}
            <div className="flex-1 relative bg-black flex items-center justify-center">
              <iframe 
                src={getEmbedUrl(currentMovie.id)}
                className="w-full h-full border-none"
                allowFullScreen
                scrolling="no"
                allow="autoplay; encrypted-media"
              />
            </div>

            {/* Player Footer / Info */}
            <div className="p-4 md:p-6 bg-zinc-950 border-t border-white/10 text-white">
              <div className="max-w-4xl mx-auto flex gap-4 items-start">
                <Info size={20} className="text-primary shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{currentMovie.overview}</p>
                  <div className="flex gap-4 mt-3 text-xs text-zinc-500 font-bold">
                    <span>RATING: {currentMovie.rating} ★</span>
                    <span>LANGUAGE: {currentMovie.language.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Curated Movies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMovies.map((movie) => (
            <div 
              key={movie.id}
              className="group relative bg-card/40 border border-border/50 rounded-3xl overflow-hidden hover:border-primary/30 transition-all duration-500 hover:-translate-y-1.5 flex flex-col"
            >
              {/* Backdrop Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-accent/10">
                <img 
                  src={movie.backdrop} 
                  alt={movie.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    onClick={() => playMovie(movie)}
                    className="rounded-full w-14 h-14 bg-primary text-white shadow-xl shadow-primary/30 hover:scale-110 transition-transform"
                  >
                    <Play size={24} fill="currentColor" />
                  </Button>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1 text-xs font-bold text-yellow-500">
                  <Star size={12} fill="currentColor" />
                  {movie.rating}
                </div>
              </div>

              {/* Movie Details */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-bold uppercase">
                      {movie.language}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-bold">{movie.year}</span>
                  </div>
                  <h3 className="text-xl font-black tracking-tight mb-2 group-hover:text-primary transition-colors">{movie.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">{movie.overview}</p>
                </div>

                <Button 
                  onClick={() => playMovie(movie)}
                  className="w-full rounded-xl font-bold gap-2 h-11 bg-accent/10 hover:bg-primary hover:text-white text-foreground transition-all"
                >
                  <Play size={16} fill="currentColor" />
                  Watch Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Movies;
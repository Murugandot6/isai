"use client";

import React, { useState, useEffect } from 'react';
import { Movie } from '@/context/MusicContext';
import { Server, RefreshCw, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreamPlayerProps {
  movie: Movie;
}

interface Source {
  name: string;
  url: string;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ movie }) => {
  const [activeSourceIdx, setActiveSourceIdx] = useState(0);
  const [key, setKey] = useState(0);
  const [isTv, setIsTv] = useState(false);
  const [season, setSeason] = useState<number>(1);
  const [episode, setEpisode] = useState<number>(1);

  // Updated multi-source streaming nodes for reliability across all devices
  const sources: Source[] = [
    { name: "RiveStream", url: `https://www.rivestream.app/embed?type=movie&id=${movie.id}` },
    { name: "Vyla Space", url: `https://boysism-vyla.hf.space/embed/movie/${movie.id}` },
    { name: "Vyla", url: `http://player.vyla.cc/?id=${movie.id}` },
    { name: "Nxsha", url: `https://web.nxsha.app/embed/movie/${movie.id}` },
    { name: "VidCore", url: `https://www.vidcore.org/embed/movie/${movie.id}` },
    { name: "CineSrc", url: `https://cinesrc.st/embed/movie/${movie.id}` },
    { name: "VidLux", url: `https://vidlux.xyz/embed/movie/${movie.id}` },
    { name: "ZXCSTREAM", url: `https://zxcstream.xyz/player/movie/${movie.id}` }
  ];

  const tvSources: Source[] = [
    { name: "RiveStream", url: `https://www.rivestream.app/embed?type=tv&id=${movie.id}&season=${1}&episode=${1}` },
    { name: "Vyla Space", url: `https://boys-vyla.vercel.app/tv/${movie.id}` },
    { name: "Vidsrc", url: `https://vidsrc.to/embed/tv/${movie.id}` }
  ];

  // Let's dynamically build the TV series sources if needed, but we can map them cleanly
  const getMovieSources = (): Movie[] => {
    const isTv = currentMovie.genre?.toLowerCase().includes('tv') || false;
    
    if (isTv) {
      return [
        {
          id: currentMovie.id,
          title: currentMovie.title,
          overview: currentMovie.overview,
          backdrop: currentMovie.backdrop,
          poster: currentMovie.poster,
          rating: currentMovie.rating,
          year: currentMovie.year,
          genre: currentMovie.genre,
          language: currentMovie.language,
          streamUrl: `https://multiembed.to/get.php?video_id=${currentMovie.id}&tmdb=1`
        }
      ];
    }
    return [];
  };

  const getActiveStreamUrl = () => {
    if (currentMovie.streamUrl) {
      return currentMovie.streamUrl;
    }

    const isTv = currentMovie.genre?.toLowerCase().includes('tv') || false;
    
    if (searchType === 'movies') {
      if (isTv) {
        return `https://vidsrc.to/embed/tv/${currentMovie.id}/1/1`;
      }
      return `https://vidsrc.to/embed/movie/${currentMovie.id}`;
    } else if (searchType === 'fm') {
      return currentMovie.streamUrl || '';
    }
    
    return `https://vidsrc.to/embed/movie/${currentMovie.id}`;
  };

  const [searchType, setSearchType] = useState<'music' | 'movies' | 'fm'>('movies');

  useEffect(() => {
    if (currentMovie) {
      const isCustom = currentMovie.id.startsWith('custom-');
      const isTv = currentMovie.genre?.toLowerCase().includes('tv');
      setSearchType(isCustom ? 'movies' : (isTv ? 'movies' : 'movies'));
    }
  }, [currentMovie]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none">
      {/* Immersive Background Image */}
      <div className="absolute inset-0 transition-transform duration-1000 ease-out transform scale-100">
        <img 
          src={currentMovie.backdrop} 
          alt={currentMovie.title} 
          className="w-full h-full object-cover object-center opacity-35 lg:opacity-60"
        />
        {/* Complex blended black gradients to smoothly blend standard image to black background */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* HEADER MENU AND CONTROLS BAR */}
      <div className="flex items-center justify-between p-6 md:px-12 z-20 gap-4 bg-transparent relative">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="gap-1.5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl h-9 px-3 text-xs md:text-sm"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>
      </div>

      {/* MAIN SPOTLIGHT BANNER HERO */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-12 relative min-h-[420px] py-12">
        <div className="relative z-10 max-w-xl space-y-4 md:space-y-6 text-left">
          <span className="text-xs md:text-sm font-black uppercase tracking-[0.25em] text-purple-400 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-purple-500 rounded-full" />
            Cinema Station
          </span>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-xl select-text animate-in fade-in duration-500" dangerouslySetInnerHTML={{ __html: currentSong?.name || '' }} />
          
          <div className="space-y-1">
            <p className="text-sm md:text-base text-zinc-300 font-semibold leading-relaxed drop-shadow" dangerouslySetInnerHTML={{ __html: currentSong?.primaryArtists || '' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Radio;
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song } from '@/services/musicApi';
import { Mic2, ArrowLeft, Play, Loader2, Search, Music, ChevronDown } from 'lucide-react';
import { useMusic } from '@/context/MusicContext';
import { SongCard } from '@/components/SongCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getHighResImage } from '@/lib/image-utils';

type ArtistConfig = string | { name: string; id: string };

const CURATED_ARTIST_NAMES: { composers: ArtistConfig[]; maleSingers: ArtistConfig[]; femaleSingers: ArtistConfig[] } = {
  composers: [
    "A. R. Rahman", 
    "Ilaiyaraaja", 
    "Anirudh Ravichander", 
    "Harris Jayaraj", 
    "Yuvan Shankar Raja", 
    "M. S. Viswanathan", 
    "Vidyasagar", 
    "Deva", 
    "G. V. Prakash Kumar", 
    "Santhosh Narayanan"
  ],
  maleSingers: [
    "S. P. Balasubrahmanyam", 
    "K. J. Yesudas", 
    "Sid Sriram", 
    { name: "Hariharan", id: "Z2qyrGA65Yo_" }, 
    "Shankar Mahadevan", 
    "P. Unnikrishnan", 
    "Karthik", 
    "Haricharan", 
    "Pradeep Kumar", 
    "T. M. Soundararajan"
  ],
  femaleSingers: [
    "K. S. Chithra", 
    "S. Janaki", 
    "Shreya Ghoshal", 
    "P. Susheela", 
    "Swarnalatha", 
    "Sujatha Mohan", 
    "Chinmayi Sripada", 
    "Shweta Mohan", 
    "Shakthisree Gopalan", 
    "Dhee"
  ]
};

interface ArtistData {
  id: string;
  name: string;
  image: any;
  role: string;
  popularity?: number;
}

const Artists = () => {
  const { playSong, selectedLanguages } = useMusic();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<ArtistData | null>(null);
  
  const [artistSongs, setArtistSongs] = useState<Song[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const [composers, setComposers] = useState<ArtistData[]>([]);
  const [maleSingers, setMaleSingers] = useState<ArtistData[]>([]);
  const [femaleSingers, setFemaleSingers] = useState<ArtistData[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const fetchArtistsBatch = async () => {
      setLoadingArtists(true);
      
      const fetchGroup = async (configs: ArtistConfig[], role: string) => {
        const uniqueCheck = new Set<string>();
        const results = await Promise.all(
          configs.map(async (config) => {
            try {
              const isObject = typeof config === 'object';
              const name = isObject ? config.name : config;
              const explicitId = isObject ? config.id : undefined;

              // Prevent duplicates when string/object fallback entries overlap
              const lookupKey = explicitId || name;
              if (uniqueCheck.has(lookupKey)) return null;
              uniqueCheck.add(lookupKey);

              let imageObj: any = null;

              // Always attempt to grab a fresh high-res image from name search as standard format
              try {
                const searchRes = await musicApi.searchArtists(name, 0, 1);
                if (searchRes && searchRes[0]) {
                  imageObj = searchRes[0].image;
                }
              } catch (e) {
                console.warn("Name search failed for image fetch:", name, e);
              }

              if (explicitId) {
                // Fetch direct details by ID
                const details = await musicApi.getArtistDetails(explicitId);
                if (details) {
                  return {
                    id: details.id || explicitId,
                    name: details.name || name,
                    image: imageObj || details.image || '',
                    role: role,
                    popularity: Math.floor(Math.random() * 20) + 80
                  };
                }
              }

              // Fallback to name search completely if no ID
              const res = await musicApi.searchArtists(name, 0, 1);
              const artist = res[0];
              if (artist) {
                return {
                  id: artist.id,
                  name: artist.name,
                  image: artist.image,
                  role: role,
                  popularity: Math.floor(Math.random() * 20) + 80
                };
              }
            } catch (e) {}
            return null;
          })
        );
        return results.filter(Boolean) as ArtistData[];
      };

      const [compData, maleData, femData] = await Promise.all([
        fetchGroup(CURATED_ARTIST_NAMES.composers, "Composer"),
        fetchGroup(CURATED_ARTIST_NAMES.maleSingers, "Male Singer"),
        fetchGroup(CURATED_ARTIST_NAMES.femaleSingers, "Female Singer")
      ]);

      setComposers(compData);
      setMaleSingers(maleData);
      setFemaleSingers(femData);
      setLoadingArtists(false);
    };

    fetchArtistsBatch();
  }, []);

  const fetchArtistSongs = useCallback(async (artistId: string, pageNum: number, artistName?: string) => {
    if (pageNum === 0) setLoadingSongs(true);
    
    try {
      const results = await musicApi.getArtistSongs(artistId, pageNum, artistName);
      
      if (!results || results.length === 0) {
        setHasMore(false);
        if (pageNum === 0) setArtistSongs([]);
        return;
      }

      // Filter songs strictly matching selected languages (e.g., 'tamil' in lowercase)
      const filtered = results.filter((song: Song) => {
        if (!song.language) return false;
        const songLang = song.language.toLowerCase().trim();
        return selectedLanguages.includes(songLang);
      });

      setArtistSongs(prev => pageNum === 0 ? filtered : [...prev, ...filtered]);
      
      // Only set hasMore to false if we got fewer results than the limit (50)
      // Assuming the API returns up to 50 songs per page; if less, we assume no more.
      if (results.length < 50) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch artist songs:", error);
    } finally {
      setLoadingSongs(false);
    }
  }, [selectedLanguages]);

  const lastSongElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingSongs) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingSongs, hasMore]);

  useEffect(() => {
    if (selectedArtist && page > 0) {
      fetchArtistSongs(selectedArtist.id, page, selectedArtist.name);
    }
  }, [page, selectedArtist, fetchArtistSongs]);

  const handleArtistClick = (artist: ArtistData) => {
    setSelectedArtist(artist);
    setArtistSongs([]);
    setPage(0);
    setHasMore(true);
    fetchArtistSongs(artist.id, 0, artist.name);
  };

  const filterList = (list: ArtistData[]) => {
    if (!searchQuery.trim()) return list;
    return list.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  if (selectedArtist) {
    const artistImage = getHighResImage(selectedArtist.image);
    
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-tr from-black via-zinc-950 to-neutral-950 text-white p-4 md:p-10 max-w-7xl mx-auto space-y-8">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedArtist(null)}
            className="gap-1.5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl h-9 px-3 text-xs md:text-sm"
          >
            <ArrowLeft size={16} />
            <span>Back to Artists</span>
          </Button>

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shadow-[0_20px_50px_rgba(147,51,234,0.15)] border-4 border-purple-500/20 bg-white/5 shrink-0">
              <img src={artistImage} alt={selectedArtist.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left flex-1 min-w-0">
              <span className="text-[10px] tracking-[0.2em] font-black uppercase text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                {selectedArtist.role}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mt-4 mb-3 leading-tight" dangerouslySetInnerHTML={{ __html: selectedArtist.name }} />
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Button 
                  onClick={() => artistSongs.length > 0 && playSong(artistSongs[0], artistSongs)}
                  disabled={artistSongs.length === 0}
                  className="rounded-full px-8 h-12 font-bold gap-2 shadow-xl shadow-purple-500/20 text-xs md:text-sm bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Play className="w-4 h-4" fill="currentColor" />
                  Play Discography
                </Button>
                <Badge variant="outline" className="border-white/10 text-zinc-300 h-10 px-4">
                  ★ {selectedArtist.popularity}% Popularity
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
              <div className="bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                <Music size={18} className="text-purple-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight">Artist Tracks</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 animate-in fade-in duration-500">
              {artistSongs.map((song, index) => {
                const isLast = index === artistSongs.length - 1;
                return (
                  <div key={`${song.id}-${index}`} ref={isLast ? lastSongElementRef : null}>
                    <SongCard song={song} allSongs={artistSongs} />
                  </div>
                );
              })}
            </div>

            {loadingSongs && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="animate-spin text-purple-500 w-8 h-8" />
              </div>
            )}

            {!hasMore && artistSongs.length > 0 && (
              <p className="text-center text-zinc-500 text-xs py-10">You've reached the end of the discography.</p>
            )}

            {!loadingSongs && artistSongs.length === 0 && (
              <div className="text-center py-20 text-zinc-500">
                No songs found matching your preferred language settings ({selectedLanguages.join(', ')}).
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-tr from-black via-zinc-950 to-neutral-950 text-white p-4 md:p-10 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-2.5 rounded-xl border border-purple-500/30">
              <Mic2 className="text-purple-400 w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight">Music Hall of Fame</h1>
              <p className="text-xs md:text-sm text-zinc-400 font-semibold">Real legends, real portraits, straight from the archives.</p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter legends..." 
              className="pl-9 bg-white/5 border-none h-10 rounded-xl focus-visible:ring-purple-500/20 text-sm text-white"
            />
          </div>
        </div>

        <Tabs defaultValue="composers" className="w-full">
          <TabsList className="bg-white/5 p-1 rounded-2xl mb-8 w-fit flex flex-wrap gap-1">
            <TabsTrigger value="composers" className="rounded-xl px-5 py-2.5 font-bold text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white text-zinc-400">
              Composers
            </TabsTrigger>
            <TabsTrigger value="male" className="rounded-xl px-5 py-2.5 font-bold text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white text-zinc-400">
              Male Singers
            </TabsTrigger>
            <TabsTrigger value="female" className="rounded-xl px-5 py-2.5 font-bold text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white text-zinc-400">
              Female Singers
            </TabsTrigger>
          </TabsList>

          {loadingArtists ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-full bg-white/5 animate-pulse" />
                  <div className="w-20 h-4 bg-white/5 animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="composers" className="animate-in fade-in duration-300">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {filterList(composers).map((artist, idx) => (
                    <ArtistCard key={idx} artist={artist} onClick={() => handleArtistClick(artist)} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="male" className="animate-in fade-in duration-300">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {filterList(maleSingers).map((artist, idx) => (
                    <ArtistCard key={idx} artist={artist} onClick={() => handleArtistClick(artist)} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="female" className="animate-in fade-in duration-300">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {filterList(femaleSingers).map((artist, idx) => (
                    <ArtistCard key={idx} artist={artist} onClick={() => handleArtistClick(artist)} />
                  ))}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
};

const ArtistCard = ({ artist, onClick }: { artist: ArtistData, onClick: () => void }) => {
  const imageUrl = getHighResImage(artist.image);
  return (
    <div 
      onClick={onClick}
      className="group flex flex-col items-center text-center cursor-pointer bg-white/5 border border-white/5 p-4 rounded-3xl hover:border-purple-500/30 hover:bg-purple-500/5 transition-all hover:-translate-y-1"
    >
      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 shadow-xl border-4 border-transparent group-hover:border-purple-500/30 transition-all duration-300 bg-white/5 mx-auto">
        <img src={imageUrl} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>
      <h3 className="font-bold text-xs md:text-sm group-hover:text-purple-400 transition-colors line-clamp-1" dangerouslySetInnerHTML={{ __html: artist.name }}></h3>
      <div className="flex flex-col items-center mt-2 gap-1 w-full">
        <span className="text-[10px] text-zinc-500 font-bold">{artist.role}</span>
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-none text-[8px] font-bold py-0.5 px-2 rounded-full mt-1">
          ★ {artist.popularity}% popularity
        </Badge>
      </div>
    </div>
  );
};

export default Artists;
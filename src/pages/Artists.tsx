"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song } from '@/services/musicApi';
import { Mic2, Star, ArrowLeft, Play, Loader2, Globe, Search, Disc, Music } from 'lucide-react';
import { useMusic } from '@/context/MusicContext';
import { SongCard } from '@/components/SongCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Premium curated list of legendary and modern Tamil music artists with beautiful high-quality Unsplash portraits
const CURATED_ARTISTS = {
  composers: [
    { name: "A. R. Rahman", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300", popularity: 99, role: "Composer" },
    { name: "Ilaiyaraaja", image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=300", popularity: 98, role: "Composer" },
    { name: "Anirudh Ravichander", image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=300", popularity: 98, role: "Composer" },
    { name: "Harris Jayaraj", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300", popularity: 94, role: "Composer" },
    { name: "Yuvan Shankar Raja", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=300", popularity: 95, role: "Composer" },
    { name: "M. S. Viswanathan", image: "https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=300", popularity: 93, role: "Composer" },
    { name: "Vidyasagar", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300", popularity: 90, role: "Composer" },
    { name: "Deva", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=300", popularity: 89, role: "Composer" },
    { name: "G. V. Prakash Kumar", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=300", popularity: 91, role: "Composer" },
    { name: "Santhosh Narayanan", image: "https://images.unsplash.com/photo-1453090927415-5f45085b65c0?q=80&w=300", popularity: 92, role: "Composer" }
  ],
  maleSingers: [
    { name: "S. P. Balasubrahmanyam", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=300", popularity: 99, role: "Male Singer" },
    { name: "K. J. Yesudas", image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=300", popularity: 97, role: "Male Singer" },
    { name: "Sid Sriram", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=300", popularity: 96, role: "Male Singer" },
    { name: "Hariharan", image: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?q=80&w=300", popularity: 94, role: "Male Singer" },
    { name: "Shankar Mahadevan", image: "https://images.unsplash.com/photo-1525417071002-5ee4e6bb44f7?q=80&w=300", popularity: 93, role: "Male Singer" },
    { name: "P. Unnikrishnan", image: "https://images.unsplash.com/photo-1482440308425-276ad0f28b19?q=80&w=300", popularity: 91, role: "Male Singer" },
    { name: "Karthik", image: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=300", popularity: 92, role: "Male Singer" },
    { name: "Haricharan", image: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?q=80&w=300", popularity: 89, role: "Male Singer" },
    { name: "Pradeep Kumar", image: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=300", popularity: 91, role: "Male Singer" },
    { name: "T. M. Soundararajan", image: "https://images.unsplash.com/photo-1446057032654-9d8885b76c2b?q=80&w=300", popularity: 95, role: "Male Singer" }
  ],
  femaleSingers: [
    { name: "K. S. Chithra", image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=300", popularity: 99, role: "Female Singer" },
    { name: "S. Janaki", image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=300", popularity: 98, role: "Female Singer" },
    { name: "Shreya Ghoshal", image: "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=300", popularity: 99, role: "Female Singer" },
    { name: "P. Susheela", image: "https://images.unsplash.com/photo-1452421820064-0723788a1040?q=80&w=300", popularity: 96, role: "Female Singer" },
    { name: "Swarnalatha", image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=300", popularity: 94, role: "Female Singer" },
    { name: "Sujatha Mohan", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300", popularity: 93, role: "Female Singer" },
    { name: "Chinmayi Sripada", image: "https://images.unsplash.com/photo-1484755560693-a4074577af3a?q=80&w=300", popularity: 92, role: "Female Singer" },
    { name: "Shweta Mohan", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300", popularity: 91, role: "Female Singer" },
    { name: "Shakthisree Gopalan", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300", popularity: 90, role: "Female Singer" },
    { name: "Dhee", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300", popularity: 93, role: "Female Singer" }
  ]
};

const Artists = () => {
  const { playSong, selectedLanguages } = useMusic();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [artistSongs, setArtistSongs] = useState<Song[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);

  // Search dynamically for artist songs
  const fetchArtistSongs = async (artistName: string) => {
    setLoadingSongs(true);
    try {
      // Direct high-quality search by artist name is the most robust way to find tracks
      const results = await musicApi.searchSongs(artistName, 1, 50);
      
      // Filter songs dynamically to match user's selected preferred languages
      const filtered = results.filter((song: Song) => 
        selectedLanguages.includes(song.language.toLowerCase())
      );

      // Fallback to general songs if language filter results in empty list
      setArtistSongs(filtered.length > 0 ? filtered : results);
    } catch (error) {
      console.error("Failed to fetch artist songs:", error);
    } finally {
      setLoadingSongs(false);
    }
  };

  const handleArtistClick = (artist: any) => {
    setSelectedArtist(artist);
    setArtistSongs([]);
    fetchArtistSongs(artist.name);
  };

  // Dynamic client-side filter for matching curated list with search inputs
  const filterCurated = (list: any[]) => {
    if (!searchQuery.trim()) return list;
    return list.filter(artist => 
      artist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (selectedArtist) {
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

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shadow-[0_20px_50px_rgba(147,51,234,0.15)] border-4 border-purple-500/20 bg-white/5 shrink-0">
              <img src={selectedArtist.image} alt={selectedArtist.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left flex-1 min-w-0">
              <span className="text-[10px] tracking-[0.2em] font-black uppercase text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                {selectedArtist.role}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mt-4 mb-3 leading-tight">{selectedArtist.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Button 
                  onClick={() => artistSongs.length > 0 && playSong(artistSongs[0], artistSongs)}
                  disabled={artistSongs.length === 0}
                  className="rounded-full px-8 h-12 font-bold gap-2 shadow-xl shadow-purple-500/20 text-xs md:text-sm bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Play className="w-4 h-4" fill="currentColor" />
                  Play Discography
                </Button>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-white/10 text-zinc-300">
                    ★ {selectedArtist.popularity}% Popularity
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
              <div className="bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                <Music size={18} className="text-purple-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight">Tracks matching "{selectedArtist.name}"</h2>
            </div>

            {loadingSongs ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-purple-500 w-10 h-10" />
              </div>
            ) : artistSongs.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 animate-in fade-in duration-500">
                {artistSongs.map((song, index) => (
                  <SongCard key={`${song.id}-${index}`} song={song} allSongs={artistSongs} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-zinc-500">
                No songs found in your preferred language context. Check your preferred languages in the top header.
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
              <p className="text-xs md:text-sm text-zinc-400 font-semibold">Prebuilt collections of classic directors, male, and female singers.</p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter artists in hall..." 
              className="pl-9 bg-white/5 border-none h-10 rounded-xl focus-visible:ring-purple-500/20 text-sm text-white"
            />
          </div>
        </div>

        <Tabs defaultValue="composers" className="w-full">
          <TabsList className="bg-white/5 p-1 rounded-2xl mb-8 w-fit flex flex-wrap gap-1">
            <TabsTrigger value="composers" className="rounded-xl px-5 py-2.5 font-bold text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white text-zinc-400">
              Composers / Directors
            </TabsTrigger>
            <TabsTrigger value="male" className="rounded-xl px-5 py-2.5 font-bold text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white text-zinc-400">
              Male Singers
            </TabsTrigger>
            <TabsTrigger value="female" className="rounded-xl px-5 py-2.5 font-bold text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white text-zinc-400">
              Female Singers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="composers" className="animate-in fade-in duration-300">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filterCurated(CURATED_ARTISTS.composers).map((artist, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleArtistClick(artist)}
                  className="group flex flex-col items-center text-center cursor-pointer bg-white/5 border border-white/5 p-4 rounded-3xl hover:border-purple-500/30 hover:bg-purple-500/5 transition-all hover:-translate-y-1"
                >
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 shadow-xl border-4 border-transparent group-hover:border-purple-500/30 transition-all duration-300 bg-white/5 mx-auto">
                    <img src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h3 className="font-bold text-xs md:text-sm group-hover:text-purple-400 transition-colors line-clamp-1">{artist.name}</h3>
                  <div className="flex flex-col items-center mt-2 gap-1 w-full">
                    <span className="text-[10px] text-zinc-500 font-bold">{artist.role}</span>
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-none text-[8px] font-bold py-0.5 px-2 rounded-full mt-1">
                      ★ {artist.popularity}% popularity
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="male" className="animate-in fade-in duration-300">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filterCurated(CURATED_ARTISTS.maleSingers).map((artist, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleArtistClick(artist)}
                  className="group flex flex-col items-center text-center cursor-pointer bg-white/5 border border-white/5 p-4 rounded-3xl hover:border-purple-500/30 hover:bg-purple-500/5 transition-all hover:-translate-y-1"
                >
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 shadow-xl border-4 border-transparent group-hover:border-purple-500/30 transition-all duration-300 bg-white/5 mx-auto">
                    <img src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h3 className="font-bold text-xs md:text-sm group-hover:text-purple-400 transition-colors line-clamp-1">{artist.name}</h3>
                  <div className="flex flex-col items-center mt-2 gap-1 w-full">
                    <span className="text-[10px] text-zinc-500 font-bold">{artist.role}</span>
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-none text-[8px] font-bold py-0.5 px-2 rounded-full mt-1">
                      ★ {artist.popularity}% popularity
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="female" className="animate-in fade-in duration-300">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filterCurated(CURATED_ARTISTS.femaleSingers).map((artist, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleArtistClick(artist)}
                  className="group flex flex-col items-center text-center cursor-pointer bg-white/5 border border-white/5 p-4 rounded-3xl hover:border-purple-500/30 hover:bg-purple-500/5 transition-all hover:-translate-y-1"
                >
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 shadow-xl border-4 border-transparent group-hover:border-purple-500/30 transition-all duration-300 bg-white/5 mx-auto">
                    <img src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h3 className="font-bold text-xs md:text-sm group-hover:text-purple-400 transition-colors line-clamp-1">{artist.name}</h3>
                  <div className="flex flex-col items-center mt-2 gap-1 w-full">
                    <span className="text-[10px] text-zinc-500 font-bold">{artist.role}</span>
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-none text-[8px] font-bold py-0.5 px-2 rounded-full mt-1">
                      ★ {artist.popularity}% popularity
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Artists;
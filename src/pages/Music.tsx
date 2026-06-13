"use client";

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { musicApi, Song, Playlist, Album } from '@/services/musicApi';
import { SongCard } from '@/components/SongCard';
import { AlbumCard } from '@/components/AlbumCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Flame, Music as MusicIcon, Sparkles, Play, Disc, Calendar, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '@/context/MusicContext';
import { getHighResImage } from '@/lib/image-utils';
import { TRENDING_TODAY_DATA } from '@/data/trendingToday';
import { toast } from 'sonner';

const DECADE_PLAYLISTS_CONFIG = [
  { id: "1170578779", title: "Tamil 1990s" },
  { id: "1170578783", title: "Tamil 2000s" },
  { id: "901538755", title: "Tamil 1980s" },
  { id: "1170578788", title: "Tamil 2010s" },
  { id: "1074590003", title: "Tamil BGM" },
  { id: "1133105280", title: "Tamil Hit Songs" },
  { id: "804092154", title: "Sad Love - Tamil" },
  { id: "901538752", title: "Tamil 1960s" },
  { id: "901538753", title: "Tamil 1970s" },
  { id: "1134651042", title: "Tamil: India Superhits Top 50" }
];

const MusicPage = () => {
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [decadePlaylists, setDecadePlaylists] = useState<Playlist[]>([]);
  const [curatedPlaylists, setCuratedPlaylists] = useState<Playlist[]>([]);
  
  // Year-wise Latest Releases States
  const [releases2026, setReleases2026] = useState<Album[]>([]);
  const [releases2025, setReleases2025] = useState<Album[]>([]);
  const [releases2024, setReleases2024] = useState<Album[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { playSong, selectedLanguages, isShuffle, toggleShuffle } = useMusic();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const primaryLang = selectedLanguages[0] || 'tamil';
        
        // Fetch trending songs for all selected languages
        const trendingPromises = selectedLanguages.map(lang => 
          musicApi.getTrending(lang).catch(() => [] as Song[])
        );
        const trendingResults = await Promise.all(trendingPromises);
        const combinedTrending = trendingResults.flat();
        setTrendingSongs(combinedTrending);

        // Fetch decade playlists safely
        const decadesData = await Promise.all(
          DECADE_PLAYLISTS_CONFIG.map(config => 
            musicApi.getPlaylistDetails(config.id).catch((err) => {
              console.error(`Failed to fetch decade playlist ${config.id}:`, err);
              return null;
            })
          )
        );
        setDecadePlaylists(decadesData.filter(p => p !== null) as Playlist[]);
        
        // Fetch curated playlists dynamically based on selected languages
        const activeLangs = selectedLanguages.length > 0 ? selectedLanguages : ['tamil'];
        const limitPerLang = Math.max(4, Math.floor(12 / activeLangs.length));
        const curatedPromises = activeLangs.map(lang => 
          musicApi.searchPlaylists(`top ${lang}`, 0, limitPerLang).catch(() => [] as Playlist[])
        );
        const curatedResults = await Promise.all(curatedPromises);
        const combinedCurated: Playlist[] = [];
        const maxCuratedLength = Math.max(...curatedResults.map(r => r.length));
        for (let i = 0; i < maxCuratedLength; i++) {
          for (let j = 0; j < curatedResults.length; j++) {
            if (curatedResults[j][i]) {
              combinedCurated.push(curatedResults[j][i]);
            }
          }
        }
        setCuratedPlaylists(combinedCurated.slice(0, 12));

        // Fetch year-wise releases safely
        const r2026 = await musicApi.searchAlbums(`${primaryLang} 2026`).catch(() => []);
        const r2025 = await musicApi.searchAlbums(`${primaryLang} 2025`).catch(() => []);
        const r2024 = await musicApi.searchAlbums(`${primaryLang} 2024`).catch(() => []);
        
        setReleases2026((r2026 || []).slice(0, 10));
        setReleases2025((r2025 || []).slice(0, 10));
        setReleases2024((r2024 || []).slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch content', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedLanguages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}&type=music`);
    }
  };

  const handlePlayTrendingItem = async (item: typeof TRENDING_TODAY_DATA[0]) => {
    if (item.type === 'song') {
      const songObj: Song = {
        id: item.id,
        name: item.title,
        type: 'song',
        album: { id: item.more_info.album_id || '', name: item.more_info.album || '', url: '' },
        year: item.year,
        releaseDate: item.more_info.release_date || '',
        duration: item.more_info.duration || '0',
        label: '',
        primaryArtists: item.subtitle,
        featuredArtists: '',
        singers: item.subtitle,
        image: [{ quality: '500x500', url: item.image }],
        downloadUrl: [],
        language: item.language,
        url: ''
      };
      playSong(songObj);
    } else {
      navigate(`/album/${item.id}`);
    }
  };

  const handleListenNow = () => {
    if (trendingSongs.length > 0) {
      const randomIndex = Math.floor(Math.random() * trendingSongs.length);
      const randomSong = trendingSongs[randomIndex];
      playSong(randomSong, trendingSongs);
      if (!isShuffle) {
        toggleShuffle();
      }
      toast.success(`Playing random song in your preferred languages!`);
    } else {
      toast.error("No songs available for your selected languages.");
    }
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 p-2.5 rounded-2xl">
              <MusicIcon className="text-green-500" size={24} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Music Station</h1>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">Explore standard collections, hit playlists, and decades.</p>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search songs or albums..." 
              className="pl-9 bg-accent/5 border-none focus-visible:ring-primary/20 rounded-xl h-10 text-sm"
            />
          </form>
        </div>

        {/* Cinematic Music Banner */}
        <div 
          className="relative h-[240px] sm:h-[320px] rounded-3xl overflow-hidden group cursor-pointer shadow-2xl transition-all duration-500 hover:shadow-green-500/5"
          onClick={handleListenNow}
        >
          <img 
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1500&auto=format&fit=crop" 
            alt="Spotify Music Player" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent flex flex-col justify-end p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-green-500 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full">
                Personal Radio
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white mb-2 tracking-tighter">Listen Now: Play Random Mixed Stream</h2>
            <p className="text-white/75 max-w-lg text-xs leading-relaxed mb-4 line-clamp-2">
              Shuffle play standard top-rated tracks customized for your selected preferred language filters ({selectedLanguages.join(', ')}).
            </p>
            <button className="bg-green-500 text-white px-5 py-2.5 rounded-full font-bold text-xs hover:scale-105 transition-all w-fit shadow-xl shadow-green-500/20 flex items-center gap-1.5">
              <Play size={12} fill="currentColor" />
              Start Listening
            </button>
          </div>
        </div>

        {/* Trending Today Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Flame className="text-green-500" size={20} />
            <h3 className="text-xl md:text-2xl font-black tracking-tight">Trending Today</h3>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
            {TRENDING_TODAY_DATA.map((item) => (
              <div 
                key={item.id}
                onClick={() => handlePlayTrendingItem(item)}
                className="group relative w-[160px] md:w-[180px] shrink-0 bg-card/50 hover:bg-accent/10 p-3 rounded-2xl transition-all duration-300 cursor-pointer border border-transparent hover:border-accent/20 hover:-translate-y-1"
              >
                <div className="relative aspect-square mb-3 overflow-hidden rounded-xl bg-accent/10 shadow-lg">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-[9px] font-bold uppercase border-none text-white py-0.5">
                      {item.type}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-green-500 text-white p-3 rounded-full shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <Play size={20} fill="currentColor" />
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold text-xs md:text-sm truncate mb-0.5" dangerouslySetInnerHTML={{ __html: item.title }}></h4>
                <p className="text-[10px] md:text-xs text-muted-foreground truncate" dangerouslySetInnerHTML={{ __html: item.subtitle }}></p>
              </div>
            ))}
          </div>
        </section>

        {/* Curated featured playlists */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="text-green-500" size={20} />
              <h3 className="text-xl md:text-2xl font-black tracking-tight">Curated Playlists</h3>
            </div>
            <button onClick={() => navigate('/featured')} className="text-xs font-bold text-green-500 hover:underline">See All</button>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="w-[200px] md:w-[240px] shrink-0 aspect-square rounded-3xl" />
              ))
            ) : curatedPlaylists.length > 0 ? (
              curatedPlaylists.map((playlist, index) => {
                const songCount = playlist.songCount || "0";
                return (
                  <div 
                    key={`${playlist.id}-${index}`}
                    onClick={() => navigate(`/playlist/${playlist.id}`)}
                    className="group relative w-[200px] md:w-[240px] shrink-0 aspect-square rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer shadow-lg transition-all hover:-translate-y-1"
                  >
                    <img 
                      src={getHighResImage(playlist.image)} 
                      alt={playlist.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 md:p-6 flex flex-col justify-end">
                      <h4 className="text-white font-black text-sm md:text-base mb-1 truncate" dangerouslySetInnerHTML={{ __html: playlist.name }}></h4>
                      <div className="flex items-center gap-1.5 text-white/60 text-[10px] font-bold uppercase tracking-wider">
                        <MusicIcon size={10} />
                        <span>{songCount} Tracks</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-muted-foreground italic py-4">No curated playlists found.</div>
            )}
          </div>
        </section>

        {/* Latest Releases */}
        <section className="space-y-8">
          {/* 2026 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 text-white font-bold text-xs px-2.5 py-0.5 rounded-md">2026</Badge>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Newest Hits</span>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-[180px] shrink-0 space-y-3">
                    <Skeleton className="aspect-square w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))
              ) : releases2026.length > 0 ? (
                releases2026.map((album) => (
                  <div key={album.id} className="w-[180px] shrink-0">
                    <AlbumCard album={album} />
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No releases found.</p>
              )}
            </div>
          </div>

          {/* 2025 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-accent/20 text-foreground font-bold text-xs px-2.5 py-0.5 rounded-md">2025</Badge>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Chartbusters</span>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-[180px] shrink-0 space-y-3">
                    <Skeleton className="aspect-square w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))
              ) : releases2025.length > 0 ? (
                releases2025.map((album) => (
                  <div key={album.id} className="w-[180px] shrink-0">
                    <AlbumCard album={album} />
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No releases found.</p>
              )}
            </div>
          </div>
        </section>

        {/* Decades Grid */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Calendar className="text-green-500" size={20} />
            <h3 className="text-xl md:text-2xl font-black tracking-tight">Decades</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 md:h-32 w-full rounded-2xl" />
              ))
            ) : (
              decadePlaylists.map((playlist) => {
                const config = DECADE_PLAYLISTS_CONFIG.find(c => c.id === playlist.id);
                const title = config ? config.title : playlist.name;
                return (
                  <div 
                    key={playlist.id}
                    onClick={() => navigate(`/playlist/${playlist.id}`)}
                    className="group relative h-24 md:h-32 rounded-2xl overflow-hidden cursor-pointer shadow-md transition-all hover:scale-105"
                  >
                    <img 
                      src={getHighResImage(playlist.image)} 
                      alt={title} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-3 text-center">
                      <h4 className="text-white font-black text-xs md:text-sm uppercase tracking-widest" dangerouslySetInnerHTML={{ __html: title }}></h4>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default MusicPage;
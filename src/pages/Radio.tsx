"use client";

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { radioApi, RadioStation } from '@/services/radioApi';
import { Radio as RadioIcon, Play, Pause, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMusic } from '@/context/MusicContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const Radio = () => {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { playSong, currentSong, isPlaying, selectedLanguages } = useMusic();

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        // Use the primary selected language for Radio search
        const primaryLang = selectedLanguages[0] || 'english';
        const data = await radioApi.getStations(primaryLang);
        setStations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch stations', error);
        setStations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, [selectedLanguages]);

  const handlePlayStation = (station: RadioStation) => {
    const songData: any = {
      id: station.stationuuid,
      name: station.name,
      primaryArtists: station.tags || 'Live FM',
      image: [{ link: station.favicon || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=200' }],
      downloadUrl: [{ link: station.url_resolved }],
      language: station.language
    };
    playSong(songData);
  };

  const filteredStations = stations.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/20 p-2 rounded-xl">
                <RadioIcon className="text-primary" size={24} />
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">LIVE FM</Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tight">World Radio</h1>
            <p className="text-muted-foreground font-medium">Broadcasts from: <span className="text-primary font-bold uppercase">{selectedLanguages.join(', ')}</span></p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stations..." 
                className="pl-9 bg-accent/5 border-none h-11 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))
          ) : filteredStations.length > 0 ? (
            filteredStations.map((station) => {
              const isActive = currentSong?.id === station.stationuuid;
              return (
                <div 
                  key={station.stationuuid}
                  onClick={() => handlePlayStation(station)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer group",
                    isActive 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-card/50 border-transparent hover:border-accent/20 hover:bg-accent/5"
                  )}
                >
                  <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-xl bg-accent/10">
                    <img 
                      src={station.favicon || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=200'} 
                      alt={station.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=200' }}
                    />
                    <div className={cn(
                      "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                      {isActive && isPlaying ? <Pause size={18} fill="currentColor" className="text-white" /> : <Play size={18} fill="currentColor" className="text-white" />}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm truncate">{station.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-accent/10 text-[8px] font-bold px-1.5 py-0">
                        {station.votes.toLocaleString()} VOTES
                      </Badge>
                      <span className="text-[10px] text-muted-foreground truncate">{station.country}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20 text-muted-foreground">
              No stations found for your selected languages.
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Radio;
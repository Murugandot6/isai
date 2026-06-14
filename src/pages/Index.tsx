"use client";

import React, { useMemo } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import { Music, Film, Radio, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const navigate = useNavigate();

  // Generate a random seed to ensure a different image on every load
  const bgImage = useMemo(() => {
    const seed = Math.floor(Math.random() * 10000);
    return `https://loremflickr.com/1920/1080/nature?lock=${seed}`;
  }, []);

  const hubs = [
    {
      id: 'music',
      title: 'Music Station',
      description: 'Explore the full premium Spotify-like dashboard. High-fidelity streams, horizontal albums, custom playlists, and regional chartbusters.',
      icon: Music,
      path: '/music',
      color: 'from-green-500/20 to-emerald-500/5',
      borderColor: 'group-hover:border-green-500/50',
      badge: 'Spotify Web Player',
      accent: 'text-green-400 bg-green-500/10'
    },
    {
      id: 'movies',
      title: 'anbae Cinema',
      description: 'Cinema streaming on demand. Highly stylized server switcher, synchronized listen-together watch party rooms, and cinematic poster layouts.',
      icon: Film,
      path: '/movies',
      color: 'from-purple-500/20 to-indigo-500/5',
      borderColor: 'group-hover:border-purple-500/50',
      badge: 'Vyla Cinematic',
      accent: 'text-purple-400 bg-purple-500/10'
    },
    {
      id: 'radio',
      title: 'World Radio',
      description: 'Global Live FM broadcasts sorted by votes and popularity. Dynamic search and favoriting, streaming direct on any device.',
      icon: Radio,
      path: '/radio',
      color: 'from-orange-500/20 to-amber-500/5',
      borderColor: 'group-hover:border-orange-500/50',
      badge: 'Live FM',
      accent: 'text-orange-400 bg-orange-500/10'
    }
  ];

  return (
    <MainLayout>
      <div className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20 md:pt-24">
        {/* Dynamic Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={bgImage} 
            alt="Background" 
            className="w-full h-full object-cover transition-opacity duration-1000"
          />
          {/* Cinematic Overlays for readability */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="relative z-10 p-4 md:p-10 max-w-6xl mx-auto w-full">
          {/* Welcome Section */}
          <div className="text-center mb-10 md:mb-16 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <Badge variant="outline" className="border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-primary/5 rounded-full backdrop-blur-md">
              Welcome to your entertainment center
            </Badge>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none text-white drop-shadow-2xl">
              What are we experiencing <span className="text-primary italic">today</span>?
            </h1>
            <p className="text-zinc-200 text-xs md:text-sm max-w-xl mx-auto font-medium drop-shadow-md">
              Please select one of the dedicated, highly stylized stations below. Music, cinema, and radio have been split into individual custom interfaces.
            </p>
          </div>

          {/* Dynamic Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {hubs.map((hub) => (
              <div
                key={hub.id}
                onClick={() => navigate(hub.path)}
                className={`group relative flex flex-col justify-between p-6 md:p-8 rounded-[2.5rem] bg-black/40 backdrop-blur-xl border border-white/10 cursor-pointer shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-primary/20 ${hub.borderColor}`}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3.5 rounded-2xl ${hub.accent} shadow-inner`}>
                      <hub.icon size={28} />
                    </div>
                    <Badge variant="secondary" className="bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5">
                      {hub.badge}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors flex items-center gap-2">
                      {hub.title}
                      <Sparkles size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </h3>
                    <p className="text-zinc-300 text-xs leading-relaxed font-medium">
                      {hub.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-primary transition-colors">
                    Open Station
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110 duration-300 shadow-lg">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Global social sync notification */}
          <div className="mt-12 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center gap-2 text-center max-w-xl mx-auto animate-in fade-in duration-1000">
            <Badge variant="outline" className="border-green-500/20 text-green-500 text-[8px] font-black uppercase tracking-widest bg-green-500/5 animate-pulse">
              Active
            </Badge>
            <span className="text-[10px] md:text-xs text-zinc-300 font-semibold">
              Social Sync broadcast system is fully active on all platforms.
            </span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
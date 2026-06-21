"use client";

import React, { useMemo } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import { Music, Film, Radio, ArrowRight } from 'lucide-react';

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
      title: 'Music',
      icon: Music,
      path: '/music',
      borderColor: 'group-hover:border-green-500/30',
      accent: 'text-green-400 bg-green-500/10 group-hover:bg-green-500/20 group-hover:scale-110'
    },
    {
      id: 'movies',
      title: 'Cinema',
      icon: Film,
      path: '/movies',
      borderColor: 'group-hover:border-purple-500/30',
      accent: 'text-purple-400 bg-purple-500/10 group-hover:bg-purple-500/20 group-hover:scale-110'
    },
    {
      id: 'radio',
      title: 'World Radio',
      icon: Radio,
      path: '/radio',
      borderColor: 'group-hover:border-orange-500/30',
      accent: 'text-orange-400 bg-orange-500/10 group-hover:bg-orange-500/20 group-hover:scale-110'
    }
  ];

  return (
    <MainLayout>
      <div className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-12 md:pt-16">
        {/* Dynamic Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={bgImage} 
            alt="Background" 
            className="w-full h-full object-cover transition-opacity duration-1000"
          />
          {/* Cinematic Overlays for readability */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[6px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="relative z-10 p-6 md:p-12 max-w-5xl mx-auto w-full space-y-12">
          {/* Minimalistic Welcome Section */}
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none text-white">
              What are we experiencing <span className="text-primary italic">today</span>?
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto font-medium">
              Choose your entertainment station. Clean, ad-blocked, and synchronized.
            </p>
          </div>

          {/* Vertical Minimalist Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {hubs.map((hub) => (
              <div
                key={hub.id}
                onClick={() => navigate(hub.path)}
                className={`group relative flex flex-col items-center justify-center p-8 rounded-3xl bg-white/[0.02] backdrop-blur-2xl border border-white/5 cursor-pointer text-center transition-all duration-300 hover:bg-white/[0.05] hover:-translate-y-1.5 ${hub.borderColor}`}
              >
                {/* Large circular/rounded icon wrapper */}
                <div className={`p-5 rounded-2xl mb-4 transition-all duration-300 ${hub.accent}`}>
                  <hub.icon size={32} />
                </div>
                
                <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors mb-4">
                  {hub.title}
                </h3>

                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>

          {/* Minimal Social Sync broadcast system footer */}
          <div className="flex items-center justify-center gap-2 max-w-xs mx-auto p-2.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-md animate-in fade-in duration-1000">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
            <span className="text-[10px] text-zinc-400 font-semibold tracking-wide uppercase">
              Social Sync broadcast is active
            </span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
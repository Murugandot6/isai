"use client";

import React from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import { Music, Film, Radio, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const navigate = useNavigate();

  const hubs = [
    {
      id: 'music',
      title: 'Music',
      subtitle: 'Premium Audio Station',
      icon: Music,
      path: '/music',
      accent: 'bg-green-500/15',
      accentText: 'text-green-400',
      accentHover: 'group-hover:text-green-300',
      description: 'Stream millions of tracks with zero interruptions.'
    },
    {
      id: 'movies',
      title: 'Cinema',
      subtitle: 'On-demand Streaming',
      icon: Film,
      path: '/movies',
      accent: 'bg-purple-500/15',
      accentText: 'text-purple-400',
      accentHover: 'group-hover:text-purple-300',
      description: 'Synchronized cinema experience for you and friends.'
    },
    {
      id: 'radio',
      title: 'World Radio',
      subtitle: 'Global FM Broadcasts',
      icon: Radio,
      path: '/radio',
      accent: 'bg-orange-500/15',
      accentText: 'text-orange-400',
      accentHover: 'group-hover:text-orange-300',
      description: 'Live terrestrial radio from across the planet.'
    }
  ];

  return (
    <MainLayout>
      <div className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-black py-20 px-6">
        {/* Background Visuals */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h:[40%] bg-green-600/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full space-y-16">
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-2">
              <Sparkles size={14} className="text-purple-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Premium Portal v2.0</span>
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white uppercase">
              EXPERIENCE <span className="text-zinc-600 italic">LIMITLESS</span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto font-bold uppercase tracking-widest leading-relaxed">
              Choose your entertainment node. Clean, ad-blocked, and fully synchronized.
            </p>
          </div>

          {/* Vertical Stack */}
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {hubs.map((hub) => {
              const Icon = hub.icon;
              
              return (
                <a
                  key={hub.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(hub.path);
                  }}
                  className="group relative flex items-center gap-6 p-6 bg-zinc-900/40 border border-white/5 
                    border-l-0 rounded-xl transition-all duration-500 hover:bg-zinc-900/60 hover:-translate-y-1 
                    hover:border-white/10"
                  style={{
                    borderLeftColor: 'transparent',
                    borderLeftWidth: '3px'
                  } as React.CSSProperties}
                >
                  {/* Accent Left Border */}
                  <div 
                    className={cn(
                      "absolute inset-y-0 left-0 w-1.5 rounded-xl transition-colors duration-300",
                      hub.accent.includes('green') ? 'bg-green-400' : 
                      hub.accent.includes('purple') ? 'bg-purple-400' : 
                      'bg-orange-400'
                    )}
                  />

                  {/* Icon */}
                  <div 
                    className={cn(
                      "flex-shrink-0 w-11.5 h-11.5 rounded-full flex items-center justify-center",
                      hub.accent,
                      "border border-white/10 transition-all duration-500"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", hub.accentText, hub.accentHover)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1">
                      {hub.title}
                    </h2>
                    <span className={cn("block text-[10px] font-black uppercase tracking-[0.09em] mb-2", hub.accentText, hub.accentHover)}>
                      {hub.subtitle}
                    </span>
                    <p className="text-sm text-zinc-500 font-bold leading-relaxed uppercase tracking-wider">
                      {hub.description}
                    </p>
                  </div>

                  {/* Launch */}
                  <div className={cn(
                    "flex-shrink-0 flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.12em]",
                    "text-zinc-400 transition-colors duration-300",
                    hub.accentText, hub.accentHover
                  )}>
                    Launch
                    <ArrowRight 
                      size={14} 
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
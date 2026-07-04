"use client";

import React, { useMemo } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import { Music, Film, Radio, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const navigate = useNavigate();

  const hubs = [
    {
      id: 'music',
      title: 'Music',
      subtitle: 'Premium Audio Station',
      icon: Music,
      path: '/music',
      color: 'from-green-600/20 to-emerald-900/10',
      accent: 'text-green-400 group-hover:text-green-300',
      description: 'Stream millions of tracks with zero interruptions.'
    },
    {
      id: 'movies',
      title: 'Cinema',
      subtitle: 'On-demand Streaming',
      icon: Film,
      path: '/movies',
      color: 'from-purple-600/20 to-indigo-900/10',
      accent: 'text-purple-400 group-hover:text-purple-300',
      description: 'Synchronized cinema experience for you and friends.'
    },
    {
      id: 'radio',
      title: 'World Radio',
      subtitle: 'Global FM Broadcasts',
      icon: Radio,
      path: '/radio',
      color: 'from-orange-600/20 to-red-900/10',
      accent: 'text-orange-400 group-hover:text-orange-300',
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {hubs.map((hub) => (
              <div
                key={hub.id}
                onClick={() => navigate(hub.path)}
                className="group relative flex flex-col p-4 aspect-[4/5] rounded-[1.25rem] bg-zinc-900/40 border border-white/5 cursor-pointer transition-all duration-500 hover:bg-zinc-900/60 hover:-translate-y-2 hover:border-white/10 overflow-hidden shadow-2xl"
              >
                {/* Decorative background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${hub.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                
                <div className="relative z-10 space-y-3">
                  <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 ${hub.accent} transition-all duration-500 group-hover:scale-110 group-hover:bg-white/10`}>
                    <hub.icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{hub.title}</h3>
                    <p className={`text-[8px] font-black uppercase tracking-widest ${hub.accent} mt-0.5`}>{hub.subtitle}</p>
                  </div>
                </div>

                <div className="relative z-10">
                  <p className="text-[8px] text-zinc-500 font-bold leading-relaxed uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
                    {hub.description}
                  </p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest group-hover:text-white/40 transition-colors">Launch</span>
                    <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2.5 group-hover:translate-x-0 transition-all duration-500 shadow-xl">
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
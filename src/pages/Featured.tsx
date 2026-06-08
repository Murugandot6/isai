"use client";

import React from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FEATURED_PLAYLISTS } from '@/data/featuredPlaylists';

const Featured = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12">
          <div className="bg-primary/20 p-2.5 md:p-3 rounded-2xl">
            <Sparkles className="text-primary w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Featured Playlists</h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Explore the best of Tamil music collections.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {FEATURED_PLAYLISTS.map((playlist) => {
            const songCount = playlist.more_info?.song_count || "0";
            return (
              <div 
                key={playlist.id}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
                className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer shadow-xl transition-all hover:-translate-y-2"
              >
                <img 
                  src={playlist.image} 
                  alt={playlist.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 md:p-8 flex flex-col justify-end">
                  <h3 className="text-white font-black text-xl md:text-2xl mb-1 md:mb-2 leading-tight" dangerouslySetInnerHTML={{ __html: playlist.title }}></h3>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{songCount} Tracks</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default Featured;
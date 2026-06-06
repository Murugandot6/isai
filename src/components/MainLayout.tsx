"use client";

import React from 'react';
import { Sidebar } from './Sidebar';
import { MusicPlayer } from './MusicPlayer';
import { ListenTogether } from './ListenTogether';
import { LanguageSelector } from './LanguageSelector';
import { MobileNav } from './MobileNav';
import { Music } from 'lucide-react';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Header */}
        <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="bg-primary p-1.5 rounded-lg">
              <Music className="text-primary-foreground" size={18} />
            </div>
            <span className="text-lg font-black tracking-tight italic">isai</span>
          </div>
          <div className="hidden lg:block" /> 
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <ListenTogether />
          </div>
        </header>

        <main className="flex-1 relative pb-40 md:pb-32">
          {children}
        </main>
      </div>
      <MusicPlayer />
      <MobileNav />
    </div>
  );
};
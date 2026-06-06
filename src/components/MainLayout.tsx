"use client";

import React from 'react';
import { Sidebar } from './Sidebar';
import { MusicPlayer } from './MusicPlayer';
import { MusicProvider } from '@/context/MusicContext';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MusicProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 relative pb-32">
          {children}
        </main>
        <MusicPlayer />
      </div>
    </MusicProvider>
  );
};
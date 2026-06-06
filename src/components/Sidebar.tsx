"use client";

import React from 'react';
import { Home, Search, Library, Music, Heart, Mic2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Library, label: 'Library', path: '/library' },
];

const secondaryItems = [
  { icon: Music, label: 'Songs', path: '/songs' },
  { icon: Mic2, label: 'Artists', path: '/artists' },
  { icon: Heart, label: 'Liked', path: '/liked' },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="hidden lg:flex flex-col w-64 border-r border-border h-screen sticky top-0 bg-card/20 backdrop-blur-sm p-6">
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="bg-primary p-2 rounded-xl">
          <Music className="text-primary-foreground" size={24} />
        </div>
        <span className="text-xl font-black tracking-tight italic">SONIC</span>
      </div>

      <nav className="space-y-1 mb-8">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-3">Menu</p>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              location.pathname === item.path 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
            )}
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>

      <nav className="space-y-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-3">Your Space</p>
        {secondaryItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent/10 hover:text-foreground transition-all duration-200"
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto bg-gradient-to-br from-primary/10 to-transparent p-4 rounded-2xl border border-primary/10">
        <p className="text-xs font-bold mb-1">Upgrade to Pro</p>
        <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">Unlock high-quality audio and offline listening.</p>
        <button className="w-full bg-primary text-primary-foreground text-[10px] font-bold py-2 rounded-lg hover:opacity-90">GO PREMIUM</button>
      </div>
    </div>
  );
};
"use client";

import React from 'react';
import { Home, Search, Library, Music, Heart, Mic2, Radio, LogIn, LogOut, Sparkles, Film } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { icon: Home, label: 'Home Hub', path: '/' },
  { icon: Music, label: 'Music Station', path: '/music' },
  { icon: Sparkles, label: 'Featured', path: '/featured' },
  { icon: Film, label: 'Movies', path: '/movies' },
  { icon: Radio, label: 'Live Radio', path: '/radio' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Library, label: 'Library', path: '/library' },
];

const secondaryItems = [
  { icon: Music, label: 'Songs', path: '/songs' },
  { icon: Mic2, label: 'Artists', path: '/artists' },
  { icon: Heart, label: 'Favourites', path: '/favourites' },
];

export const Sidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <div className="hidden lg:flex flex-col w-64 border-r border-border h-screen sticky top-0 bg-card/20 backdrop-blur-sm p-6 overflow-y-auto">
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="bg-primary p-2 rounded-xl">
          <Music className="text-primary-foreground" size={24} />
        </div>
        <span className="text-xl font-black tracking-tight italic">anbae</span>
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

      <nav className="space-y-1 mb-8">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-3">Your Space</p>
        {secondaryItems.map((item) => (
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

      <nav className="space-y-1 mb-8">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-3">Account</p>
        {user ? (
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          >
            <LogOut size={20} />
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              location.pathname === '/login' 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
            )}
          >
            <LogIn size={20} />
            Login / Sign Up
          </Link>
        )}
      </nav>

      {/* Footer & Disclaimer */}
      <div className="mt-auto pt-6 border-t border-border/50 text-center space-y-3">
        <p className="text-[11px] text-muted-foreground font-medium">
          Crafted with love by{" "}
          <a 
            href="https://www.instagram.com/11x13y/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline font-bold"
          >
            11x13y
          </a>
        </p>
        <p className="text-[9px] text-muted-foreground/60 leading-relaxed">
          Disclaimer: We do not own or host any of the music, radio, or movie content streamed on this platform. All streams are fetched from public APIs.
        </p>
      </div>
    </div>
  );
};
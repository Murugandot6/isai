"use client";

import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MusicPlayer } from './MusicPlayer';
import { ListenTogether } from './ListenTogether';
import { LanguageSelector } from './LanguageSelector';
import { MobileNav } from './MobileNav';
import { Music, User, LogIn, Settings, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!user) return null;

  // Check if we are on Cinema, Music, or Songs page to enable fully immersive fullscreen
  const isImmersiveFullscreen = location.pathname === '/movies' || location.pathname === '/music' || location.pathname === '/songs';

  if (isImmersiveFullscreen) {
    return (
      <div className="min-h-screen bg-zinc-950 text-foreground overflow-x-hidden relative">
        {/* Render children completely unconstrained */}
        <main className="min-h-screen relative pb-16 lg:pb-0">
          {children}
        </main>
        <MusicPlayer />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Header */}
        <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/50 px-3 md:px-6 py-2.5 md:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 lg:hidden shrink-0">
            <div className="bg-primary p-1.5 rounded-lg">
              <Music className="text-primary-foreground" size={14} />
            </div>
            <span className="text-sm font-black tracking-tight italic">anbae</span>
          </div>
          <div className="hidden lg:block" /> 
          <div className="flex items-center gap-1.5 md:gap-3 ml-auto">
            <LanguageSelector />
            <ListenTogether />
            
            <div className="h-5 w-[1px] bg-border/50 mx-0.5 hidden sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-accent/5 border-border hover:bg-accent/10 transition-all overflow-hidden shrink-0">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={14} className="text-muted-foreground" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl bg-card border-border shadow-2xl">
                <DropdownMenuLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <div className="px-2 py-1.5">
                  <p className="text-sm font-bold truncate">{user.user_metadata?.username || user.email}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem 
                  onClick={() => navigate('/profile')}
                  className="rounded-lg m-1 cursor-pointer focus:bg-primary/10 focus:text-primary font-medium gap-2"
                >
                  <Settings size={16} />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="rounded-lg m-1 cursor-pointer focus:bg-destructive/10 focus:text-destructive font-medium"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content with extra padding for mobile player + nav */}
        <main className="flex-1 relative pb-[160px] md:pb-32">
          {children}
        </main>
      </div>
      <MusicPlayer />
      <MobileNav />
    </div>
  );
};
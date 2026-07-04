"use client";

import React, { useEffect } from 'react';
import { MusicPlayer } from './MusicPlayer';
import { ListenTogether } from './ListenTogether';
import { LanguageSelector } from './LanguageSelector';
import { MobileNav } from './MobileNav';
import { Music, User, Settings, Loader2, Sparkles, Home, Heart, History, Library, Film, Radio, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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

  // Fullscreen interactive player views
  const isImmersiveFullscreen = location.pathname === '/movies' || location.pathname === '/music' || location.pathname === '/watch';

  const path = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const searchType = searchParams.get('type');

  const isMoviesContext = path.startsWith('/movies') || path.startsWith('/watch-history') || path.startsWith('/watch') || (path === '/search' && searchType === 'movies');
  const isRadioContext = path.startsWith('/radio') || (path === '/search' && searchType === 'fm');
  const isMusicContext = !isMoviesContext && !isRadioContext && path !== '/';

  if (isImmersiveFullscreen) {
    return (
      <div className="min-h-screen bg-zinc-950 text-foreground overflow-x-hidden relative">
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
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Global Header - Translucent / Sticky on subpages, Absolute / Transparent on Home page */}
        <header className={cn(
          "z-40 w-full px-3 md:px-6 py-2.5 md:py-4 flex items-center justify-between gap-4 transition-all duration-300",
          path === '/' 
            ? "absolute top-0 left-0 right-0 bg-transparent border-b-0" 
            : "sticky top-0 bg-background/80 backdrop-blur-md border-b border-border/50"
        )}>
          <div className="flex items-center gap-1.5 lg:hidden shrink-0">
            <div className="bg-primary p-1.5 rounded-lg">
              <Music className="text-primary-foreground" size={14} />
            </div>
            <span className="text-sm font-black tracking-tight italic">anbae</span>
          </div>
          
          {/* Dynamic Top Navigation Curations */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Home gateway shortcut */}
            <button 
              onClick={() => navigate('/')}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-all shrink-0"
              title="Gateway Hub"
            >
              <Home size={18} />
            </button>

            <div className="h-5 w-[1px] bg-border/50 mx-1 shrink-0" />

            {isMusicContext && (
              <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase">
                <button 
                  onClick={() => navigate('/music')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[11px] ${path === '/music' ? 'bg-primary text-white' : 'bg-white/5 text-purple-300 hover:text-white hover:bg-white/10 border border-white/5'}`}
                >
                  <Music size={14} />
                  Music Home
                </button>
                <button 
                  onClick={() => navigate('/featured')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[11px] ${path === '/featured' ? 'bg-primary text-white' : 'bg-white/5 text-purple-300 hover:text-white hover:bg-white/10 border border-white/5'}`}
                >
                  <Sparkles size={14} />
                  Trending Playlists
                </button>
                <button 
                  onClick={() => navigate('/artists')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[11px] ${path === '/artists' ? 'bg-primary text-white' : 'bg-white/5 text-purple-300 hover:text-white hover:bg-white/10 border border-white/5'}`}
                >
                  <User size={14} />
                  Top Artists
                </button>
                <button 
                  onClick={() => navigate('/songs')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[11px] ${path === '/songs' ? 'bg-primary text-white' : 'bg-white/5 text-purple-300 hover:text-white hover:bg-white/10 border border-white/5'}`}
                >
                  <History size={14} />
                  Recent Songs
                </button>
                <button 
                  onClick={() => navigate('/favourites')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[11px] ${path === '/favourites' ? 'bg-primary text-white' : 'bg-white/5 text-purple-300 hover:text-white hover:bg-white/10 border border-white/5'}`}
                >
                  <Heart size={14} />
                  Favourites
                </button>
                <button 
                  onClick={() => navigate('/library')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[11px] ${path === '/library' ? 'bg-primary text-white' : 'bg-white/5 text-purple-300 hover:text-white hover:bg-white/10 border border-white/5'}`}
                >
                  <Library size={14} />
                  Library
                </button>
              </div>
            )}

            {isMoviesContext && (
              <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase">
                <button 
                  onClick={() => navigate('/movies')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[11px] ${path === '/movies' ? 'bg-purple-600 text-white' : 'bg-white/5 text-purple-300 hover:text-white hover:bg-white/10 border border-white/5'}`}
                >
                  <Film size={14} />
                  Cinema Home
                </button>
                <button 
                  onClick={() => navigate('/search?type=movies')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[11px] ${path === '/search' && searchType === 'movies' ? 'bg-purple-600 text-white' : 'bg-white/5 text-purple-300 hover:text-white hover:bg-white/10 border border-white/5'}`}
                >
                  <Search size={14} />
                  Search Movies
                </button>
                <button 
                  onClick={() => navigate('/watch-history')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[11px] ${path === '/watch-history' ? 'bg-purple-600 text-white' : 'bg-white/5 text-purple-300 hover:text-white hover:bg-white/10 border border-white/5'}`}
                >
                  <History size={14} />
                  Watch History
                </button>
                <button 
                  onClick={() => navigate('/favourites')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[11px] ${path === '/favourites' ? 'bg-purple-600 text-white' : 'bg-white/5 text-purple-300 hover:text-white hover:bg-white/10 border border-white/5'}`}
                >
                  <Heart size={14} />
                  Liked Movies
                </button>
              </div>
            )}

            {isRadioContext && (
              <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase">
                <button 
                  onClick={() => navigate('/radio')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[11px] ${path === '/radio' ? 'bg-orange-500 text-white' : 'bg-white/5 text-orange-300 hover:text-white hover:bg-white/10 border border-white/5'}`}
                >
                  <Radio size={14} />
                  World FM Radio
                </button>
                <button 
                  onClick={() => navigate('/search?type=fm')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[11px] ${path === '/search' && searchType === 'fm' ? 'bg-orange-500 text-white' : 'bg-white/5 text-orange-300 hover:text-white hover:bg-white/10 border border-white/5'}`}
                >
                  <Search size={14} />
                  Search Radio
                </button>
                <button 
                  onClick={() => navigate('/favourites')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[11px] ${path === '/favourites' ? 'bg-orange-500 text-white' : 'bg-white/5 text-orange-300 hover:text-white hover:bg-white/10 border border-white/5'}`}
                >
                  <Heart size={14} />
                  Starred Stations
                </button>
              </div>
            )}
          </div>

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

        {/* Main Content */}
        <main className="flex-1 relative pb-[160px] md:pb-32">
          {children}
        </main>
      </div>
      <MusicPlayer />
      <MobileNav />
    </div>
  );
};
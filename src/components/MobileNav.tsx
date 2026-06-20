"use client";

import React from 'react';
import { Home, Music, Film, Radio, Search, Heart, Sparkles, Layers } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const MobileNav = () => {
  const location = useLocation();
  const path = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const searchType = searchParams.get('type');

  const isMoviesContext = path.startsWith('/movies') || (path === '/search' && searchType === 'movies');
  const isRadioContext = path.startsWith('/radio') || (path === '/search' && searchType === 'fm');
  const isStremioContext = path.startsWith('/stremio');
  const isMusicContext = !isMoviesContext && !isRadioContext && !isStremioContext && path !== '/';

  // Choose the dynamic, context-specific items
  let navItems = [
    { icon: Home, label: 'Gateway', path: '/' },
    { icon: Music, label: 'Music', path: '/music' },
    { icon: Film, label: 'Movies', path: '/movies' },
    { icon: Layers, label: 'Stremio', path: '/stremio' },
  ];

  if (isMoviesContext) {
    navItems = [
      { icon: Home, label: 'Gateway', path: '/' },
      { icon: Film, label: 'Cinema', path: '/movies' },
      { icon: Search, label: 'Search', path: '/search?type=movies' },
      { icon: Heart, label: 'Favs', path: '/favourites' },
    ];
  } else if (isRadioContext) {
    navItems = [
      { icon: Home, label: 'Gateway', path: '/' },
      { icon: Radio, label: 'Radio', path: '/radio' },
      { icon: Search, label: 'Search', path: '/search?type=fm' },
      { icon: Heart, label: 'Starred', path: '/favourites' },
    ];
  } else if (isStremioContext) {
    navItems = [
      { icon: Home, label: 'Gateway', path: '/' },
      { icon: Layers, label: 'Stremio', path: '/stremio' },
      { icon: Search, label: 'Search', path: '/search?type=movies' },
      { icon: Heart, label: 'Favs', path: '/favourites' },
    ];
  } else if (isMusicContext) {
    navItems = [
      { icon: Home, label: 'Gateway', path: '/' },
      { icon: Music, label: 'Music', path: '/music' },
      { icon: Sparkles, label: 'Featured', path: '/featured' },
      { icon: Search, label: 'Search', path: '/search?type=music' },
    ];
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border z-50 px-4 py-3 flex items-center justify-between pb-safe">
      {navItems.map((item) => {
        const isActive = path === item.path || (path === '/search' && item.path.startsWith('/search') && searchType === (item.path.includes('movies') ? 'movies' : item.path.includes('fm') ? 'fm' : 'music'));
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-200 flex-1",
              isActive 
                ? (isMoviesContext ? "text-purple-400" : isRadioContext ? "text-orange-400" : isStremioContext ? "text-indigo-400" : "text-green-500") 
                : "text-muted-foreground"
            )}
          >
            <item.icon size={20} className={cn(isActive && "scale-110")} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
</dyad-file>

<dyad-write path="src/components/MainLayout.tsx" description="Update MainLayout to support Stremio context and navigation headers">
"use client";

import React, { useEffect } from 'react';
import { MusicPlayer } from './MusicPlayer';
import { MoviePlayerOverlay } from './MoviePlayerOverlay';
import { ListenTogether } from './ListenTogether';
import { LanguageSelector } from './LanguageSelector';
import { MobileNav } from './MobileNav';
import { Music, User, Settings, Loader2, Sparkles, Home, Heart, History, Library, Film, Radio, Search, Layers } from 'lucide-react';
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
  const isImmersiveFullscreen = location.pathname === '/movies' || location.pathname === '/music' || location.pathname === '/stremio';

  const path = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const searchType = searchParams.get('type');

  const isMoviesContext = path.startsWith('/movies') || (path === '/search' && searchType === 'movies');
  const isRadioContext = path.startsWith('/radio') || (path === '/search' && searchType === 'fm');
  const isStremioContext = path.startsWith('/stremio');
  const isMusicContext = !isMoviesContext && !isRadioContext && !isStremioContext && path !== '/';

  if (isImmersiveFullscreen) {
    return (
      <div className="min-h-screen bg-zinc-950 text-foreground overflow-x-hidden relative">
        <main className="min-h-screen relative pb-16 lg:pb-0">
          {children}
        </main>
        <MusicPlayer />
        <MoviePlayerOverlay />
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[11px] ${(path === '/search' && searchType === 'movies') ? 'bg-purple-600 text-white' : 'bg-white/5 text-purple-300 hover:text-white hover:bg-white/10 border border-white/5'}`}
                >
                  <Search size={14} />
                  Search Movies
                </button>
                <button 
                  onClick={() => navigate('/library')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[11px] ${path === '/library' ? 'bg-purple-600 text-white' : 'bg-white/5 text-purple-300 hover:text-white hover:bg-white/10 border border-white/5'}`}
                >
                  <History size={14} />
                  Continue Watching
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

            {isStremioContext && (
              <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase">
                <button 
                  onClick={() => navigate('/stremio')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[11px] ${path === '/stremio' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-indigo-300 hover:text-white hover:bg-white/10 border border-white/5'}`}
                >
                  <Layers size={14} />
                  Stremio Discover
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[11px] ${(path === '/search' && searchType === 'fm') ? 'bg-orange-500 text-white' : 'bg-white/5 text-orange-300 hover:text-white hover:bg-white/10 border border-white/5'}`}
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
      <MoviePlayerOverlay />
      <MobileNav />
    </div>
  );
};
</dyad-file>

<dyad-write path="src/pages/Index.tsx" description="Add Stremio Station to the Gateway Hub page">
"use client";

import React, { useMemo } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import { Music, Film, Radio, ArrowRight, Sparkles, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
      title: 'Music Station',
      description: 'Explore the full premium Spotify-like dashboard. High-fidelity streams, horizontal albums, custom playlists, and regional chartbusters.',
      icon: Music,
      path: '/music',
      color: 'from-green-500/20 to-emerald-500/5',
      borderColor: 'group-hover:border-green-500/50',
      badge: 'Spotify Web Player',
      accent: 'text-green-400 bg-green-500/10'
    },
    {
      id: 'movies',
      title: 'anbae Cinema',
      description: 'Cinema streaming on demand. Highly stylized server switcher, synchronized listen-together watch party rooms, and cinematic poster layouts.',
      icon: Film,
      path: '/movies',
      color: 'from-purple-500/20 to-indigo-500/5',
      borderColor: 'group-hover:border-purple-500/50',
      badge: 'Vyla Cinematic',
      accent: 'text-purple-400 bg-purple-500/10'
    },
    {
      id: 'stremio',
      title: 'Stremio Station',
      description: 'Decentralized streaming powered by community add-ons. Cinemeta catalogs, Torrentio RD+ stream resolution, and custom add-on protocol toggles.',
      icon: Layers,
      path: '/stremio',
      color: 'from-indigo-500/20 to-violet-500/5',
      borderColor: 'group-hover:border-indigo-500/50',
      badge: 'Add-on Protocol',
      accent: 'text-indigo-400 bg-indigo-500/10'
    },
    {
      id: 'radio',
      title: 'World Radio',
      description: 'Global Live FM broadcasts sorted by votes and popularity. Dynamic search and favoriting, streaming direct on any device.',
      icon: Radio,
      path: '/radio',
      color: 'from-orange-500/20 to-amber-500/5',
      borderColor: 'group-hover:border-orange-500/50',
      badge: 'Live FM',
      accent: 'text-orange-400 bg-orange-500/10'
    }
  ];

  return (
    <MainLayout>
      <div className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20 md:pt-24">
        {/* Dynamic Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={bgImage} 
            alt="Background" 
            className="w-full h-full object-cover transition-opacity duration-1000"
          />
          {/* Cinematic Overlays for readability */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="relative z-10 p-4 md:p-10 max-w-6xl mx-auto w-full">
          {/* Welcome Section */}
          <div className="text-center mb-10 md:mb-16 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <Badge variant="outline" className="border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-primary/5 rounded-full backdrop-blur-md">
              Welcome to your entertainment center
            </Badge>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none text-white drop-shadow-2xl">
              What are we experiencing <span className="text-primary italic">today</span>?
            </h1>
            <p className="text-zinc-200 text-xs md:text-sm max-w-xl mx-auto font-medium drop-shadow-md">
              Please select one of the dedicated, highly stylized stations below. Music, cinema, and radio have been split into individual custom interfaces.
            </p>
          </div>

          {/* Dynamic Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {hubs.map((hub) => (
              <div
                key={hub.id}
                onClick={() => navigate(hub.path)}
                className={`group relative flex flex-col justify-between p-6 md:p-8 rounded-[2.5rem] bg-black/40 backdrop-blur-xl border border-white/10 cursor-pointer shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-primary/20 ${hub.borderColor}`}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3.5 rounded-2xl ${hub.accent} shadow-inner`}>
                      <hub.icon size={28} />
                    </div>
                    <Badge variant="secondary" className="bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5">
                      {hub.badge}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors flex items-center gap-2">
                      {hub.title}
                      <Sparkles size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </h3>
                    <p className="text-zinc-300 text-xs leading-relaxed font-medium">
                      {hub.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-primary transition-colors">
                    Open Station
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110 duration-300 shadow-lg">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Global social sync notification */}
          <div className="mt-12 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center gap-2 text-center max-w-xl mx-auto animate-in fade-in duration-1000">
            <Badge variant="outline" className="border-green-500/20 text-green-500 text-[8px] font-black uppercase tracking-widest bg-green-500/5 animate-pulse">
              Active
            </Badge>
            <span className="text-[10px] md:text-xs text-zinc-300 font-semibold">
              Social Sync broadcast system is fully active on all platforms.
            </span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
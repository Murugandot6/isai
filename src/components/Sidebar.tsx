"use client";

import React from 'react';
import { Home, Search, Library, Music, Heart, Mic2, Radio, LogIn, LogOut, Sparkles, Film, ArrowLeft, Disc, History } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const path = location.pathname;

  // Determine current active section/station context
  const isMoviesContext = path.startsWith('/movies');
  const isRadioContext = path.startsWith('/radio');
  const isMusicContext = !isMoviesContext && !isRadioContext && path !== '/';

  return (
    <div className="hidden lg:flex flex-col w-64 border-r border-border h-screen sticky top-0 bg-card/20 backdrop-blur-sm p-6 overflow-y-auto">
      {/* Station Brand Header */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className={cn(
          "p-2 rounded-xl transition-colors duration-300",
          isMoviesContext ? "bg-purple-600" : isRadioContext ? "bg-orange-500" : "bg-green-500"
        )}>
          {isMoviesContext ? <Film className="text-white" size={20} /> : isRadioContext ? <Radio className="text-white" size={20} /> : <Music className="text-white" size={20} />}
        </div>
        <span className="text-xl font-black tracking-tight italic">anbae</span>
      </div>

      {/* Global back navigation button if not at home */}
      {path !== '/' && (
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-muted-foreground hover:bg-accent/10 hover:text-foreground transition-all mb-6 border border-border/50 bg-accent/5"
        >
          <ArrowLeft size={14} />
          Back to Gateway Hub
        </button>
      )}

      {/* RENDER MOVIES STATION NAVIGATION */}
      {isMoviesContext && (
        <nav className="space-y-1 mb-8">
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest px-4 mb-3">Cinema Station</p>
          <Link
            to="/movies"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              path === '/movies' 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
            )}
          >
            <Film size={20} />
            Cinema Home
          </Link>
          <Link
            to="/search?type=movies"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              path === '/search'
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
            )}
          >
            <Search size={20} />
            Search Movies
          </Link>
          <Link
            to="/library"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              path === '/library'
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
            )}
          >
            <History size={20} />
            Continue Watching
          </Link>
          <Link
            to="/favourites"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              path === '/favourites'
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
            )}
          >
            <Heart size={20} />
            Liked Movies
          </Link>
        </nav>
      )}

      {/* RENDER RADIO STATION NAVIGATION */}
      {isRadioContext && (
        <nav className="space-y-1 mb-8">
          <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest px-4 mb-3">Radio Station</p>
          <Link
            to="/radio"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              path === '/radio' 
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
            )}
          >
            <Radio size={20} />
            World FM Radio
          </Link>
          <Link
            to="/search?type=fm"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              path === '/search'
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
            )}
          >
            <Search size={20} />
            Search Radio
          </Link>
          <Link
            to="/favourites"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              path === '/favourites'
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
            )}
          >
            <Heart size={20} />
            Starred Stations
          </Link>
        </nav>
      )}

      {/* RENDER MUSIC STATION NAVIGATION */}
      {isMusicContext && (
        <>
          <nav className="space-y-1 mb-6">
            <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest px-4 mb-3">Music Menu</p>
            <Link
              to="/music"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                path === '/music' 
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              )}
            >
              <Music size={20} />
              Music Home
            </Link>
            <Link
              to="/featured"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                path === '/featured' 
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              )}
            >
              <Sparkles size={20} />
              Featured Lists
            </Link>
            <Link
              to="/search?type=music"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                path === '/search' 
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              )}
            >
              <Search size={20} />
              Search Tracks
            </Link>
            <Link
              to="/library"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                path === '/library' 
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              )}
            >
              <Library size={20} />
              Your Playlists
            </Link>
          </nav>

          <nav className="space-y-1 mb-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-3">Your Space</p>
            <Link
              to="/songs"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                path === '/songs' 
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              )}
            >
              <History size={20} />
              Recent Songs
            </Link>
            <Link
              to="/artists"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                path === '/artists' 
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              )}
            >
              <Mic2 size={20} />
              Artists Page
            </Link>
            <Link
              to="/favourites"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                path === '/favourites' 
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              )}
            >
              <Heart size={20} />
              Favourites
            </Link>
          </nav>
        </>
      )}

      {/* GUEST OR DEFAULT HOME CHOICE PORTAL SELECTION */}
      {path === '/' && (
        <nav className="space-y-1 mb-8">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-3">Gateway Stations</p>
          <Link
            to="/music"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-green-500/10 hover:text-green-400 transition-all duration-200"
          >
            <Music size={20} />
            Music Station
          </Link>
          <Link
            to="/movies"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-purple-600/10 hover:text-purple-400 transition-all duration-200"
          >
            <Film size={20} />
            anbae Cinema
          </Link>
          <Link
            to="/radio"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-orange-500/10 hover:text-orange-400 transition-all duration-200"
          >
            <Radio size={20} />
            World FM Radio
          </Link>
        </nav>
      )}

      {/* Global Account Settings */}
      <nav className="space-y-1 mb-8 mt-auto">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-3">Session</p>
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
              path === '/login' 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
            )}
          >
            <LogIn size={20} />
            Login / Sign Up
          </Link>
        )}
      </nav>

      {/* Footer & Disclaimer */}
      <div className="pt-6 border-t border-border/50 text-center space-y-3 shrink-0">
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
      </div>
    </div>
  );
};
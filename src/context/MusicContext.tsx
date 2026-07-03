"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Song, musicApi } from '@/services/musicApi';
import { RadioStation } from '@/services/radioApi';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

export interface Movie {
  id: string;
  title: string;
  overview: string;
  backdrop: string;
  poster: string;
  rating: number;
  year: string;
  genre: string;
  language: string;
  imdbId?: string;
  streamUrl?: string;
}

export interface SongMemory {
  id: string;
  songId: string;
  songName: string;
  artistName: string;
  imageUrl: string;
  text: string;
  createdAt: number;
}

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song, queue?: Song[], fromSync?: boolean) => Promise<void>;
  playRandom: () => Promise<void>;
  pauseSong: (fromSync?: boolean) => void;
  resumeSong: (fromSync?: boolean) => void;
  togglePlay: () => void;
  playNext: (fromSync?: boolean) => void;
  playPrevious: (fromSync?: boolean) => void;
  addToNext: (song: Song) => void;
  currentTime: number;
  duration: number;
  volume: number;
  setVolume: (v: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  seek: (time: number, fromSync?: boolean) => void;
  roomCode: string | null;
  setRoomCode: (code: string | null) => void;
  isHost: boolean;
  setIsHost: (isHost: boolean) => void;
  selectedLanguages: string[];
  toggleLanguage: (lang: string) => void;
  likedSongs: Song[];
  toggleLike: (song: Song) => void;
  isLiked: (songId: string) => boolean;
  likedStations: RadioStation[];
  toggleLikeStation: (station: RadioStation) => void;
  isStationLiked: (stationId: string) => boolean;
  recentlyPlayed: Song[];
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  isShuffle: boolean;
  toggleShuffle: (fromSync?: boolean) => void;
  repeatMode: 'none' | 'one' | 'all';
  toggleRepeat: (fromSync?: boolean) => void;
  queue: Song[];
  currentMovie: Movie | null;
  playMovie: (movie: Movie, fromSync?: boolean) => void;
  closeMovie: (fromSync?: boolean) => void;
  likedMovies: Movie[];
  toggleLikeMovie: (movie: Movie) => void;
  isMovieLiked: (movieId: string) => boolean;
  recentlyWatched: Movie[];
  // Music Journal
  memories: SongMemory[];
  addMemory: (song: Song, text: string) => void;
  deleteMemory: (memoryId: string) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['tamil']);
  
  const [queue, setQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [likedMovies, setLikedMovies] = useState<Movie[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<Movie[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<any>(null);
  const isChannelReady = useRef(false);

  const [likedStations, setLikedStations] = useState<RadioStation[]>([]);
  const [memories, setMemories] = useState<SongMemory[]>([]);

  useEffect(() => {
    const savedLiked = localStorage.getItem('isai_liked_songs');
    const savedStations = localStorage.getItem('isai_liked_stations');
    const savedRecent = localStorage.getItem('isai_recent_songs');
    const savedPlaylists = localStorage.getItem('isai_playlists');
    const savedLikedMovies = localStorage.getItem('isai_liked_movies');
    const savedRecentMovies = localStorage.getItem('isai_recent_movies');
    const savedMemories = localStorage.getItem('isai_memories');

    if (savedLiked) try { setLikedSongs(JSON.parse(savedLiked)); } catch (e) {}
    if (savedStations) try { setLikedStations(JSON.parse(savedStations)); } catch (e) {}
    if (savedRecent) try { setRecentlyPlayed(JSON.parse(savedRecent)); } catch (e) {}
    if (savedPlaylists) try { setPlaylists(JSON.parse(savedPlaylists)); } catch (e) {}
    if (savedLikedMovies) try { setLikedMovies(JSON.parse(savedLikedMovies)); } catch (e) {}
    if (savedRecentMovies) try { setRecentlyWatched(JSON.parse(savedRecentMovies)); } catch (e) {}
    if (savedMemories) try { setMemories(JSON.parse(savedMemories)); } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('isai_liked_songs', JSON.stringify(likedSongs));
    localStorage.setItem('isai_liked_stations', JSON.stringify(likedStations));
    localStorage.setItem('isai_recent_songs', JSON.stringify(recentlyPlayed));
    localStorage.setItem('isai_playlists', JSON.stringify(playlists));
    localStorage.setItem('isai_liked_movies', JSON.stringify(likedMovies));
    localStorage.setItem('isai_recent_movies', JSON.stringify(recentlyWatched));
    localStorage.setItem('isai_memories', JSON.stringify(memories));
  }, [likedSongs, likedStations, recentlyPlayed, playlists, likedMovies, recentlyWatched, memories]);

  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const broadcast = useCallback((type: string, data: any) => {
    if (isHost && roomCode && channelRef.current && isChannelReady.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'sync',
        payload: { type, data, timestamp: Date.now() }
      });
    }
  }, [roomCode, isHost]);

  const playSong = useCallback(async (song: Song, newQueue?: Song[], fromSync: boolean = false) => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    
    try {
      if (currentMovie) setCurrentMovie(null);

      const isRadio = song.type === 'radio' || song.album?.id === 'radio';
      let fullDetails = song;

      // Fetch fresh details for streams if it's not a radio
      if (!isRadio) {
        const data = await musicApi.getSongDetails(song.id);
        if (data) fullDetails = data;
      }

      const streams = fullDetails.downloadUrl || [];
      const stream = streams.find(s => s.quality === '320kbps') || streams[streams.length - 1];
      
      // Support both stream.url and stream.link for diverse API payloads
      let streamUrl = stream?.url || (stream as any)?.link || (song as any).url_resolved || (song as any).url;

      if (!streamUrl) throw new Error("No stream URL found");

      // For standard songs/compositions, force SSL upgrade.
      // For global radio broadcast feeds, preserve their original protocol (or support secure fallback dynamically)
      if (!isRadio) {
        audio.src = streamUrl.replace('http://', 'https://');
      } else {
        audio.src = streamUrl;
      }
      
      audio.load();
      await audio.play();

      setCurrentSong(fullDetails);
      setIsPlaying(true);
      
      let updatedQueue = newQueue || queue;
      setQueue(updatedQueue);
      setCurrentIndex(updatedQueue.findIndex(s => s.id === song.id));
      
      if (!fromSync) {
        setRecentlyPlayed(prev => [fullDetails, ...prev.filter(s => s.id !== fullDetails.id)].slice(0, 30));
        broadcast('play', { song: fullDetails, time: 0, queue: updatedQueue });
      }
    } catch (error) {
      console.error("Playback failed:", error);
      setIsPlaying(false);
      toast.error("Playback failed. Please try another stream or station.");
    }
  }, [queue, currentMovie, broadcast]);

  const playRandom = useCallback(async () => {
    const randomLang = selectedLanguages[Math.floor(Math.random() * selectedLanguages.length)] || 'tamil';
    
    try {
      const results = await musicApi.getTrending(randomLang);
      if (results && results.length > 0) {
        const randomSong = results[Math.floor(Math.random() * results.length)];
        await playSong(randomSong, results);
      }
    } catch (err) {
      console.error("Failed to play random songs", err);
    }
  }, [selectedLanguages, playSong]);

  const togglePlay = () => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      broadcast('pause', {});
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      broadcast('resume', {});
    }
  };

  const pauseSong = useCallback((fromSync: boolean = false) => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (!fromSync) broadcast('pause', {});
    }
  }, [isPlaying, broadcast]);

  const resumeSong = useCallback((fromSync: boolean = false) => {
    if (audioRef.current && !isPlaying && currentSong) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      if (!fromSync) broadcast('resume', {});
    }
  }, [isPlaying, currentSong, broadcast]);

  const playNext = useCallback((fromSync: boolean = false) => {
    if (queue.length === 0) return;
    let nextIdx = currentIndex + 1;
    
    if (isShuffle) {
      // Shuffle logic: Shuffles ONLY from selected languages
      const validSongs = queue.filter(s => 
        selectedLanguages.includes(s.language?.toLowerCase() || 'tamil')
      );

      if (validSongs.length > 0) {
        const candidates = validSongs.filter(s => s.id !== currentSong?.id);
        const chosen = candidates.length > 0 
          ? candidates[Math.floor(Math.random() * candidates.length)]
          : validSongs[Math.floor(Math.random() * validSongs.length)];
        nextIdx = queue.findIndex(s => s.id === chosen.id);
      } else {
        // Fallback if no songs in queue match selected languages (unlikely given new playRandom behavior)
        nextIdx = Math.floor(Math.random() * queue.length);
      }
    } else if (nextIdx >= queue.length) {
      if (repeatMode === 'all') nextIdx = 0;
      else return;
    }
    
    if (nextIdx !== -1 && queue[nextIdx]) {
      playSong(queue[nextIdx]);
    }
    if (!fromSync) broadcast('next', {});
  }, [queue, currentIndex, isShuffle, repeatMode, playSong, broadcast, currentSong, selectedLanguages]);

  const playPrevious = useCallback((fromSync: boolean = false) => {
    if (queue.length === 0) return;
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      if (repeatMode === 'all') prevIdx = queue.length - 1;
      else prevIdx = 0;
    }
    playSong(queue[prevIdx]);
    if (!fromSync) broadcast('prev', {});
  }, [queue, currentIndex, repeatMode, playSong, broadcast]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const seek = useCallback((time: number, fromSync: boolean = false) => {
    if (audioRef.current && isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (!fromSync) broadcast('seek', { time });
    }
  }, [broadcast]);

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) 
        ? (prev.length > 1 ? prev.filter(l => l !== lang) : prev) 
        : [...prev, lang]
    );
  };

  const isLiked = (songId: string) => likedSongs.some(s => s.id === songId);
  const toggleLike = (song: Song) => {
    setLikedSongs(prev => isLiked(song.id) ? prev.filter(s => s.id !== song.id) : [song, ...prev]);
  };

  const playMovie = useCallback((movie: Movie, fromSync: boolean = false) => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    setCurrentMovie(movie);
    
    // Automatically route to full-page watch viewport
    window.location.hash = '#/watch';

    if (!fromSync) {
      setRecentlyWatched(prev => [movie, ...prev.filter(m => m.id !== movie.id)].slice(0, 20));
      broadcast('play_movie', { movie });
    }
  }, [broadcast]);

  const closeMovie = useCallback((fromSync: boolean = false) => {
    setCurrentMovie(null);
    
    // Route back to Movies hub
    window.location.hash = '#/movies';

    if (!fromSync) {
      broadcast('close_movie', {});
    }
  }, [broadcast]);

  const toggleLikeMovie = (movie: Movie) => {
    setLikedMovies(prev => prev.some(m => m.id === movie.id) ? prev.filter(m => m.id !== movie.id) : [movie, ...prev]);
  };

  const isMovieLiked = (movieId: string) => likedMovies.some(m => m.id === movieId);

  // Music Journal Actions
  const addMemory = (song: Song, text: string) => {
    const newMemory: SongMemory = {
      id: Math.random().toString(36).substring(2, 9),
      songId: song.id,
      songName: song.name,
      artistName: song.primaryArtists,
      imageUrl: song.image?.[0]?.url || (song.image?.[0] as any)?.link || '',
      text,
      createdAt: Date.now()
    };
    setMemories(prev => [newMemory, ...prev]);
    toast.success("Memory saved to your Music Journal!");
  };

  const deleteMemory = (memoryId: string) => {
    setMemories(prev => prev.filter(m => m.id !== memoryId));
    toast.success("Memory removed from your Journal");
  };

  const toggleShuffle = useCallback((fromSync: boolean = false) => {
    const newShuffle = !isShuffle;
    setIsShuffle(newShuffle);
    if (!fromSync) broadcast('shuffle', { isShuffle: newShuffle });
  }, [isShuffle, broadcast]);

  // Automatic track progression when a song ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        playNext();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playNext, repeatMode]);

  // Supabase Realtime Broadcast Subscription
  useEffect(() => {
    if (!roomCode) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      isChannelReady.current = false;
      return;
    }

    const channel = supabase.channel(`room:${roomCode}`, {
      config: {
        broadcast: { self: false }
      }
    });

    channel
      .on('broadcast', { event: 'sync' }, ({ payload }) => {
        const { type, data } = payload;
        
        if (isHost) return; 

        switch (type) {
          case 'play':
            if (data.song) {
              playSong(data.song, data.queue, true);
              if (data.time) {
                setTimeout(() => seek(data.time, true), 500);
              }
            }
            break;
          case 'pause':
            pauseSong(true);
            break;
          case 'resume':
            resumeSong(true);
            break;
          case 'seek':
            if (data.time !== undefined) {
              seek(data.time, true);
            }
            break;
          case 'play_movie':
            if (data.movie) {
              playMovie(data.movie, true);
            }
            break;
          case 'close_movie':
            closeMovie(true);
            break;
          case 'next':
            playNext(true);
            break;
          case 'prev':
            playPrevious(true);
            break;
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isChannelReady.current = true;
          
          if (isHost && currentSong) {
            channel.send({
              type: 'broadcast',
              event: 'sync',
              payload: {
                type: 'play',
                data: {
                  song: currentSong,
                  time: audioRef.current?.currentTime || 0,
                  queue
                }
              }
            });
          }
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      isChannelReady.current = false;
    };
  }, [roomCode, isHost, playSong, seek, pauseSong, resumeSong, playMovie, closeMovie, playNext, playPrevious, currentSong, queue]);

  return (
    <MusicContext.Provider value={{
      currentSong, isPlaying, playSong, playRandom, pauseSong, resumeSong, togglePlay, playNext, playPrevious,
      addToNext: (s) => setQueue(prev => [...prev.slice(0, currentIndex + 1), s, ...prev.slice(currentIndex + 1)]),
      currentTime, duration, volume, setVolume, isMuted, toggleMute, seek, roomCode, setRoomCode, isHost, setIsHost,
      selectedLanguages, toggleLanguage, likedSongs, toggleLike, isLiked, likedStations, toggleLikeStation: () => {}, isStationLiked: () => false,
      recentlyPlayed, playlists, 
      createPlaylist: (name) => setPlaylists(prev => [{ id: Math.random().toString(36).substr(2, 9), name, songs: [], createdAt: Date.now() }, ...prev]),
      addToPlaylist: (id, s) => setPlaylists(prev => prev.map(p => p.id === id ? { ...p, songs: [s, ...p.songs] } : p)),
      removeFromPlaylist: (id, sid) => setPlaylists(prev => prev.map(p => p.id === id ? { ...p, songs: p.songs.filter(s => s.id !== sid) } : p)),
      isShuffle, toggleShuffle,
      repeatMode, toggleRepeat: () => setRepeatMode(prev => prev === 'none' ? 'one' : prev === 'one' ? 'all' : 'none'),
      queue, currentMovie, playMovie, closeMovie, likedMovies, toggleLikeMovie, isMovieLiked, recentlyWatched,
      memories, addMemory, deleteMemory
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within MusicProvider');
  return context;
};
</dyad-file>

<dyad-write path="src/pages/Login.tsx" description="Rewriting Login.tsx to fix all TypeScript compilation errors, clean up unused variables, escape JSX characters correctly, and implement the exact Matrix rain, terminal log, clock, and stat bar animations.">
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Music, Mail, Lock, User, ArrowRight, Loader2, KeyRound, Eye, EyeOff, Terminal, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const TERMINAL_LINES = [
  'initializing session handshake...',
  'resolving node cluster 10.114.2.0/24',
  'mounting virtual filesystem [ok]',
  'requesting auth token exchange',
  'token accepted — scope: read/write',
  'indexing 48213 objects',
  'building dependency graph...',
  'compiling module cache (312/312)',
  'verifying checksum: 9f3a1c...e02b  [match]',
  'opening secure channel on port 8443',
  'syncing shard 3 of 7',
  'syncing shard 4 of 7',
  'applying patch delta 0447',
  'rebuilding search index...',
  'flushing write buffer',
  'session integrity check passed',
  'all systems nominal'
];

const GLYPHS = 'アイウエオカキクケコサシスセソ0123456789ABCDEF$#%&';

const Login = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [clockTime, setClockTime] = useState('00:00:00');
  const [terminalText, setTerminalText] = useState<string[]>([]);

  const [stat1, setStat1] = useState(0);
  const [stat2, setStat2] = useState(0);
  const [stat3, setStat3] = useState(0);

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  // Matrix Rain Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fontSize = 16;
    let cols = Math.floor(window.innerWidth / fontSize);
    let drops = new Array(cols).fill(0).map(() => Math.random() * -50);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(canvas.width / fontSize);
      drops = new Array(cols).fill(0).map(() => Math.random() * -50);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let animationFrameId: number;

    const drawRain = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < cols; i++) {
        const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // leading character brighter (head of the stream)
        ctx.fillStyle = 'rgba(180, 255, 220, 0.9)';
        ctx.fillText(glyph, x, y);

        // trailing dim characters
        ctx.fillStyle = 'rgba(0, 255, 140, 0.25)';
        ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], x, y - fontSize);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationFrameId = requestAnimationFrame(drawRain);
    };

    drawRain();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Clock Tick
  useEffect(() => {
    const tickClock = () => {
      setClockTime(new Date().toTimeString().slice(0, 8));
    };
    tickClock();
    const interval = setInterval(tickClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fake Stat Bars
  useEffect(() => {
    const animateBars = () => {
      setStat1(40 + Math.random() * 60);
      setStat2(40 + Math.random() * 60);
      setStat3(40 + Math.random() * 60);
    };
    animateBars();
    const interval = setInterval(animateBars, 900);
    return () => clearInterval(interval);
  }, []);

  // Terminal Typewriter Log Simulator
  useEffect(() => {
    let lineIndex = 0;
    let charIndex = 0;
    let displayed: string[] = [];
    let timeoutId: NodeJS.Timeout;

    const typeLine = () => {
      if (lineIndex >= TERMINAL_LINES.length) {
        displayed = [];
        lineIndex = 0;
      }
      const current = TERMINAL_LINES[lineIndex];
      if (charIndex <= current.length) {
        const partial = current.slice(0, charIndex);
        setTerminalText([...displayed, partial]);
        charIndex++;
        timeoutId = setTimeout(typeLine, 18 + Math.random() * 30);
      } else {
        displayed.push(current);
        if (displayed.length > 14) displayed.shift();
        lineIndex++;
        charIndex = 0;
        timeoutId = setTimeout(typeLine, 120 + Math.random() * 250);
      }
    };

    typeLine();

    return () => clearTimeout(timeoutId);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const formattedCode = inviteCode.trim().toUpperCase();
      try {
        const { data: inviteData, error: inviteError } = await supabase
          .from('invite_codes')
          .select('code')
          .eq('code', formattedCode)
          .maybeSingle();

        if (inviteError || !inviteData) {
          toast.error("Invalid Invite Code!");
          setLoading(false);
          return;
        }
      } catch (error) {
        toast.error("Invalid Invite Code!");
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
              full_name: username.trim()
            }
          }
        });
        if (error) throw error;
        toast.success("Sign up successful! Please check your email for verification.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black font-mono">
      {/* Matrix Rain Background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 select-none pointer-events-none" />

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-black/75 z-0 pointer-events-none" />

      {/* Terminal Log Console (Left Side on Desktop) */}
      <div className="hidden lg:flex flex-col border border-white/10 bg-black/60 backdrop-blur-md rounded-[2rem] p-6 w-96 h-[450px] absolute left-12 top-1/2 -translate-y-1/2 z-10 text-left overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="text-green-400" size={16} />
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">System Terminal</span>
          </div>
          <span className="text-xs font-bold text-zinc-500">{clockTime}</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 text-xs font-mono text-green-400/80 no-scrollbar">
          {terminalText.map((line, idx) => {
            const isLast = idx === terminalText.length - 1;
            return (
              <div key={idx} className="truncate">
                <span className={isLast ? "text-green-400 font-bold" : "text-green-600/60"}>
                  {isLast ? "$ " : "> "}
                </span>
                {line}
              </div>
            );
          })}
          <span className="inline-block w-1.5 h-3.5 bg-green-400 animate-pulse ml-1" />
        </div>
      </div>

      {/* Stat Panels (Bottom Right on Desktop) */}
      <div className="hidden lg:block fixed bottom-10 right-10 text-right space-y-3 z-10 text-[rgba(150,255,200,0.75)] text-[10px] select-none">
        <div className="flex items-center justify-end gap-3">
          <span className="font-black uppercase tracking-widest">THROUGHPUT</span>
          <div className="w-36 h-2 bg-[rgba(0,255,140,0.1)] border border-[rgba(0,255,140,0.3)] rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 bg-[rgba(0,255,140,0.6)] transition-all duration-300" style={{ width: `${stat1}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <span className="font-black uppercase tracking-widest">INTEGRITY</span>
          <div className="w-36 h-2 bg-[rgba(0,255,140,0.1)] border border-[rgba(0,255,140,0.3)] rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 bg-[rgba(0,255,140,0.6)] transition-all duration-300" style={{ width: `${stat2}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <span className="font-black uppercase tracking-widest">SYNC</span>
          <div className="w-36 h-2 bg-[rgba(0,255,140,0.1)] border border-[rgba(0,255,140,0.3)] rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 bg-[rgba(0,255,140,0.6)] transition-all duration-300" style={{ width: `${stat3}%` }} />
          </div>
        </div>
      </div>

      {/* Authentication Card */}
      <div className="relative w-full max-w-[340px] space-y-6 bg-black/70 backdrop-blur-2xl p-8 rounded-[2rem] border border-[rgba(0,255,140,0.35)] shadow-[0_0_35px_rgba(0,255,140,0.15)] animate-in fade-in zoom-in duration-700 z-20">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center p-3 bg-[rgba(0,255,140,0.1)] rounded-2xl mb-1.5 border border-[rgba(0,255,140,0.3)] shadow-[0_0_20px_rgba(0,255,140,0.2)]">
            <Music className="text-green-400 animate-pulse" size={20} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter italic text-white">anbae</h1>
          <p className="text-green-400 font-black text-[10px] tracking-[0.25em] uppercase">
            {isSignUp ? 'REGISTER' : 'AUTHORIZE'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="group relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-400/40 group-focus-within:text-green-400 transition-colors" size={14} />
              <Input
                type="text"
                placeholder="USERNAME"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 bg-black/40 border-[rgba(0,255,140,0.2)] h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-green-400/40 focus-visible:bg-black transition-all text-white placeholder:text-zinc-600 font-bold uppercase text-[10px] tracking-wider"
                required
              />
            </div>
          )}

          <div className="group relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-400/40 group-focus-within:text-green-400 transition-colors" size={14} />
            <Input
              type="email"
              placeholder="EMAIL ADDR"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-black/40 border-[rgba(0,255,140,0.2)] h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-green-400/40 focus-visible:bg-black transition-all text-white placeholder:text-zinc-600 font-bold uppercase text-[10px] tracking-wider"
              required
            />
          </div>

          <div className="group relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-400/40 group-focus-within:text-green-400 transition-colors" size={14} />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="ACCESS PHRASE"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-black/40 border-[rgba(0,255,140,0.2)] h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-green-400/40 focus-visible:bg-black transition-all text-white placeholder:text-zinc-600 font-bold uppercase text-[10px] tracking-wider"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400/20 hover:text-green-400 transition-colors"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {isSignUp && (
            <div className="group relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-400/40 group-focus-within:text-green-400 transition-colors" size={14} />
              <Input
                type="text"
                placeholder="INVITE CODE"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="pl-10 bg-black/40 border-[rgba(0,255,140,0.2)] h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-green-400/40 focus-visible:bg-black transition-all text-white placeholder:text-zinc-600 font-bold tracking-[0.2em] text-[10px]"
                required
              />
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-11 rounded-xl font-black text-[11px] uppercase tracking-[0.25em] shadow-xl shadow-green-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] bg-green-600 hover:bg-green-500 text-white border border-green-500/20"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <span className="flex items-center justify-center gap-2">
                {isSignUp ? 'COMPILE' : 'ACCESS'}
                <ArrowRight size={14} />
              </span>
            )}
          </Button>
        </form>

        <div className="text-center space-y-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[9px] font-black text-green-400/50 hover:text-green-400 transition-all uppercase tracking-[0.15em] border border-[rgba(0,255,140,0.15)] px-4 py-1.5 rounded-full hover:bg-[rgba(0,255,140,0.03)]"
          >
            {isSignUp ? 'Return to Access' : "Generate Guest Key"}
          </button>

          {isSignUp && (
            <div className="flex gap-2.5 p-3 rounded-2xl bg-black/30 border border-[rgba(0,255,140,0.15)] animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
              <ShieldAlert size={12} className="text-green-400 shrink-0 mt-0.5" />
              <p className="text-[8px] text-green-400/75 leading-relaxed font-semibold">
                Access is restricted to invitees. Contact node master <a href="https://www.instagram.com/11x13y/" target="_blank" rel="noopener noreferrer" className="text-white hover:underline font-bold">11x13y</a> for a decryption code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useMusic } from '@/context/MusicContext';
import { Song, musicApi } from '@/services/musicApi';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Coffee, Flame, 
  CloudRain, Keyboard, Trees, Music4, Sparkles, BookOpen, 
  CheckSquare, Trash2, Compass, Disc, Sliders, ArrowRightLeft,
  ListMusic, HelpCircle
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { getHighResImage } from '@/lib/image-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

// Cozy Backgrounds
const BACKGROUNDS = [
  {
    id: 'cozy-room',
    name: 'Cozy Room',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1600',
  },
  {
    id: 'rainy-window',
    name: 'Rainy Window',
    url: 'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?q=80&w=1600',
  },
  {
    id: 'cafe',
    name: 'Cozy Cafe',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1600',
  },
  {
    id: 'starry-night',
    name: 'Starry Night',
    url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1600',
  }
];

// Ambient Sounds Config with 100% hotlink-friendly GitHub Raw CDN streams
const AMBIENT_SOUNDS = [
  { id: 'rain', name: 'Rainfall', icon: CloudRain, url: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Ambient-Sounds-Tribute/main/sounds/rain.mp3' },
  { id: 'fire', name: 'Campfire', icon: Flame, url: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Ambient-Sounds-Tribute/main/sounds/fire.mp3' },
  { id: 'cafe', name: 'Cafe Chatter', icon: Coffee, url: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Ambient-Sounds-Tribute/main/sounds/cafe.mp3' },
  { id: 'keyboard', name: 'Keyboard', icon: Keyboard, url: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Ambient-Sounds-Tribute/main/sounds/keyboard.mp3' },
  { id: 'forest', name: 'Forest Wind', icon: Trees, url: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Ambient-Sounds-Tribute/main/sounds/forest.mp3' },
];

const Lofi = () => {
  const { pauseSong, likedSongs, recentlyPlayed } = useMusic();
  
  // Background State
  const [currentBg, setCurrentBg] = useState(BACKGROUNDS[0]);

  // Deck A States
  const [songA, setSongA] = useState<Song | null>(null);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [volumeA, setVolumeA] = useState(0.5);
  const [speedA, setSpeedA] = useState(0.85); // Slowed default
  const audioRefA = useRef<HTMLAudioElement | null>(null);

  // Deck B States
  const [songB, setSongB] = useState<Song | null>(null);
  const [isPlayingB, setIsPlayingB] = useState(false);
  const [volumeB, setVolumeB] = useState(0.5);
  const [speedB, setSpeedB] = useState(0.85); // Slowed default
  const audioRefB = useRef<HTMLAudioElement | null>(null);

  // Crossfader State (0 = All Deck A, 1 = All Deck B, 0.5 = Equal)
  const [crossfader, setCrossfader] = useState(0.5);

  // Ambient Sounds State
  const [ambientVolumes, setAmbientVolumes] = useState<Record<string, number>>({
    rain: 0,
    fire: 0,
    cafe: 0,
    keyboard: 0,
    forest: 0,
  });

  // Refs for DOM Audio Elements
  const ambientRefs = {
    rain: useRef<HTMLAudioElement | null>(null),
    fire: useRef<HTMLAudioElement | null>(null),
    cafe: useRef<HTMLAudioElement | null>(null),
    keyboard: useRef<HTMLAudioElement | null>(null),
    forest: useRef<HTMLAudioElement | null>(null),
  };

  // Pomodoro Timer State
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Notepad State
  const [notes, setNotes] = useState('');

  // Initialize Decks
  useEffect(() => {
    audioRefA.current = new Audio();
    audioRefA.current.loop = true;
    audioRefB.current = new Audio();
    audioRefB.current.loop = true;

    // Load saved notes
    const savedNotes = localStorage.getItem('anbae_lofi_notes');
    if (savedNotes) setNotes(savedNotes);

    return () => {
      if (audioRefA.current) audioRefA.current.pause();
      if (audioRefB.current) audioRefB.current.pause();
      // Pause all ambient sounds on unmount
      Object.values(ambientRefs).forEach(ref => {
        if (ref.current) ref.current.pause();
      });
    };
  }, []);

  // Apply Volumes based on Crossfader
  useEffect(() => {
    if (audioRefA.current) {
      const factorA = Math.cos((crossfader * Math.PI) / 2);
      audioRefA.current.volume = volumeA * factorA;
    }
    if (audioRefB.current) {
      const factorB = Math.sin((crossfader * Math.PI) / 2);
      audioRefB.current.volume = volumeB * factorB;
    }
  }, [volumeA, volumeB, crossfader]);

  // Apply Playback Speeds (Slowed & Reverb effect)
  useEffect(() => {
    if (audioRefA.current) audioRefA.current.playbackRate = speedA;
  }, [speedA]);

  useEffect(() => {
    if (audioRefB.current) audioRefB.current.playbackRate = speedB;
  }, [speedB]);

  // Load Song into Deck A
  const loadSongA = async (song: Song) => {
    if (!audioRefA.current) return;
    const toastId = toast.loading(`Loading ${song.name} into Deck A...`);
    try {
      pauseSong(); // Pause main app player
      const details = await musicApi.getSongDetails(song.id);
      const streams = details?.downloadUrl || song.downloadUrl || [];
      const stream = streams.find(s => s.quality === '320kbps') || streams[streams.length - 1];
      const url = stream?.url || (song as any).url;

      if (!url) throw new Error("No stream URL");

      audioRefA.current.src = url.replace('http://', 'https://');
      audioRefA.current.load();
      setSongA(song);
      setIsPlayingA(false);
      toast.success(`Loaded into Deck A!`, { id: toastId });
    } catch (e) {
      toast.error("Failed to load song", { id: toastId });
    }
  };

  // Load Song into Deck B
  const loadSongB = async (song: Song) => {
    if (!audioRefB.current) return;
    const toastId = toast.loading(`Loading ${song.name} into Deck B...`);
    try {
      pauseSong(); // Pause main app player
      const details = await musicApi.getSongDetails(song.id);
      const streams = details?.downloadUrl || song.downloadUrl || [];
      const stream = streams.find(s => s.quality === '320kbps') || streams[streams.length - 1];
      const url = stream?.url || (song as any).url;

      if (!url) throw new Error("No stream URL");

      audioRefB.current.src = url.replace('http://', 'https://');
      audioRefB.current.load();
      setSongB(song);
      setIsPlayingB(false);
      toast.success(`Loaded into Deck B!`, { id: toastId });
    } catch (e) {
      toast.error("Failed to load song", { id: toastId });
    }
  };

  // Toggle Play Deck A
  const togglePlayA = () => {
    if (!audioRefA.current || !songA) return;
    if (isPlayingA) {
      audioRefA.current.pause();
      setIsPlayingA(false);
    } else {
      pauseSong();
      audioRefA.current.play().catch(() => {});
      setIsPlayingA(true);
    }
  };

  // Toggle Play Deck B
  const togglePlayB = () => {
    if (!audioRefB.current || !songB) return;
    if (isPlayingB) {
      audioRefB.current.pause();
      setIsPlayingB(false);
    } else {
      pauseSong();
      audioRefB.current.play().catch(() => {});
      setIsPlayingB(true);
    }
  };

  // Handle Ambient Volume Changes
  const handleAmbientVolumeChange = (id: 'rain' | 'fire' | 'cafe' | 'keyboard' | 'forest', value: number) => {
    setAmbientVolumes(prev => ({ ...prev, [id]: value }));
    
    const audio = ambientRefs[id].current;
    if (audio) {
      audio.volume = value;
      if (value > 0) {
        pauseSong(); // Pause main app player
        if (audio.paused) {
          audio.play().catch((err) => {
            console.error(`Failed to play ambient sound ${id}:`, err);
          });
        }
      } else {
        audio.pause();
      }
    }
  };

  // Pomodoro Timer Logic
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setIsTimerRunning(false);
            if (timerMode === 'focus') {
              toast.success("Focus session complete! Take a break.");
              setTimerMode('break');
              return 5 * 60;
            } else {
              toast.success("Break over! Time to focus.");
              setTimerMode('focus');
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timerMode]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(timerMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    localStorage.setItem('anbae_lofi_notes', val);
  };

  const clearNotes = () => {
    setNotes('');
    localStorage.removeItem('anbae_lofi_notes');
    toast.success("Notes cleared!");
  };

  // Combine Liked and Recent songs for selection
  const availableSongs = [...likedSongs, ...recentlyPlayed].filter(
    (v, i, a) => a.findIndex(t => t.id === v.id) === i
  );

  return (
    <MainLayout>
      {/* Hidden DOM Audio Elements for Ambient Sounds to guarantee browser playback */}
      {AMBIENT_SOUNDS.map(sound => (
        <audio 
          key={sound.id}
          ref={ambientRefs[sound.id as 'rain' | 'fire' | 'cafe' | 'keyboard' | 'forest']}
          src={sound.url}
          loop
          preload="auto"
          className="hidden"
        />
      ))}

      <div 
        className="relative min-h-[calc(100vh-80px)] w-full p-4 md:p-10 transition-all duration-1000 ease-in-out bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.95)), url(${currentBg.url})` }}
      >
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/20 p-2 rounded-xl">
                  <Sliders className="text-primary animate-pulse" size={20} />
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold">LOFI DJ MIXER</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Personal Lofi Mixer</h1>
              <p className="text-xs md:text-sm text-white/60 font-medium">Load your favorite songs, slow them down, and mix them with cozy ambient sounds.</p>
            </div>

            {/* Background Switcher */}
            <div className="flex flex-wrap gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
              {BACKGROUNDS.map(bg => (
                <button
                  key={bg.id}
                  onClick={() => setCurrentBg(bg)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${currentBg.id === bg.id ? 'bg-primary text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                  {bg.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Left Column: Dual DJ Decks & Crossfader */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              
              {/* DJ Mixer Console */}
              <Card className="bg-black/60 backdrop-blur-2xl border-white/10 p-6 rounded-3xl text-white shadow-2xl">
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                  <h3 className="font-black text-lg flex items-center gap-2">
                    <Disc className="text-primary animate-spin" style={{ animationDuration: '4s' }} size={20} />
                    Dual-Deck Console
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-white/40">
                    <HelpCircle size={14} />
                    <span>Slow down speed for Slowed & Reverb vibe</span>
                  </div>
                </div>

                {/* Decks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                  
                  {/* DECK A */}
                  <div className="space-y-5 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500/20 text-blue-400 border-none font-bold">DECK A</Badge>
                      
                      {/* Song Selector A */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 text-xs font-bold gap-1.5">
                            <ListMusic size={14} />
                            {songA ? 'Change Song' : 'Load Song'}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 bg-zinc-950 border-white/10 text-white max-h-60 overflow-y-auto rounded-xl">
                          <DropdownMenuLabel className="text-xs text-white/40">Your Library</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/5" />
                          {availableSongs.length > 0 ? (
                            availableSongs.map(song => (
                              <DropdownMenuItem 
                                key={song.id} 
                                onClick={() => loadSongA(song)}
                                className="text-xs font-bold cursor-pointer hover:bg-primary/20 rounded-lg m-1"
                              >
                                <span dangerouslySetInnerHTML={{ __html: song.name }} className="truncate" />
                              </DropdownMenuItem>
                            ))
                          ) : (
                            <div className="p-3 text-center text-xs text-white/40">No songs in library. Heart some songs first!</div>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Deck A Visualizer / Disc */}
                    <div className="flex flex-col items-center text-center py-4">
                      <div className={`relative w-24 h-24 rounded-full bg-zinc-900 border-4 border-blue-500/30 flex items-center justify-center shadow-2xl transition-transform duration-1000 ${isPlayingA ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
                        {songA ? (
                          <img src={getHighResImage(songA.image)} alt="" className="absolute inset-0 w-full h-full object-cover rounded-full opacity-60" />
                        ) : null}
                        <div className="w-6 h-6 rounded-full bg-black border-2 border-white/20 z-10" />
                      </div>

                      <div className="mt-4 min-h-[48px] max-w-[200px]">
                        <h4 className="font-black text-sm truncate" dangerouslySetInnerHTML={{ __html: songA?.name || 'Empty Deck' }}></h4>
                        <p className="text-[10px] text-white/40 truncate mt-0.5" dangerouslySetInnerHTML={{ __html: songA?.primaryArtists || 'Select a song above' }}></p>
                      </div>
                    </div>

                    {/* Deck A Controls */}
                    <div className="space-y-4 border-t border-white/5 pt-4">
                      <div className="flex items-center justify-center">
                        <Button 
                          onClick={togglePlayA}
                          disabled={!songA}
                          className={`rounded-full w-12 h-12 flex items-center justify-center shadow-lg ${isPlayingA ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white/10 hover:bg-white/20'} text-white`}
                        >
                          {isPlayingA ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                        </Button>
                      </div>

                      {/* Speed / Pitch Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-white/60">
                          <span>Slowed & Reverb Speed</span>
                          <span className="text-blue-400 font-mono">{speedA.toFixed(2)}x</span>
                        </div>
                        <Slider 
                          value={[speedA * 100]} 
                          min={70} 
                          max={120} 
                          step={1}
                          onValueChange={([val]) => setSpeedA(val / 100)}
                          className="cursor-pointer"
                        />
                      </div>

                      {/* Volume Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-white/60">
                          <span>Deck Volume</span>
                          <span className="font-mono">{Math.round(volumeA * 100)}%</span>
                        </div>
                        <Slider 
                          value={[volumeA * 100]} 
                          max={100} 
                          step={1}
                          onValueChange={([val]) => setVolumeA(val / 100)}
                          className="cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* DECK B */}
                  <div className="space-y-5 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-500/20 text-purple-400 border-none font-bold">DECK B</Badge>
                      
                      {/* Song Selector B */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 text-xs font-bold gap-1.5">
                            <ListMusic size={14} />
                            {songB ? 'Change Song' : 'Load Song'}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 bg-zinc-950 border-white/10 text-white max-h-60 overflow-y-auto rounded-xl">
                          <DropdownMenuLabel className="text-xs text-white/40">Your Library</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/5" />
                          {availableSongs.length > 0 ? (
                            availableSongs.map(song => (
                              <DropdownMenuItem 
                                key={song.id} 
                                onClick={() => loadSongB(song)}
                                className="text-xs font-bold cursor-pointer hover:bg-primary/20 rounded-lg m-1"
                              >
                                <span dangerouslySetInnerHTML={{ __html: song.name }} className="truncate" />
                              </DropdownMenuItem>
                            ))
                          ) : (
                            <div className="p-3 text-center text-xs text-white/40">No songs in library. Heart some songs first!</div>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Deck B Visualizer / Disc */}
                    <div className="flex flex-col items-center text-center py-4">
                      <div className={`relative w-24 h-24 rounded-full bg-zinc-900 border-4 border-purple-500/30 flex items-center justify-center shadow-2xl transition-transform duration-1000 ${isPlayingB ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
                        {songB ? (
                          <img src={getHighResImage(songB.image)} alt="" className="absolute inset-0 w-full h-full object-cover rounded-full opacity-60" />
                        ) : null}
                        <div className="w-6 h-6 rounded-full bg-black border-2 border-white/20 z-10" />
                      </div>

                      <div className="mt-4 min-h-[48px] max-w-[200px]">
                        <h4 className="font-black text-sm truncate" dangerouslySetInnerHTML={{ __html: songB?.name || 'Empty Deck' }}></h4>
                        <p className="text-[10px] text-white/40 truncate mt-0.5" dangerouslySetInnerHTML={{ __html: songB?.primaryArtists || 'Select a song above' }}></p>
                      </div>
                    </div>

                    {/* Deck B Controls */}
                    <div className="space-y-4 border-t border-white/5 pt-4">
                      <div className="flex items-center justify-center">
                        <Button 
                          onClick={togglePlayB}
                          disabled={!songB}
                          className={`rounded-full w-12 h-12 flex items-center justify-center shadow-lg ${isPlayingB ? 'bg-purple-600 hover:bg-purple-700' : 'bg-white/10 hover:bg-white/20'} text-white`}
                        >
                          {isPlayingB ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                        </Button>
                      </div>

                      {/* Speed / Pitch Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-white/60">
                          <span>Slowed & Reverb Speed</span>
                          <span className="text-purple-400 font-mono">{speedB.toFixed(2)}x</span>
                        </div>
                        <Slider 
                          value={[speedB * 100]} 
                          min={70} 
                          max={120} 
                          step={1}
                          onValueChange={([val]) => setSpeedB(val / 100)}
                          className="cursor-pointer"
                        />
                      </div>

                      {/* Volume Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-white/60">
                          <span>Deck Volume</span>
                          <span className="font-mono">{Math.round(volumeB * 100)}%</span>
                        </div>
                        <Slider 
                          value={[volumeB * 100]} 
                          max={100} 
                          step={1}
                          onValueChange={([val]) => setVolumeB(val / 100)}
                          className="cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Crossfader Console */}
                <div className="mt-8 border-t border-white/5 pt-6 max-w-md mx-auto space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-white/60">
                    <span className="text-blue-400">Deck A</span>
                    <span className="flex items-center gap-1 text-white/40">
                      <ArrowRightLeft size={12} />
                      Crossfader
                    </span>
                    <span className="text-purple-400">Deck B</span>
                  </div>
                  <Slider 
                    value={[crossfader * 100]} 
                    max={100} 
                    step={1}
                    onValueChange={([val]) => setCrossfader(val / 100)}
                    className="cursor-pointer"
                  />
                </div>
              </Card>

              {/* Ambient Sound Mixer Card */}
              <Card className="bg-black/40 backdrop-blur-xl border-white/10 p-6 rounded-3xl text-white">
                <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                  <Compass className="text-primary" size={18} />
                  Ambient Sound Mixer
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {AMBIENT_SOUNDS.map(sound => {
                    const Icon = sound.icon;
                    const vol = ambientVolumes[sound.id];
                    return (
                      <div key={sound.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                        <div className={`p-3 rounded-xl transition-all ${vol > 0 ? 'bg-primary text-white' : 'bg-white/5 text-white/60'}`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{sound.name}</span>
                            <span className="text-[10px] text-white/40 font-mono">{Math.round(vol * 100)}%</span>
                          </div>
                          <Slider 
                            value={[vol * 100]} 
                            max={100} 
                            step={1}
                            onValueChange={([val]) => handleAmbientVolumeChange(sound.id as any, val / 100)}
                            className="cursor-pointer"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

            </div>

            {/* Right Column: Pomodoro Timer & Notepad */}
            <div className="space-y-6 md:space-y-8">
              
              {/* Pomodoro Timer Card */}
              <Card className="bg-black/40 backdrop-blur-xl border-white/10 p-6 rounded-3xl text-white text-center">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-lg flex items-center gap-2">
                    <BookOpen className="text-primary" size={18} />
                    Focus Timer
                  </h3>
                  <Badge className={`${timerMode === 'focus' ? 'bg-primary/20 text-primary' : 'bg-green-500/20 text-green-400'} border-none text-[10px] font-bold uppercase`}>
                    {timerMode}
                  </Badge>
                </div>

                <div className="py-6">
                  <h2 className="text-6xl font-black tracking-tighter font-mono text-white mb-2">
                    {formatTime(timeLeft)}
                  </h2>
                  <p className="text-xs text-white/40 font-medium">
                    {timerMode === 'focus' ? 'Time to concentrate and study.' : 'Take a deep breath and relax.'}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <Button 
                    onClick={toggleTimer}
                    className={`rounded-xl font-bold px-6 h-11 ${isTimerRunning ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-primary text-white hover:bg-primary/90'}`}
                  >
                    {isTimerRunning ? 'Pause' : 'Start Focus'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetTimer}
                    className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl h-11 px-4"
                  >
                    <RotateCcw size={16} />
                  </Button>
                </div>
              </Card>

              {/* Cozy Notepad Card */}
              <Card className="bg-black/40 backdrop-blur-xl border-white/10 p-6 rounded-3xl text-white flex flex-col h-[280px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-lg flex items-center gap-2">
                    <CheckSquare className="text-primary" size={18} />
                    Study Notes
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={clearNotes}
                    className="text-white/40 hover:text-destructive hover:bg-destructive/10 rounded-xl h-8 w-8"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

                <Textarea 
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Write down your tasks, thoughts, or study goals here..."
                  className="flex-1 bg-white/5 border-none resize-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20 text-xs md:text-sm leading-relaxed placeholder:text-white/30 text-white"
                />
              </Card>

            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Lofi;
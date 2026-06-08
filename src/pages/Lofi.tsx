"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useMusic } from '@/context/MusicContext';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Coffee, Flame, 
  CloudRain, Keyboard, Trees, Music4, Sparkles, BookOpen, 
  CheckSquare, Trash2, ChevronRight, Moon, Sun, Compass
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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

// Lofi Tracks
const LOFI_TRACKS = [
  { id: 'track-1', title: 'Morning Coffee', artist: 'Lofi Dreams', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'track-2', title: 'Rainy Day Study', artist: 'Chillhop Cafe', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'track-3', title: 'Late Night Vibes', artist: 'Sleepy Head', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 'track-4', title: 'Cozy Fireplace', artist: 'Aesthetic Beats', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
];

// Ambient Sounds Config
const AMBIENT_SOUNDS = [
  { id: 'rain', name: 'Rainfall', icon: CloudRain, url: 'https://www.soundjay.com/nature/sounds/rain-07.mp3' },
  { id: 'fire', name: 'Campfire', icon: Flame, url: 'https://www.soundjay.com/nature/sounds/fire-1.mp3' },
  { id: 'cafe', name: 'Cafe Chatter', icon: Coffee, url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav' },
  { id: 'keyboard', name: 'Keyboard', icon: Keyboard, url: 'https://www.soundjay.com/mechanical/sounds/computer-keyboard-1.mp3' },
  { id: 'forest', name: 'Forest Wind', icon: Trees, url: 'https://www.soundjay.com/nature/sounds/forest-wind-1.mp3' },
];

const Lofi = () => {
  const { pauseSong } = useMusic(); // To pause main player when lofi starts
  
  // Background State
  const [currentBg, setCurrentBg] = useState(BACKGROUNDS[0]);

  // Lofi Music Player State
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isLofiPlaying, setIsLofiPlaying] = useState(false);
  const [lofiVolume, setLofiVolume] = useState(0.5);
  const lofiAudioRef = useRef<HTMLAudioElement | null>(null);

  // Ambient Sounds State
  const [ambientVolumes, setAmbientVolumes] = useState<Record<string, number>>({
    rain: 0,
    fire: 0,
    cafe: 0,
    keyboard: 0,
    forest: 0,
  });
  const ambientRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  // Pomodoro Timer State
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Notepad State
  const [notes, setNotes] = useState('');

  // Initialize Lofi Audio
  useEffect(() => {
    lofiAudioRef.current = new Audio(LOFI_TRACKS[currentTrackIdx].url);
    lofiAudioRef.current.loop = true;
    
    return () => {
      if (lofiAudioRef.current) {
        lofiAudioRef.current.pause();
      }
    };
  }, []);

  // Handle Track Change
  useEffect(() => {
    if (lofiAudioRef.current) {
      const wasPlaying = isLofiPlaying;
      lofiAudioRef.current.pause();
      lofiAudioRef.current.src = LOFI_TRACKS[currentTrackIdx].url;
      lofiAudioRef.current.volume = lofiVolume;
      if (wasPlaying) {
        lofiAudioRef.current.play().catch(() => {});
      }
    }
  }, [currentTrackIdx]);

  // Handle Lofi Volume Change
  useEffect(() => {
    if (lofiAudioRef.current) {
      lofiAudioRef.current.volume = lofiVolume;
    }
  }, [lofiVolume]);

  // Initialize Ambient Audios
  useEffect(() => {
    AMBIENT_SOUNDS.forEach(sound => {
      const audio = new Audio(sound.url);
      audio.loop = true;
      audio.volume = 0;
      ambientRefs.current[sound.id] = audio;
    });

    // Load saved notes
    const savedNotes = localStorage.getItem('anbae_lofi_notes');
    if (savedNotes) setNotes(savedNotes);

    return () => {
      Object.values(ambientRefs.current).forEach(audio => {
        if (audio) audio.pause();
      });
    };
  }, []);

  // Handle Ambient Volume Changes
  const handleAmbientVolumeChange = (id: string, value: number) => {
    setAmbientVolumes(prev => ({ ...prev, [id]: value }));
    const audio = ambientRefs.current[id];
    if (audio) {
      audio.volume = value;
      if (value > 0 && audio.paused) {
        // Pause main music player to avoid chaos
        pauseSong();
        audio.play().catch(() => {});
      } else if (value === 0 && !audio.paused) {
        audio.pause();
      }
    }
  };

  // Toggle Lofi Music Play/Pause
  const toggleLofiPlay = () => {
    if (!lofiAudioRef.current) return;

    if (isLofiPlaying) {
      lofiAudioRef.current.pause();
      setIsLofiPlaying(false);
    } else {
      // Pause main app music player
      pauseSong();
      lofiAudioRef.current.play().catch(() => {});
      setIsLofiPlaying(true);
      toast.info(`Playing: ${LOFI_TRACKS[currentTrackIdx].title}`);
    }
  };

  // Next Track
  const nextTrack = () => {
    setCurrentTrackIdx(prev => (prev + 1) % LOFI_TRACKS.length);
  };

  // Prev Track
  const prevTrack = () => {
    setCurrentTrackIdx(prev => (prev - 1 + LOFI_TRACKS.length) % LOFI_TRACKS.length);
  };

  // Pomodoro Timer Logic
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setIsTimerRunning(false);
            // Switch modes
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

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(timerMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Save Notes
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

  return (
    <MainLayout>
      {/* Cozy Background Wrapper */}
      <div 
        className="relative min-h-[calc(100vh-80px)] w-full p-4 md:p-10 transition-all duration-1000 ease-in-out bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.75), rgba(0,0,0,0.9)), url(${currentBg.url})` }}
      >
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/20 p-2 rounded-xl">
                  <Music4 className="text-primary" size={20} />
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold">FOCUS SPACE</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Lofi Focus Beats</h1>
              <p className="text-xs md:text-sm text-white/60 font-medium">Customize your ambient environment for study, work, or relaxation.</p>
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
            
            {/* Left Column: Lofi Player & Ambient Mixer */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              
              {/* Lofi Music Player Card */}
              <Card className="bg-black/40 backdrop-blur-xl border-white/10 p-6 rounded-3xl text-white">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-lg flex items-center gap-2">
                    <Sparkles className="text-primary" size={18} />
                    Lofi Radio
                  </h3>
                  <Badge className="bg-primary/20 text-primary border-none text-[10px] font-bold">HQ STREAM</Badge>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Cozy Vinyl/Disc Art */}
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-zinc-900 border-4 border-white/10 flex items-center justify-center shadow-2xl shrink-0 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 animate-spin duration-10000 ${isLofiPlaying ? 'running' : 'paused'}`} />
                    <Music4 size={32} className="text-primary relative z-10" />
                  </div>

                  {/* Track Info & Controls */}
                  <div className="flex-1 text-center md:text-left space-y-4 w-full">
                    <div>
                      <h4 className="text-xl font-black tracking-tight">{LOFI_TRACKS[currentTrackIdx].title}</h4>
                      <p className="text-xs text-white/60 font-medium mt-0.5">{LOFI_TRACKS[currentTrackIdx].artist}</p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center md:justify-start gap-4">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={prevTrack}
                        className="text-white/60 hover:text-white hover:bg-white/5 rounded-full"
                      >
                        <RotateCcw size={18} className="transform -scale-x-100" />
                      </Button>

                      <Button 
                        onClick={toggleLofiPlay}
                        className="bg-primary text-white hover:bg-primary/90 rounded-full w-12 h-12 flex items-center justify-center shadow-lg shadow-primary/20"
                      >
                        {isLofiPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                      </Button>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={nextTrack}
                        className="text-white/60 hover:text-white hover:bg-white/5 rounded-full"
                      >
                        <RotateCcw size={18} />
                      </Button>
                    </div>

                    {/* Volume Slider */}
                    <div className="flex items-center gap-3 max-w-xs mx-auto md:mx-0">
                      <VolumeX size={16} className="text-white/40" />
                      <Slider 
                        value={[lofiVolume * 100]} 
                        max={100} 
                        step={1}
                        onValueChange={([val]) => setLofiVolume(val / 100)}
                        className="flex-1 cursor-pointer"
                      />
                      <Volume2 size={16} className="text-white/60" />
                    </div>
                  </div>
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
                            onValueChange={([val]) => handleAmbientVolumeChange(sound.id, val / 100)}
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
' character in the terminal log and ensuring all animations are functional.">
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Music, Mail, Lock, User, ArrowRight, Loader2, KeyRound, Eye, EyeOff, Terminal, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

const GLYPHS = 'アイウエオカキクケコサシスセソ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

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
  const rainDropsRef = useRef<number[]>([]);
  
  const [terminalText, setTerminalText] = useState<string[]>([]);
  const [clockTime, setClockTime] = useState('');

  const [stat1, setStat1] = useState(85);
  const [stat2, setStat2] = useState(42);
  const [stat3, setStat3] = useState(64);

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const fontSize = 14;
      const columns = Math.ceil(canvas.width / fontSize);
      rainDropsRef.current = Array(columns).fill(1).map(() => Math.random() * -50);
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const fontSize = 14;
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < rainDropsRef.current.length; i++) {
        const text = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const x = i * fontSize;
        const y = rainDropsRef.current[i] * fontSize;

        ctx.fillStyle = 'rgba(180, 255, 220, 0.9)';
        ctx.fillText(text, x, y);

        ctx.fillStyle = 'rgba(0, 255, 140, 0.25)';
        ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], x, y - fontSize);

        if (y > canvas.height && Math.random() > 0.975) {
          rainDropsRef.current[i] = 0;
        }
        rainDropsRef.current[i]++;
      }
    };

    const interval = setInterval(draw, 35);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const updateClock = () => {
      setClockTime(new Date().toTimeString().slice(0, 8));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStat1(Math.floor(40 + Math.random() * 60));
      setStat2(Math.floor(40 + Math.random() * 60));
      setStat3(Math.floor(40 + Math.random() * 60));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let lineIdx = 0;
    let charIdx = 0;
    let currentLineText = '';
    let accumulated: string[] = [];

    const interval = setInterval(() => {
      if (lineIdx >= TERMINAL_LINES.length) {
        accumulated = [];
        lineIdx = 0;
      }
      
      const text = TERMINAL_LINES[lineIdx];
      if (charIdx <= text.length) {
        currentLineText = text.substring(0, charIdx);
        setTerminalText([...accumulated, currentLineText]);
        charIdx++;
      } else {
        accumulated.push(text);
        if (accumulated.length > 14) accumulated.shift();
        lineIdx++;
        charIdx = 0;
      }
    }, 50);

    return () => clearInterval(interval);
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
              username: username,
              full_name: username,
            },
          },
        });
        if (error) throw error;
        toast.success("Account created! Please check your email.");
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
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 block pointer-events-none opacity-40" />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/55 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#000_90%)] z-0" />

      <div className="hidden lg:block fixed top-[6%] left-[6%] w-[400px] h-[450px] bg-[#050a08]/72 border border-[rgba(0,255,140,0.35)] shadow-[0_0_25px_rgba(0,255,140,0.15),inset_0_0_30px_rgba(0,0,0,0.6)] rounded-3xl p-6 overflow-hidden backdrop-blur-[1px] text-left text-[#6dffb0] select-none text-[13px] leading-relaxed z-10">
        <div className="flex items-center justify-between border-b border-[rgba(0,255,140,0.2)] pb-2.5 mb-4 text-[rgba(150,255,200,0.5)] text-[11px]">
          <div className="flex items-center gap-2">
            <Terminal size={14} />
            <span className="font-bold uppercase tracking-widest">System Monitor</span>
          </div>
          <span className="font-bold tracking-wider">{clockTime}</span>
        </div>
        <div className="space-y-1 overflow-y-auto h-[360px] no-scrollbar">
          {terminalText.map((line, idx) => (
            <div key={idx} className={cn(
              "font-mono truncate transition-all duration-300",
              idx === terminalText.length - 1 ? "text-[#6dffb0] opacity-100 font-bold" : "opacity-40"
            )}>
              {idx === terminalText.length - 1 ? <span className="text-[#6dffb0] pr-1">></span> : <span className="text-zinc-700 pr-1">$</span>}
              {line}
            </div>
          ))}
          <span className="inline-block w-[7px] h-[13px] bg-[#6dffb0] animate-pulse align-middle" />
        </div>
      </div>

      <div className="hidden lg:block fixed bottom-[6%] right-[6%] text-right space-y-2 z-10 text-[rgba(150,255,200,0.75)] text-[11px] select-none">
        <div className="flex items-center justify-end gap-3">
          <span className="font-bold uppercase tracking-widest">THROUGHPUT</span>
          <div className="w-[140px] h-1.5 bg-[rgba(0,255,140,0.1)] border border-[rgba(0,255,140,0.3)] relative overflow-hidden rounded-full">
            <div className="absolute inset-y-0 left-0 bg-[rgba(0,255,140,0.6)] transition-all duration-300" style={{ width: `${stat1}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <span className="font-bold uppercase tracking-widest">INTEGRITY</span>
          <div className="w-[140px] h-1.5 bg-[rgba(0,255,140,0.1)] border border-[rgba(0,255,140,0.3)] relative overflow-hidden rounded-full">
            <div className="absolute inset-y-0 left-0 bg-[rgba(0,255,140,0.6)] transition-all duration-300" style={{ width: `${stat2}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <span className="font-bold uppercase tracking-widest">SYNC</span>
          <div className="w-[140px] h-1.5 bg-[rgba(0,255,140,0.1)] border border-[rgba(0,255,140,0.3)] relative overflow-hidden rounded-full">
            <div className="absolute inset-y-0 left-0 bg-[rgba(0,255,140,0.6)] transition-all duration-300" style={{ width: `${stat3}%` }} />
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-[310px] space-y-6 bg-[#050a08]/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-[rgba(0,255,140,0.35)] shadow-[0_0_35px_rgba(0,255,140,0.12)] animate-in fade-in zoom-in duration-700 z-20">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center p-3 bg-primary/20 backdrop-blur-xl rounded-2xl mb-1.5 border border-primary/30 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
            <Music className="text-primary animate-pulse" size={20} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter italic text-white">anbae</h1>
          <p className="text-primary/70 font-black text-[10px] tracking-[0.25em] uppercase">
            {isSignUp ? 'REGISTER' : 'AUTHORIZE'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="group relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={14} />
              <Input
                type="text"
                placeholder="USERNAME"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 bg-black/40 border-[rgba(0,255,140,0.2)] h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-[#050a08] transition-all text-white placeholder:text-zinc-600 font-bold uppercase text-[10px] tracking-wider"
                required
              />
            </div>
          )}

          <div className="group relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={14} />
            <Input
              type="email"
              placeholder="EMAIL ADDR"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-black/40 border-[rgba(0,255,140,0.2)] h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-[#050a08] transition-all text-white placeholder:text-zinc-600 font-bold uppercase text-[10px] tracking-wider"
              required
            />
          </div>

          <div className="group relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={14} />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="ACCESS PHRASE"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-black/40 border-[rgba(0,255,140,0.2)] h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-[#050a08] transition-all text-white placeholder:text-zinc-600 font-bold uppercase text-[10px] tracking-wider"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary/20 hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {isSignUp && (
            <div className="group relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={14} />
              <Input
                type="text"
                placeholder="INVITE CODE"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="pl-10 bg-black/40 border-[rgba(0,255,140,0.2)] h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-[#050a08] transition-all text-white placeholder:text-zinc-600 font-bold tracking-[0.2em] text-[10px]"
                required
              />
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-11 rounded-xl font-black text-[11px] uppercase tracking-[0.25em] shadow-xl shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary hover:bg-primary/90 text-white border border-primary/20"
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
            className="text-[9px] font-black text-primary/50 hover:text-primary transition-all uppercase tracking-[0.15em] border border-[rgba(0,255,140,0.15)] px-4 py-1.5 rounded-full hover:bg-[rgba(0,255,140,0.03)]"
          >
            {isSignUp ? 'Return to Access' : "Generate Guest Key"}
          </button>

          {isSignUp && (
            <div className="flex gap-2.5 p-3 rounded-2xl bg-black/30 border border-[rgba(0,255,140,0.15)] animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
              <ShieldAlert size={12} className="text-primary shrink-0 mt-0.5" />
              <p className="text-[8px] text-primary/75 leading-relaxed font-semibold">
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
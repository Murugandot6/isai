"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Music, Mail, Lock, User, ArrowRight, Loader2, Info, KeyRound, Eye, EyeOff, Terminal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Importing the local video file from the src directory
import backgroundVideo from '@/anbae.mp4';

const Login = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  // Debugging States
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  };

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  useEffect(() => {
    const playVideo = async () => {
      const video = videoRef.current;
      if (video) {
        try {
          video.muted = true;
          await video.play();
        } catch (err: any) {
          const forcePlay = () => {
            video?.play().catch(() => {});
            document.removeEventListener('click', forcePlay);
            document.removeEventListener('touchstart', forcePlay);
          };
          document.addEventListener('click', forcePlay);
          document.addEventListener('touchstart', forcePlay);
        }
      }
    };
    playVideo();
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
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-6 overflow-hidden bg-black">
      {/* Background Video with Overlay */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src={backgroundVideo}
          className="absolute inset-0 w-full h-full object-cover opacity-70 scale-105"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      </div>

      {/* Floating Debug Toggle (Glassy) */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="absolute top-4 left-4 z-50 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 backdrop-blur-md flex items-center gap-2 text-[10px] font-bold transition-all"
      >
        <Terminal size={12} />
        <span>DEBUG</span>
      </button>

      {/* Debug Panel (Glassy) */}
      {showDebug && (
        <div className="fixed bottom-4 left-4 right-4 md:right-auto md:w-80 max-h-[200px] bg-black/60 border border-white/10 rounded-2xl p-4 z-50 text-left font-mono text-[9px] text-zinc-400 flex flex-col shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <span className="font-bold text-primary">Logs</span>
            <button onClick={() => setShowDebug(false)}><X size={12} /></button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1">
            {debugLogs.map((log, idx) => <div key={idx}>{log}</div>)}
          </div>
        </div>
      )}

      {/* Glass Morphism Login Card */}
      <div className="relative w-full max-w-md space-y-8 bg-white/[0.03] backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-700 z-20">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-4 bg-primary/20 backdrop-blur-xl rounded-3xl mb-4 border border-primary/20 shadow-2xl shadow-primary/10">
            <Music className="text-primary" size={32} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic text-white">anbae</h1>
          <p className="text-white/50 font-medium text-sm tracking-wide">
            {isSignUp ? 'Join the collective' : 'Welcome back to the sound'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {isSignUp && (
            <div className="group relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-12 bg-white/[0.05] border-white/5 h-14 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-white/[0.08] transition-all text-white placeholder:text-white/20"
                required
              />
            </div>
          )}

          <div className="group relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-12 bg-white/[0.05] border-white/5 h-14 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-white/[0.08] transition-all text-white placeholder:text-white/20"
              required
            />
          </div>

          <div className="group relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12 pr-12 bg-white/[0.05] border-white/5 h-14 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-white/[0.08] transition-all text-white placeholder:text-white/20"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {isSignUp && (
            <div className="group relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
              <Input
                type="text"
                placeholder="Invite Code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="pl-12 bg-white/[0.05] border-white/5 h-14 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-white/[0.08] transition-all text-white placeholder:text-white/20 font-bold tracking-widest"
                required
              />
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary hover:bg-primary/90 text-white"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <span className="flex items-center justify-center gap-2">
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight size={18} />
              </span>
            )}
          </Button>
        </form>

        <div className="text-center space-y-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-bold text-white/40 hover:text-primary transition-all uppercase tracking-widest"
          >
            {isSignUp ? 'Already a member? Sign In' : "New here? Request Access"}
          </button>

          {isSignUp && (
            <div className="flex gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Info size={14} className="text-primary shrink-0 mt-0.5" />
              <p className="text-[10px] text-white/40 leading-relaxed text-left">
                Access is currently restricted. Contact <a href="https://www.instagram.com/11x13y/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">11x13y</a> for an invite code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
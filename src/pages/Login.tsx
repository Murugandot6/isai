"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Music, Mail, Lock, User, ArrowRight, Loader2, Info, KeyRound, Eye, EyeOff } from 'lucide-react';
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
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
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

      {/* Ultra-Compact Glass Morphism Login Card */}
      <div className="relative w-full max-w-[300px] space-y-5 bg-white/[0.03] backdrop-blur-3xl p-5 md:p-6 rounded-[1.5rem] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-700 z-20">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center p-2.5 bg-primary/20 backdrop-blur-xl rounded-xl mb-1 border border-primary/20 shadow-2xl shadow-primary/10">
            <Music className="text-primary" size={20} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter italic text-white">anbae</h1>
          <p className="text-white/40 font-medium text-[10px] tracking-wide uppercase">
            {isSignUp ? 'Join' : 'Sign In'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-3">
          {isSignUp && (
            <div className="group relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={14} />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 bg-white/[0.04] border-white/5 h-10 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-white/[0.06] transition-all text-white placeholder:text-white/10 text-xs"
                required
              />
            </div>
          )}

          <div className="group relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={14} />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-white/[0.04] border-white/5 h-10 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-white/[0.06] transition-all text-white placeholder:text-white/10 text-xs"
              required
            />
          </div>

          <div className="group relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={14} />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-white/[0.04] border-white/5 h-10 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-white/[0.06] transition-all text-white placeholder:text-white/10 text-xs"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/10 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {isSignUp && (
            <div className="group relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={14} />
              <Input
                type="text"
                placeholder="Invite Code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="pl-10 bg-white/[0.04] border-white/5 h-10 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-white/[0.06] transition-all text-white placeholder:text-white/10 font-bold tracking-widest text-xs"
                required
              />
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-10 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary hover:bg-primary/90 text-white"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <span className="flex items-center justify-center gap-2">
                {isSignUp ? 'Create' : 'Sign In'}
                <ArrowRight size={14} />
              </span>
            )}
          </Button>
        </form>

        <div className="text-center space-y-3">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[9px] font-bold text-white/30 hover:text-primary transition-all uppercase tracking-widest"
          >
            {isSignUp ? 'Back to Sign In' : "Request Access"}
          </button>

          {isSignUp && (
            <div className="flex gap-2 p-2.5 rounded-lg bg-white/[0.01] border border-white/5 animate-in fade-in slide-in-from-bottom-1 duration-500">
              <Info size={10} className="text-primary shrink-0 mt-0.5" />
              <p className="text-[8px] text-white/30 leading-relaxed text-left">
                Access is restricted. Contact <a href="https://www.instagram.com/11x13y/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">11x13y</a> for a code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
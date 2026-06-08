"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Music, Mail, Lock, User, ArrowRight, Loader2, Info, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

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

  // Robust autoplay trigger for mobile & desktop
  useEffect(() => {
    const playVideo = async () => {
      const video = videoRef.current;
      if (video) {
        try {
          video.muted = true;
          await video.play();
        } catch (err) {
          // Fallback: try playing again on first document click/touch
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
          toast.error("Invalid Invite Code! If you don't have one, please contact 11x13y on Instagram.");
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
        toast.success("Account created! Please check your email for the confirmation link.");
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
      {/* Fallback Pure Black Background & Video Container */}
      <div className="absolute inset-0 w-full h-full bg-black z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectFit: 'cover' }}
        >
          <source src="/anbae.mp4" type="video/mp4" />
          <source src="anbae.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Dark Overlay for Contrast */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] z-10" />

      {/* Login Card */}
      <div className="relative w-full max-w-md space-y-6 md:space-y-8 bg-card/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-border/50 shadow-2xl animate-in fade-in zoom-in duration-500 z-20">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary rounded-2xl mb-4 shadow-lg shadow-primary/20">
            <Music className="text-primary-foreground" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight italic mb-2">anbae</h1>
          <p className="text-muted-foreground font-medium text-sm">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-accent/10 border-none h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-accent/10 border-none h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-accent/10 border-none h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  type="text"
                  placeholder="Invite Code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="pl-10 bg-accent/10 border-none h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 font-bold tracking-wider"
                  required
                />
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 rounded-xl font-bold text-base shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={20} />
            ) : (
              <>
                {isSignUp ? 'Sign Up' : 'Sign In'}
                <ArrowRight className="ml-2" size={18} />
              </>
            )}
          </Button>
        </form>

        {isSignUp && (
          <div className="flex gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 animate-in fade-in duration-300">
            <Info size={16} className="text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              An invite code is required to access this platform. If you do not have an invite code, please contact{" "}
              <a 
                href="https://www.instagram.com/11x13y/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline font-bold"
              >
                11x13y
              </a>{" "}
              on Instagram.
            </p>
          </div>
        )}

        <div className="text-center pt-2">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-bold text-primary hover:underline underline-offset-4 transition-all"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
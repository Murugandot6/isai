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
    console.log(`[Video Debug] ${message}`);
  };

  useEffect(() => {
    addLog("Login component mounted.");
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  // Robust autoplay trigger for mobile & desktop
  useEffect(() => {
    const playVideo = async () => {
      const video = videoRef.current;
      if (video) {
        addLog(`Attempting autoplay with local file: ${backgroundVideo}`);
        try {
          video.muted = true;
          await video.play();
          addLog("Autoplay SUCCESSFUL.");
        } catch (err: any) {
          addLog(`Autoplay BLOCKED/FAILED: ${err.message || err}`);
          // Fallback: try playing again on first document click/touch
          const forcePlay = () => {
            addLog("User interaction detected. Forcing play...");
            video?.play()
              .then(() => addLog("Forced play SUCCESSFUL."))
              .catch((e) => addLog(`Forced play FAILED: ${e.message}`));
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
      {/* Animated CSS Gradient Fallback + Video Container */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-950 via-purple-950/20 to-black z-0 overflow-hidden animate-pulse duration-[8000ms]">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src={backgroundVideo}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          style={{ objectFit: 'cover' }}
          onLoadStart={() => addLog("Video event: loadstart")}
          onLoadedMetadata={() => addLog(`Video event: loadedmetadata (Duration: ${videoRef.current?.duration}s)`)}
          onLoadedData={() => addLog("Video event: loadeddata")}
          onCanPlay={() => addLog("Video event: canplay")}
          onPlay={() => addLog("Video event: play")}
          onPause={() => addLog("Video event: pause")}
          onError={(e) => {
            const err = videoRef.current?.error;
            addLog(`Video event: ERROR. Code: ${err?.code}, Message: ${err?.message}`);
          }}
        />
      </div>

      {/* Dark Overlay for Contrast */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-10" />

      {/* Floating Debug Toggle Button */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="absolute top-4 left-4 z-50 p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md flex items-center gap-2 text-xs font-bold transition-all"
      >
        <Terminal size={14} className="text-purple-400" />
        <span>{showDebug ? "Hide Debug" : "Show Debug"}</span>
      </button>

      {/* Debug Panel Overlay */}
      {showDebug && (
        <div className="fixed bottom-4 left-4 right-4 md:right-auto md:w-96 max-h-[300px] bg-zinc-950/95 border border-white/10 rounded-2xl p-4 z-50 text-left font-mono text-[10px] text-zinc-300 flex flex-col shadow-2xl backdrop-blur-lg">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <span className="font-bold text-purple-400 flex items-center gap-1.5">
              <Terminal size={12} />
              Video Playback Debugger
            </span>
            <button onClick={() => setShowDebug(false)} className="text-zinc-500 hover:text-white">
              <X size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {debugLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed break-all border-b border-white/5 pb-1">
                {log}
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-white/10 flex justify-between text-[9px] text-zinc-500">
            <span>Source: Local anbae.mp4</span>
            <button 
              onClick={() => {
                if (videoRef.current) {
                  addLog("Manual play trigger clicked.");
                  videoRef.current.play()
                    .then(() => addLog("Manual play SUCCESSFUL."))
                    .catch(e => addLog(`Manual play FAILED: ${e.message}`));
                }
              }}
              className="text-purple-400 hover:underline font-bold"
            >
              Force Play Video
            </button>
          </div>
        </div>
      )}

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
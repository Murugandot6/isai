"use client";

import React, { useState } from 'react';
import { Users, Play, Info, Link, Type, Image, Plus, LogIn, Check, Globe, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useMusic, Movie } from '@/context/MusicContext';

export const CustomWatchParty = () => {
  const { roomCode, setRoomCode, isHost, setIsHost, playMovie } = useMusic();
  const [open, setOpen] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [title, setTitle] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  
  // Quick host controls inside the watch party modal
  const [quickCode, setQuickCode] = useState(`ISAI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

  const handleQuickHost = () => {
    setRoomCode(quickCode);
    setIsHost(true);
    toast.success("Watch Party Sync Room created! Share code to invite friends.");
  };

  const fetchFromSourceUrl = async () => {
    if (!sourceUrl.trim()) return;
    
    setIsFetching(true);
    try {
      // In a real implementation, this would call your backend API
      // that scrapes or fetches the stream URL from your website
      const response = await fetch('/api/fetch-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl: sourceUrl.trim() })
      });
      
      if (!response.ok) throw new Error('Failed to fetch stream');
      
      const data = await response.json();
      
      if (data.streamUrl) {
        setStreamUrl(data.streamUrl);
        if (data.title) setTitle(data.title);
        if (data.poster) setPosterUrl(data.poster);
        toast.success('Stream URL fetched successfully!');
      } else {
        throw new Error('No stream URL found');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Could not fetch stream from source URL. Please enter it manually.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleLaunchParty = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!streamUrl.trim()) {
      toast.error("Please enter a valid stream link or magnet URL");
      return;
    }

    if (!roomCode) {
      toast.error("You must host or join a Sync Room first to start a synchronized watch party!");
      return;
    }

    const customMovie: Movie = {
      id: `custom-${Date.now()}`,
      title: title.trim() || 'Custom Watch Party Video',
      overview: 'Playing from a custom link shared in this watch party session.',
      backdrop: posterUrl.trim() || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200',
      poster: posterUrl.trim() || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=400',
      rating: 10.0,
      year: new Date().getFullYear().toString(),
      genre: 'Custom Watch Party',
      language: 'EN',
      streamUrl: streamUrl.trim()
    };

    // Play movie and close modal
    playMovie(customMovie);
    setOpen(false);
    toast.success(`Starting Watch Party: ${customMovie.title}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-300 hover:text-white hover:bg-purple-600 transition-all text-xs font-black uppercase tracking-widest shrink-0 shadow-lg">
          <Plus size={14} />
          <span>Custom Watch Party</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-black">
            <Users className="text-purple-400" />
            Custom Watch Party
          </DialogTitle>
          <DialogDescription>
            Stream custom video links (Direct MP4, HLS, or P2P Magnet torrents) in real-time sync with friends.
          </DialogDescription>
        </DialogHeader>

        {!roomCode ? (
          <div className="space-y-4 pt-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center space-y-3">
              <p className="text-xs font-bold text-red-400">Sync Room Required</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                To sync video playback across devices, you must be in an active sync room session.
              </p>
              <Button onClick={handleQuickHost} className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl font-bold h-11 text-xs gap-1.5 text-white">
                <LogIn size={14} />
                Host a Sync Room ({quickCode})
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLaunchParty} className="space-y-4 pt-4">
            <div className="space-y-3">
              {/* Source URL */}
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Globe size={10} className="text-purple-400" />
                  Your Website Source URL (Optional)
                </Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://yourwebsite.com/movie-page" 
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="bg-accent/5 border-none h-11 rounded-xl text-xs text-white focus-visible:ring-2 focus-visible:ring-purple-600/30 flex-1"
                  />
                  <Button 
                    type="button" 
                    onClick={fetchFromSourceUrl}
                    disabled={isFetching || !sourceUrl.trim()}
                    className="h-11 w-11 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shrink-0"
                  >
                    {isFetching ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
                  </Button>
                </div>
              </div>

              {/* Stream URL */}
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Link size={10} className="text-purple-400" />
                  Stream link or magnet link
                </Label>
                <Input 
                  placeholder="https://example.com/movie.mp4 or magnet:?xt=..." 
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="bg-accent/5 border-none h-11 rounded-xl text-xs text-white focus-visible:ring-2 focus-visible:ring-purple-600/30"
                  required
                />
              </div>

              {/* Title */}
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Type size={10} className="text-purple-400" />
                  Video Title
                </Label>
                <Input 
                  placeholder="e.g. Inception (2010)" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-accent/5 border-none h-11 rounded-xl text-xs text-white focus-visible:ring-2 focus-visible:ring-purple-600/30"
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Image size={10} className="text-purple-400" />
                  Cover Poster URL (Optional)
                </Label>
                <Input 
                  placeholder="https://example.com/poster.jpg" 
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  className="bg-accent/5 border-none h-11 rounded-xl text-xs text-white focus-visible:ring-2 focus-visible:ring-purple-600/30"
                />
              </div>
            </div>

            <div className="flex gap-2 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
              <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-normal">
                <strong>How to use:</strong> Paste your website URL above to auto-fetch the stream link, or enter it manually. Anyone in Room Code <strong className="text-purple-400">{roomCode}</strong> will sync-play when you launch.
              </p>
            </div>

            <Button type="submit" className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs uppercase tracking-widest gap-2 shadow-xl shadow-purple-600/20">
              <Play size={14} fill="currentColor" />
              Launch Watch Party
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
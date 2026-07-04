"use client";

import React, { useState } from 'react';
import { Users, Copy, Check, Info, LogIn } from 'lucide-react';
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
import { useMusic } from '@/context/MusicContext';
import { toast } from 'sonner';

export const ListenTogether = () => {
  const { roomCode, setRoomCode, isHost, setIsHost } = useMusic();
  const [localCode] = useState(`ISAI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode || localCode);
    setCopied(true);
    toast.success("Room code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHost = () => {
    setRoomCode(localCode);
    setIsHost(true);
    toast.success("Room created!");
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length < 4) {
      toast.error("Please enter a valid code");
      return;
    }
    setRoomCode(joinCode);
    setIsHost(false);
    toast.success(`Joined room: ${joinCode}`);
  };

  const handleLeave = () => {
    setRoomCode(null);
    setIsHost(false);
    toast.info("Left the session");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs font-bold shadow-lg ${roomCode ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground'}`}>
          <Users size={16} />
          <span>{roomCode ? (isHost ? 'Hosting' : 'Joined') : 'Listen Together'}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-black">
            <Users className="text-primary" />
            Social Sync
          </DialogTitle>
          <DialogDescription>
            {roomCode ? `Currently in room: ${roomCode}` : 'Listen to music in real-time with your friends.'}
          </DialogDescription>
        </DialogHeader>
        
        {roomCode ? (
          <div className="space-y-6 pt-4">
            <div className="bg-accent/5 rounded-2xl p-6 border border-accent/10 text-center">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">Room Code</p>
              <h3 className="text-3xl font-black tracking-tighter text-foreground mb-4">{roomCode}</h3>
              <div className="flex gap-2">
                <Button onClick={copyCode} variant="outline" className="flex-1 gap-2 rounded-xl border-2">
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  Copy
                </Button>
                <Button onClick={handleLeave} variant="destructive" className="gap-2 rounded-xl">
                  <LogIn size={16} />
                  Leave
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            <div className="bg-accent/5 rounded-2xl p-6 border border-accent/10 text-center">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">New Session Code</p>
              <h3 className="text-3xl font-black tracking-tighter text-foreground mb-6">{localCode}</h3>
              <Button onClick={handleHost} className="w-full gap-2 h-12 rounded-xl font-bold shadow-xl shadow-primary/20">
                Create Room
              </Button>
            </div>
            <form onSubmit={handleJoin} className="space-y-4">
              <Input 
                placeholder="Enter Code (e.g. ISAI-XY12Z)" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="bg-accent/5 border-2 border-transparent focus-visible:border-primary/20 h-12 text-lg font-bold tracking-widest rounded-xl text-center"
              />
              <Button type="submit" className="w-full gap-2 h-12 rounded-xl font-bold">
                Join Room
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
"use client";

import React, { useState } from 'react';
import { Users, Copy, Check, Info, Share2, LogIn } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

export const ListenTogether = () => {
  const [sessionCode, setSessionCode] = useState(`SONIC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    toast.success("Session link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length < 4) {
      toast.error("Please enter a valid session code");
      return;
    }
    setIsJoined(true);
    toast.success(`Joined session: ${joinCode.toUpperCase()}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all text-xs font-bold shadow-lg shadow-primary/20">
          <Users size={16} />
          <span>Listen Together</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-black">
            <Users className="text-primary" />
            Social Sync
          </DialogTitle>
          <DialogDescription>
            Listen to music in real-time with your friends.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="host" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-accent/10">
            <TabsTrigger value="host" className="rounded-lg font-bold">Host Room</TabsTrigger>
            <TabsTrigger value="join" className="rounded-lg font-bold">Join Room</TabsTrigger>
          </TabsList>

          <TabsContent value="host" className="space-y-6 pt-6">
            <div className="bg-accent/5 rounded-2xl p-6 border border-accent/10 text-center">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">Your Live Session Code</p>
              <h3 className="text-3xl font-black tracking-tighter text-foreground mb-4">{sessionCode}</h3>
              <Button onClick={copyCode} variant="outline" className="w-full gap-2 rounded-xl border-2 hover:bg-primary/5">
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Invite Link"}
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center justify-between">
                Live Listeners 
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[8px]">1 ONLINE</Badge>
              </h4>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/5 border border-transparent hover:border-primary/20 transition-all">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">YOU</div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Host (Owner)</p>
                  <p className="text-[10px] text-green-500 font-medium">Syncing Now</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="join" className="space-y-6 pt-6">
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Enter Friend's Code</label>
                <Input 
                  placeholder="e.g. SONIC-XY12Z" 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="bg-accent/5 border-2 border-transparent focus-visible:border-primary/20 h-12 text-lg font-bold tracking-widest rounded-xl text-center"
                />
              </div>
              <Button type="submit" className="w-full gap-2 h-12 rounded-xl font-bold text-sm">
                <LogIn size={18} />
                Join Session
              </Button>
            </form>

            {isJoined && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs font-bold text-green-500">Currently synced with {joinCode}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 p-3 mt-4 rounded-xl bg-primary/5 border border-primary/10">
          <Info size={16} className="text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Music will automatically sync between all participants. Only the Host can control the playback queue.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
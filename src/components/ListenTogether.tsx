"use client";

import React, { useState } from 'react';
import { Users, Copy, Check, Info, Share2 } from 'lucide-react';
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
import { toast } from 'sonner';

export const ListenTogether = () => {
  const [sessionCode, setSessionCode] = useState(`SONIC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    toast.success("Session link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs font-bold border border-primary/20">
          <Users size={14} />
          <span>Listen Together</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="text-primary" />
            Listen Together
          </DialogTitle>
          <DialogDescription>
            Share your music session and listen in sync with your friends.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="bg-accent/5 rounded-2xl p-6 border border-accent/10 text-center">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">Your Session Code</p>
            <h3 className="text-3xl font-black tracking-tighter text-foreground mb-4">{sessionCode}</h3>
            <Button onClick={copyCode} variant="outline" className="w-full gap-2 rounded-xl">
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy Invite Link"}
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-muted-foreground">Connected Friends (1)</h4>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/5">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold">YOU</div>
              <div className="flex-1">
                <p className="text-sm font-bold">Host (You)</p>
                <p className="text-[10px] text-green-500 font-medium">Listening Now</p>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[8px]">ACTIVE</Badge>
            </div>
          </div>

          <div className="flex gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Info size={16} className="text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              When friends join your session, their playback will automatically sync with yours. Only the host can skip tracks.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
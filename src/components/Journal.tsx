"use client";

import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface JournalProps {
  memory: {
    id: string;
    text: string;
    song: any;
    createdAt: string;
  };
  onDelete: (id: string) => void;
}

export const Journal = ({ memory, onDelete }: JournalProps) => {
  return (
    <div className="bg-card/50 border border-border/50 rounded-2xl p-4 hover:bg-accent/5 transition-all">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm md:text-base text-zinc-300 leading-relaxed font-medium italic relative z-10">
            {DOMPurify.sanitize(memory.text)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(memory.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDelete(memory.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};
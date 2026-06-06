"use client";

import React from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useMusic } from '@/context/MusicContext';
import { SongCard } from '@/components/SongCard';
import { Music, Heart, ListMusic, Plus, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';

const Library = () => {
  const { likedSongs } = useMusic();

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Your Library</h1>
            <p className="text-muted-foreground font-medium">Manage your favorites and playlists.</p>
          </div>
          <Button className="rounded-xl gap-2 h-11 px-6 font-bold shadow-lg shadow-primary/20">
            <Plus size={18} />
            New Playlist
          </Button>
        </div>

        <Tabs defaultValue="liked" className="w-full">
          <TabsList className="bg-accent/5 p-1 rounded-2xl mb-8 w-fit">
            <TabsTrigger value="liked" className="rounded-xl px-6 font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Heart size={16} />
              Liked Songs
              {likedSongs.length > 0 && <span className="ml-1 text-[10px] bg-white/20 px-1.5 rounded-full">{likedSongs.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="playlists" className="rounded-xl px-6 font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <ListMusic size={16} />
              Playlists
            </TabsTrigger>
            <TabsTrigger value="recent" className="rounded-xl px-6 font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Clock size={16} />
              Recently Played
            </TabsTrigger>
          </TabsList>

          <TabsContent value="liked" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {likedSongs.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {likedSongs.map((song) => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-accent/20 rounded-3xl">
                <div className="bg-accent/5 p-8 rounded-full mb-6">
                  <Heart size={48} className="text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-bold mb-2">No liked songs yet</h3>
                <p className="text-muted-foreground max-w-xs mb-8">Start exploring and tap the heart icon on any song to save it here.</p>
                <Button variant="outline" onClick={() => window.location.href = '/'} className="rounded-xl border-2 font-bold px-8">
                  Discover Music
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="playlists" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Default Liked Playlist Card */}
                <div className="group bg-gradient-to-br from-primary to-purple-600 rounded-3xl p-8 aspect-[16/9] flex flex-col justify-end cursor-pointer shadow-xl shadow-primary/10 transition-transform hover:-translate-y-1">
                  <Heart size={40} className="mb-4 text-white fill-white" />
                  <h3 className="text-2xl font-black text-white">Liked Songs</h3>
                  <p className="text-white/70 font-bold text-sm uppercase tracking-wider">{likedSongs.length} Tracks</p>
                </div>

                {/* Create New Playlist Card */}
                <div className="group border-2 border-dashed border-accent/20 rounded-3xl p-8 aspect-[16/9] flex flex-col items-center justify-center cursor-pointer hover:bg-accent/5 hover:border-primary/50 transition-all">
                  <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <Plus size={32} className="text-primary" />
                  </div>
                  <h3 className="font-bold">Create New Playlist</h3>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="recent" className="text-center py-20 text-muted-foreground">
            Feature coming soon! We'll track your history as you listen.
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Library;
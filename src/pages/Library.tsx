"use client";

import React, { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useMusic } from '@/context/MusicContext';
import { SongCard } from '@/components/SongCard';
import { Heart, ListMusic, Plus, Clock, MoreVertical, Play } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Library = () => {
  const { likedSongs, playlists, createPlaylist, playSong } = useMusic();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName);
      setNewPlaylistName('');
      setIsDialogOpen(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Your Library</h1>
            <p className="text-muted-foreground font-medium">Manage your favorites and playlists.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2 h-11 px-6 font-bold shadow-lg shadow-primary/20">
                <Plus size={18} />
                New Playlist
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Create Playlist</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePlaylist} className="space-y-4 pt-4">
                <Input 
                  placeholder="Playlist Name (e.g. Tamil Vibes)" 
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="bg-accent/5 h-12 rounded-xl border-none font-bold"
                  autoFocus
                />
                <Button type="submit" className="w-full h-12 rounded-xl font-bold">Create</Button>
              </form>
            </DialogContent>
          </Dialog>
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
              {playlists.length > 0 && <span className="ml-1 text-[10px] bg-white/20 px-1.5 rounded-full">{playlists.length}</span>}
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
                <Heart size={48} className="text-muted-foreground/30 mb-6" />
                <h3 className="text-xl font-bold mb-2">No liked songs yet</h3>
                <p className="text-muted-foreground max-w-xs mb-8">Tap the heart icon on any song to save it here.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="playlists" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Default Liked Playlist Card */}
                <div className="group bg-gradient-to-br from-primary to-purple-600 rounded-3xl p-8 aspect-[16/9] flex flex-col justify-end cursor-pointer shadow-xl transition-transform hover:-translate-y-1">
                  <Heart size={40} className="mb-4 text-white fill-white" />
                  <h3 className="text-2xl font-black text-white">Liked Songs</h3>
                  <p className="text-white/70 font-bold text-sm uppercase tracking-wider">{likedSongs.length} Tracks</p>
                </div>

                {/* Custom Playlists */}
                {playlists.map(playlist => (
                  <div key={playlist.id} className="group bg-accent/5 border border-accent/10 rounded-3xl p-8 aspect-[16/9] flex flex-col justify-end cursor-pointer transition-all hover:bg-accent/10 hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-auto">
                      <div className="bg-primary/20 p-3 rounded-2xl">
                        <ListMusic className="text-primary" size={24} />
                      </div>
                      <button className="text-muted-foreground hover:text-foreground"><MoreVertical size={20} /></button>
                    </div>
                    <h3 className="text-2xl font-black">{playlist.name}</h3>
                    <p className="text-muted-foreground font-bold text-sm uppercase tracking-wider">{playlist.songs.length} Tracks</p>
                  </div>
                ))}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Library;
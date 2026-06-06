"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Camera, Save, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    username: '',
    full_name: '',
    avatar_url: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile({
          username: data.username || '',
          full_name: data.full_name || '',
          avatar_url: data.avatar_url || ''
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-8 gap-2 hover:bg-accent/10 rounded-xl"
        >
          <ArrowLeft size={18} />
          Back
        </Button>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-accent/10 border-4 border-primary/20 shadow-2xl">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <User size={48} />
                  </div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                <Camera size={18} />
              </button>
            </div>
            <h1 className="text-2xl font-black mt-4 tracking-tight">Edit Profile</h1>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Username</Label>
              <Input 
                id="username"
                value={profile.username}
                onChange={(e) => setProfile({...profile, username: e.target.value})}
                placeholder="Your unique username"
                className="bg-accent/5 border-none h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
              <Input 
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                placeholder="Your display name"
                className="bg-accent/5 border-none h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar_url" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Avatar URL</Label>
              <Input 
                id="avatar_url"
                value={profile.avatar_url}
                onChange={(e) => setProfile({...profile, avatar_url: e.target.value})}
                placeholder="https://example.com/avatar.jpg"
                className="bg-accent/5 border-none h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>

            <Button 
              type="submit" 
              disabled={saving}
              className="w-full h-12 rounded-xl font-bold text-base shadow-xl shadow-primary/20 mt-4"
            >
              {saving ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save className="mr-2" size={20} />}
              Save Changes
            </Button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
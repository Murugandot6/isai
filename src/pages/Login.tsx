"use client";

import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Music } from 'lucide-react';

const Login = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-3xl border border-border shadow-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary rounded-2xl mb-4">
            <Music className="text-primary-foreground" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight italic mb-2">isai</h1>
          <p className="text-muted-foreground font-medium">Sign in to start your musical journey</p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary))',
                },
                radii: {
                  buttonRadius: '0.75rem',
                  inputRadius: '0.75rem',
                }
              }
            },
            className: {
              container: 'space-y-4',
              button: 'font-bold py-3',
              input: 'bg-accent/5 border-none focus:ring-2 focus:ring-primary/20',
            }
          }}
          providers={[]}
          theme="dark"
        />
      </div>
    </div>
  );
};

export default Login;
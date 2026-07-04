"use client";

import React from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect unauthenticated users
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
};

export default App;
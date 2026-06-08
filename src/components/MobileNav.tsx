"use client";

import React from 'react';
import { Home, Film, Radio, Library } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const MobileNav = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Film, label: 'Movies', path: '/movies' },
    { icon: Radio, label: 'FM', path: '/radio' },
    { icon: Library, label: 'Library', path: '/library' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border z-50 px-4 py-3 flex items-center justify-between pb-safe">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className={cn(
              "flex flex-col items-center gap-1 transition-colors flex-1",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon size={20} className={cn(isActive && "fill-primary/20")} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
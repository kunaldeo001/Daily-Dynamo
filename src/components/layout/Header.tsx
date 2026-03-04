'use client';
import React from 'react';
import { UserButton } from '../auth/UserButton';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Sparkles } from 'lucide-react';

export function Header() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: profile } = useDoc<any>(userRef);

  return (
    <header className="py-8 text-center animate-in fade-in slide-in-from-top-4 duration-700 relative perspective-1000">
      <div className="absolute top-4 right-4 z-50">
        <UserButton />
      </div>
      <div className="inline-block relative preserve-3d group">
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x bg-[length:200%_auto] group-hover:scale-105 transition-transform duration-500">
          Daily Dynamo
        </h1>
        <Sparkles className="absolute -top-6 -right-10 text-primary size-10 animate-pulse-3d opacity-80" />
        <div className="absolute -inset-4 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors" />
      </div>
      <div className="mt-4 space-y-2 preserve-3d">
        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase opacity-70 animate-in fade-in slide-in-from-bottom-2 duration-1000">
          {profile?.dailyMotto || 'Your interactive 3D day planner'}
        </p>
        {profile?.displayName && (
          <p className="text-[10px] font-black tracking-[0.4em] text-primary/50 uppercase">
            Command Center: <span className="text-primary">{profile.displayName}</span>
          </p>
        )}
      </div>
    </header>
  );
}
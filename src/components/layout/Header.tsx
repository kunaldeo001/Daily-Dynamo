
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
    <header className="py-8 text-center animate-in fade-in slide-in-from-top-4 duration-500 relative">
      <div className="absolute top-4 right-4 z-50">
        <UserButton />
      </div>
      <div className="inline-block relative">
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x bg-[length:200%_auto]">
          Daily Dynamo
        </h1>
        <Sparkles className="absolute -top-4 -right-8 text-primary size-8 animate-pulse opacity-50" />
      </div>
      <div className="mt-2 space-y-1">
        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase opacity-70">
          {profile?.dailyMotto || 'Your crazy, interactive day planner'}
        </p>
        {profile?.displayName && (
          <p className="text-[10px] font-black tracking-[0.3em] text-primary/40 uppercase">
            Dynamo Command: {profile.displayName}
          </p>
        )}
      </div>
    </header>
  );
}

import React from 'react';

export function Header() {
  return (
    <header className="py-8 text-center animate-in fade-in slide-in-from-top-4 duration-500">
      <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
        Daily Dynamo
      </h1>
      <p className="text-muted-foreground mt-2">Your crazy, interactive day planner</p>
    </header>
  );
}

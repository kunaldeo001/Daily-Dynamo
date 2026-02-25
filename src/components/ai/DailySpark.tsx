
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Sparkles, LoaderCircle, Smile, Frown, Meh, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { aiDailySpark } from '@/ai/flows/ai-daily-spark-flow';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { DailySparkData } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const MOODS = [
  { id: 'motivated', icon: Zap, color: 'text-yellow-500', label: 'Motivated' },
  { id: 'happy', icon: Smile, color: 'text-green-500', label: 'Happy' },
  { id: 'meh', icon: Meh, color: 'text-blue-400', label: 'Meh' },
  { id: 'tired', icon: Frown, color: 'text-purple-400', label: 'Tired' },
];

export function DailySpark() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [todayStr, setTodayStr] = useState<string | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    setTodayStr(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const sparksCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/dailySparks`);
  }, [firestore, user]);

  const { data: sparks, isLoading: areSparksLoading } = useCollection<DailySparkData>(sparksCollection);

  const todaySpark = useMemo(() => {
    if (!sparks || !todayStr) return null;
    const todaySparks = sparks
      .filter(s => s.sparkDate === todayStr)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    return todaySparks[0] || null;
  }, [sparks, todayStr]);

  const handleGenerateSpark = async () => {
    if (!sparksCollection || !user || !todayStr) return;
    setIsGenerating(true);

    try {
      const moodContext = selectedMood ? `The user is feeling ${selectedMood} today.` : '';
      const result = await aiDailySpark({ context: moodContext });
      const newSpark = {
        content: result.suggestion,
        sparkDate: todayStr,
        createdAt: serverTimestamp(),
        ownerId: user.uid,
        mood: selectedMood || undefined,
      };
      addDocumentNonBlocking(sparksCollection, newSpark);
    } catch (error) {
      console.error('Failed to generate daily spark:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const isLoading = isGenerating || areSparksLoading;

  return (
    <Card className="w-full shadow-lg bg-card/80 backdrop-blur-sm border-primary/20 animate-in fade-in slide-in-from-top-8 duration-500">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            <CardTitle className="font-headline text-xl">
            AI Daily Spark
            </CardTitle>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {MOODS.map((m) => (
            <Button
              key={m.id}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMood(m.id)}
              className={cn(
                "p-2 h-9 w-9 rounded-full transition-all",
                selectedMood === m.id ? "bg-primary/20 scale-110" : "opacity-50 hover:opacity-100"
              )}
              title={m.label}
            >
              <m.icon className={cn("size-5", m.color)} />
            </Button>
          ))}
          <Button 
            onClick={handleGenerateSpark} 
            disabled={isLoading} 
            size="sm" 
            variant="default" 
            className="bg-primary hover:bg-primary/90 ml-2"
          >
            {isLoading ? (
              <LoaderCircle className="animate-spin h-4 w-4" />
            ) : (
              <Zap className="mr-2 size-4" />
            )}
            {todaySpark ? 'Regenerate' : 'Ignite'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center text-lg min-h-[6rem] flex flex-col items-center justify-center p-6 rounded-xl bg-primary/5 border border-primary/10 relative overflow-hidden">
          {isLoading ? (
            <LoaderCircle className="animate-spin text-primary size-8" />
          ) : todaySpark ? (
            <div className="animate-in zoom-in-95 duration-500 space-y-2">
              <p className="italic font-medium text-primary-foreground/90 leading-relaxed text-xl">
                "{todaySpark.content}"
              </p>
              {todaySpark.mood && (
                <div className="text-xs uppercase tracking-tighter text-primary/60 font-bold">
                  Tailored for your {todaySpark.mood} vibe
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground font-normal">
              <p className="mb-2">How's your vibe today?</p>
              <p className="text-sm">Select a mood and ignite your daily spark!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

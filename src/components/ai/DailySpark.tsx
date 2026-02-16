'use client';

import { useState, useMemo } from 'react';
import { Sparkles, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { aiDailySpark } from '@/ai/flows/ai-daily-spark-flow';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { DailySparkData } from '@/lib/types';
import { format } from 'date-fns';

export function DailySpark() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const sparksCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/dailySparks`);
  }, [firestore, user]);

  const { data: sparks, isLoading: areSparksLoading } = useCollection<DailySparkData>(sparksCollection);

  const todaySpark = useMemo(() => {
    if (!sparks) return null;
    const today = format(new Date(), 'yyyy-MM-dd');
    const todaySparks = sparks
      .filter(s => s.sparkDate === today)
      .sort((a, b) => {
        const aSeconds = a.createdAt?.seconds;
        const bSeconds = b.createdAt?.seconds;

        if (aSeconds && bSeconds) {
          return bSeconds - aSeconds;
        }
        if (aSeconds) return -1;
        if (bSeconds) return 1;
        return 0;
      });
    return todaySparks[0] || null;
  }, [sparks]);


  const handleGenerateSpark = async () => {
    if (!sparksCollection || !user) return;
    setIsGenerating(true);

    try {
      const result = await aiDailySpark();
      const newSpark = {
        content: result.suggestion,
        sparkDate: format(new Date(), 'yyyy-MM-dd'),
        createdAt: serverTimestamp(),
        ownerId: user.uid,
      };
      addDocumentNonBlocking(sparksCollection, newSpark);
    } catch (error) {
      console.error('Failed to generate daily spark:', error);
      // You could add a toast notification here to inform the user about the error.
    } finally {
      setIsGenerating(false);
    }
  };
  
  const isLoading = isGenerating || areSparksLoading;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg bg-card/80 backdrop-blur-sm border-primary/20 animate-in fade-in slide-in-from-top-8 duration-500 delay-100">
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            <CardTitle className="font-headline">
            AI Daily Spark
            </CardTitle>
        </div>
        <Button onClick={handleGenerateSpark} disabled={isLoading} size="sm">
          {isLoading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Sparkles className="mr-2 size-4" />
          )}
          New Spark
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-center text-lg min-h-[5rem] flex items-center justify-center p-4 rounded-lg bg-background">
          {isLoading && <LoaderCircle className="animate-spin text-primary" />}
          {!isLoading && todaySpark && (
            <p className="animate-in fade-in-50 duration-500">{todaySpark.content}</p>
          )}
          {!isLoading && !todaySpark && (
            <p className="text-muted-foreground">
              Click "New Spark" for a quirky daily challenge!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

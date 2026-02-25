
'use client';

import { useState, useMemo, useEffect } from 'react';
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
  const [todayStr, setTodayStr] = useState<string | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    // Avoid hydration mismatch by setting date client-side
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
      const result = await aiDailySpark();
      const newSpark = {
        content: result.suggestion,
        sparkDate: todayStr,
        createdAt: serverTimestamp(),
        ownerId: user.uid,
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
    <Card className="w-full shadow-lg bg-card/80 backdrop-blur-sm border-primary/20 animate-in fade-in slide-in-from-top-8 duration-500 delay-100">
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            <CardTitle className="font-headline text-xl">
            AI Daily Spark
            </CardTitle>
        </div>
        <Button onClick={handleGenerateSpark} disabled={isLoading} size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
          {isLoading ? (
            <LoaderCircle className="animate-spin h-4 w-4" />
          ) : (
            <Sparkles className="mr-2 size-4" />
          )}
          New Spark
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-center text-lg min-h-[5rem] flex items-center justify-center p-6 rounded-xl bg-primary/5 border border-primary/10 italic font-medium text-primary-foreground/90">
          {isLoading ? (
            <LoaderCircle className="animate-spin text-primary" />
          ) : todaySpark ? (
            <p className="animate-in zoom-in-95 duration-500">"{todaySpark.content}"</p>
          ) : (
            <p className="text-muted-foreground font-normal not-italic">
              Ready for your daily challenge? Click above!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

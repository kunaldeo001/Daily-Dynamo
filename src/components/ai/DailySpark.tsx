
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Sparkles, LoaderCircle, Smile, Frown, Meh, Zap, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { aiDailySpark } from '@/ai/flows/ai-daily-spark-flow';
import { visualizeSpark } from '@/ai/flows/visualize-spark-flow';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { DailySparkData } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const MOODS = [
  { id: 'motivated', icon: Zap, color: 'text-yellow-500', glow: 'mood-glow-motivated', bg: 'bg-yellow-500/5', label: 'Motivated' },
  { id: 'happy', icon: Smile, color: 'text-green-500', glow: 'mood-glow-happy', bg: 'bg-green-500/5', label: 'Happy' },
  { id: 'meh', icon: Meh, color: 'text-blue-400', glow: 'mood-glow-meh', bg: 'bg-blue-400/5', label: 'Meh' },
  { id: 'tired', icon: Frown, color: 'text-purple-400', glow: 'mood-glow-tired', bg: 'bg-purple-400/5', label: 'Tired' },
];

export function DailySpark() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);
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

  const handleVisualize = async () => {
    if (!todaySpark || !user || !firestore) return;
    setIsVisualizing(true);
    try {
      const result = await visualizeSpark({ sparkContent: todaySpark.content });
      const sparkRef = doc(firestore, `users/${user.uid}/dailySparks/${todaySpark.id}`);
      updateDocumentNonBlocking(sparkRef, { imageUrl: result.imageUrl });
    } catch (error) {
      console.error('Failed to visualize spark:', error);
    } finally {
      setIsVisualizing(false);
    }
  };
  
  const isLoading = isGenerating || areSparksLoading;
  const currentMoodInfo = MOODS.find(m => m.id === (todaySpark?.mood || selectedMood));

  return (
    <Card className={cn(
      "w-full shadow-lg transition-all duration-700 bg-card/80 backdrop-blur-sm border-primary/20 animate-in fade-in slide-in-from-top-8",
      currentMoodInfo?.glow
    )}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
            <Sparkles className={cn("transition-colors duration-500", currentMoodInfo?.color || "text-primary")} />
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
                (selectedMood === m.id || todaySpark?.mood === m.id) ? "bg-muted scale-110" : "opacity-50 hover:opacity-100"
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
            className="bg-primary hover:bg-primary/90 ml-2 shadow-sm"
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
      <CardContent className="space-y-6">
        <div className={cn(
          "text-center text-lg min-h-[6rem] flex flex-col items-center justify-center p-6 rounded-xl border transition-colors duration-500 relative overflow-hidden",
          currentMoodInfo?.bg || "bg-primary/5",
          currentMoodInfo ? `border-${currentMoodInfo.color.split('-')[1]}/20` : "border-primary/10"
        )}>
          {isLoading ? (
            <LoaderCircle className="animate-spin text-primary size-8" />
          ) : todaySpark ? (
            <div className="animate-in zoom-in-95 duration-500 space-y-4">
              <p className="italic font-medium leading-relaxed text-xl text-foreground">
                "{todaySpark.content}"
              </p>
              {todaySpark.mood && (
                <div className={cn("text-[10px] uppercase tracking-[0.2em] font-bold", currentMoodInfo?.color || "text-primary/60")}>
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

        {todaySpark && (
          <div className="space-y-4">
            {!todaySpark.imageUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleVisualize} 
                disabled={isVisualizing}
                className="w-full border-dashed border-primary/30 hover:border-primary/60"
              >
                {isVisualizing ? (
                  <LoaderCircle className="animate-spin size-4 mr-2" />
                ) : (
                  <ImageIcon className="size-4 mr-2" />
                )}
                Visualize this Spark
              </Button>
            )}
            
            {todaySpark.imageUrl && (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-primary/20 shadow-inner group animate-in fade-in zoom-in-95 duration-700">
                <Image 
                  src={todaySpark.imageUrl} 
                  alt="Daily Spark Visualization" 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  data-ai-hint="Whimsical spark illustration"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={handleVisualize} 
                   className="absolute bottom-2 right-2 h-7 px-2 text-[10px] bg-black/40 hover:bg-black/60 text-white border-white/10"
                   disabled={isVisualizing}
                >
                  {isVisualizing ? 'Re-imagining...' : 'Re-imagine'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

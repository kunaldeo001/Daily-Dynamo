
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Sparkles, LoaderCircle, Smile, Frown, Meh, Zap, Image as ImageIcon, History, ChevronDown, ChevronUp, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { aiDailySpark } from '@/ai/flows/ai-daily-spark-flow';
import { visualizeSpark } from '@/ai/flows/visualize-spark-flow';
import { useUser, useFirestore, useCollection, useMemoFirebase, useFirebase } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { DailySparkData } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const { user } = useUser();
  const firestore = useFirebase().firestore;
  const { toast } = useToast();

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

  const historySparks = useMemo(() => {
    if (!sparks || !todayStr) return [];
    return sparks
      .filter(s => s.sparkDate !== todayStr)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 5);
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

      if (result.isFallback) {
        toast({
          title: "Creative Mode: Manual",
          description: "We picked a hand-crafted spark for you while the AI rests!",
        });
      }
    } catch (error) {
      console.error('Failed to generate daily spark:', error);
      toast({
        variant: "destructive",
        title: "Ignition Failed",
        description: "Could not spark a new idea right now. Check your connection!",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVisualize = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!todaySpark || !user || !firestore) return;
    setIsVisualizing(true);
    try {
      const result = await visualizeSpark({ sparkContent: todaySpark.content });
      const sparkRef = doc(firestore, `users/${user.uid}/dailySparks/${todaySpark.id}`);
      updateDocumentNonBlocking(sparkRef, { imageUrl: result.imageUrl });
      
      if (result.isFallback) {
        toast({
          title: "Vision Fallback Activated",
          description: "We picked a hand-crafted whimsical scene to match your spark!",
        });
      }
    } catch (error) {
      console.error('Failed to visualize spark:', error);
      toast({
        variant: "destructive",
        title: "Visualization Failed",
        description: "The magic mirror is cloudy. Try again in a moment!",
      });
    } finally {
      setIsVisualizing(false);
    }
  };
  
  const isLoading = isGenerating || areSparksLoading;
  const currentMoodInfo = MOODS.find(m => m.id === (todaySpark?.mood || selectedMood));

  return (
    <div className="perspective-1000">
      <Card className={cn(
        "w-full shadow-2xl transition-all duration-700 bg-card/90 backdrop-blur-md border-primary/20 animate-in fade-in slide-in-from-top-8 preserve-3d group/spark hover:rotate-y-2 hover:rotate-x-2",
        currentMoodInfo?.glow,
        todaySpark?.imageUrl && "animate-float-3d"
      )}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 preserve-3d group-hover/spark:translate-z-10">
              <Sparkles className={cn("transition-colors duration-500", currentMoodInfo?.color || "text-primary")} />
              <CardTitle className="font-headline text-xl">
              AI Daily Spark
              </CardTitle>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 preserve-3d group-hover/spark:translate-z-20">
            {MOODS.map((m) => (
              <Button
                key={m.id}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMood(m.id)}
                className={cn(
                  "p-2 h-9 w-9 rounded-full transition-all hover:scale-125",
                  (selectedMood === m.id || todaySpark?.mood === m.id) ? "bg-muted scale-110 shadow-inner" : "opacity-50 hover:opacity-100"
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
              className="bg-primary hover:bg-primary/90 ml-2 shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <LoaderCircle className="animate-spin h-4 w-4" />
              ) : (
                <RefreshCcw className="mr-2 size-4" />
              )}
              {todaySpark ? 'Regenerate' : 'Ignite'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative perspective-1000 min-h-[12rem]">
            <div 
              className={cn(
                "relative w-full h-full transition-all duration-700 preserve-3d cursor-pointer",
                isFlipped && "rotate-y-180"
              )}
              onClick={() => todaySpark?.imageUrl && setIsFlipped(!isFlipped)}
            >
              {/* Front Side */}
              <div className={cn(
                "absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 rounded-2xl border transition-all duration-500 overflow-hidden",
                currentMoodInfo?.bg || "bg-primary/5",
                currentMoodInfo ? `border-${currentMoodInfo.color.split('-')[1]}/20` : "border-primary/10"
              )}>
                {isLoading ? (
                  <LoaderCircle className="animate-spin text-primary size-10" />
                ) : todaySpark ? (
                  <div className="animate-in zoom-in-95 duration-500 space-y-4 text-center">
                    <p className="italic font-medium leading-relaxed text-2xl text-foreground drop-shadow-sm">
                      "{todaySpark.content}"
                    </p>
                    {todaySpark.mood && (
                      <div className={cn("text-[10px] uppercase tracking-[0.3em] font-black", currentMoodInfo?.color || "text-primary/60")}>
                        Tailored for your {todaySpark.mood} vibe
                      </div>
                    )}
                    {todaySpark.imageUrl && (
                      <div className="text-[9px] font-bold text-primary/40 uppercase tracking-widest mt-4 animate-pulse">
                        Click to Flip for Spark Vision
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground font-normal text-center space-y-3">
                    <p className="text-xl">How's your vibe today?</p>
                    <p className="text-sm opacity-60">Select a mood above and ignite your daily spark!</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              </div>

              {/* Back Side (Image) */}
              {todaySpark?.imageUrl && (
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl overflow-hidden border border-primary/20 shadow-2xl">
                   <Image 
                    src={todaySpark.imageUrl} 
                    alt="Daily Spark Visualization" 
                    fill 
                    className="object-cover"
                    data-ai-hint="whimsical spark"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                     <p className="text-white text-sm font-bold italic line-clamp-2">
                        {todaySpark.content}
                     </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {todaySpark && !todaySpark.imageUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleVisualize} 
              disabled={isVisualizing}
              className="w-full border-dashed border-primary/30 hover:border-primary/60 transition-all duration-300 hover:bg-primary/5 hover:translate-y-[-4px]"
            >
              {isVisualizing ? (
                <LoaderCircle className="animate-spin size-4 mr-2" />
              ) : (
                <ImageIcon className="size-4 mr-2" />
              )}
              Visualize this Spark
            </Button>
          )}

          {/* History Section */}
          {historySparks.length > 0 && (
            <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen} className="pt-4 border-t border-primary/10 preserve-3d group-hover/spark:translate-z-10">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full flex items-center justify-between text-muted-foreground hover:text-primary transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]">
                    <History className="size-3" /> Spark History
                  </div>
                  {isHistoryOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-4 animate-in slide-in-from-top-2 duration-300">
                {historySparks.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl bg-background/50 border border-primary/5 text-sm italic relative overflow-hidden group/hist hover:translate-x-2 hover:bg-background/80 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{s.sparkDate}</span>
                      {s.mood && (
                        <span className="text-[9px] font-black uppercase text-primary/50 tracking-tighter bg-primary/5 px-1.5 py-0.5 rounded">Mood: {s.mood}</span>
                      )}
                    </div>
                    <p className="text-muted-foreground group-hover/hist:text-foreground transition-colors leading-relaxed">
                      "{s.content}"
                    </p>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookMarked, LoaderCircle, Sparkles, ScrollText, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, query, where, doc, setDoc } from 'firebase/firestore';
import { dailyWrapUp } from '@/ai/flows/daily-wrapup-flow';
import { format } from 'date-fns';
import type { Task, DailyReflectionData, DailySummaryData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function DailyWrapUp() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const tasksRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/tasks`);
  }, [firestore, user]);

  const reflectionsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, `users/${user.uid}/reflections`),
      where('reflectionDate', '==', todayStr)
    );
  }, [firestore, user, todayStr]);

  const summariesRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, `users/${user.uid}/summaries`),
      where('summaryDate', '==', todayStr)
    );
  }, [firestore, user, todayStr]);

  const { data: tasks } = useCollection<Task>(tasksRef);
  const { data: reflections } = useCollection<DailyReflectionData>(reflectionsRef);
  const { data: summaries, isLoading: isSummariesLoading } = useCollection<DailySummaryData>(summariesRef);

  const currentSummary = summaries?.[0];
  const completedTasks = useMemo(() => tasks?.filter(t => t.isCompleted) || [], [tasks]);

  const handleGenerateSummary = async () => {
    if (!user || !firestore) return;
    if (completedTasks.length === 0) {
      toast({
        variant: "destructive",
        title: "Archive Empty",
        description: "Complete at least one task to generate a Daily Wrap-up!",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await dailyWrapUp({
        completedTasks: completedTasks.map(t => t.title),
        reflectionNote: reflections?.[0]?.note || ""
      });

      const summaryRef = doc(collection(firestore, `users/${user.uid}/summaries`));
      await setDoc(summaryRef, {
        title: result.title,
        content: result.summary,
        summaryDate: todayStr,
        createdAt: serverTimestamp(),
        ownerId: user.uid,
      });

      toast({
        title: "Adventure Archived! 📜",
        description: "Your daily wrap-up has been added to the Dynamo Archive.",
      });
    } catch (error) {
      console.error('Failed to generate summary:', error);
      toast({
        variant: "destructive",
        title: "Scribe's Block",
        description: "The archive scribe is busy. Try again in a moment!",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (completedTasks.length === 0 && !currentSummary) return null;

  return (
    <Card className="shadow-lg bg-card/80 backdrop-blur-md border-primary/20 overflow-hidden relative group/wrapup animate-in fade-in slide-in-from-right-8 duration-700">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <BookMarked className="text-primary h-5 w-5 group-hover/wrapup:rotate-12 transition-transform" />
            <CardTitle className="font-headline text-lg">Dynamo Archive</CardTitle>
          </div>
          {currentSummary && (
            <div className="text-[10px] font-black text-primary/60 uppercase tracking-widest border border-primary/20 px-2 py-0.5 rounded-full">
              Day Concluded
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        {currentSummary ? (
          <div className="space-y-4 animate-in zoom-in-95 duration-500">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 relative">
               <ScrollText className="absolute top-2 right-2 size-12 text-primary/5 rotate-12" />
               <h4 className="font-headline font-bold text-foreground mb-2">{currentSummary.title}</h4>
               <p className="text-sm italic text-muted-foreground leading-relaxed">
                 "{currentSummary.content}"
               </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
               <History className="size-3" /> Browsing History
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4 text-center">
            <p className="text-sm text-muted-foreground italic">
              You've conquered {completedTasks.length} tasks today. Ready to archive your adventure?
            </p>
            <Button 
              onClick={handleGenerateSummary} 
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg shadow-primary/20"
            >
              {isGenerating ? (
                <LoaderCircle className="animate-spin size-4 mr-2" />
              ) : (
                <Sparkles className="size-4 mr-2" />
              )}
              Generate Wrap-up
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

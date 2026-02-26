
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotebookPen, Save, CheckCircle2, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, serverTimestamp, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { format } from 'date-fns';
import type { DailyReflectionData } from '@/lib/types';

export function DailyReflection() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const reflectionsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, `users/${user.uid}/reflections`),
      where('reflectionDate', '==', todayStr)
    );
  }, [firestore, user, todayStr]);

  const { data: reflections, isLoading } = useCollection<DailyReflectionData>(reflectionsRef);

  const currentReflection = reflections?.[0];

  useEffect(() => {
    if (currentReflection) {
      setNote(currentReflection.note);
    }
  }, [currentReflection]);

  const handleSave = () => {
    if (!user || !firestore) return;
    setIsSaving(true);

    if (currentReflection) {
      const ref = doc(firestore, `users/${user.uid}/reflections/${currentReflection.id}`);
      updateDocumentNonBlocking(ref, { note, updatedAt: serverTimestamp() });
    } else {
      const col = collection(firestore, `users/${user.uid}/reflections`);
      addDocumentNonBlocking(col, {
        note,
        reflectionDate: todayStr,
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });
    }

    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
    }, 500);
  };

  return (
    <Card className="shadow-lg bg-card/80 backdrop-blur-sm border-primary/10 animate-in fade-in slide-in-from-right-8 duration-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <NotebookPen className="text-primary h-5 w-5" />
                <CardTitle className="font-headline text-lg">Dynamo Note</CardTitle>
            </div>
            {lastSaved && !isSaving && (
                <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase tracking-widest">
                    <CheckCircle2 className="size-3" /> Saved
                </div>
            )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea 
          placeholder="How did you conquer today? Any whimsical wins?"
          className="min-h-[120px] bg-background/40 border-primary/10 focus-visible:ring-primary/30 resize-none text-sm leading-relaxed"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button 
            onClick={handleSave} 
            disabled={isSaving || isLoading} 
            className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shadow-none"
        >
            {isSaving ? <LoaderCircle className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
            {currentReflection ? 'Update Reflection' : 'Save Reflection'}
        </Button>
      </CardContent>
    </Card>
  );
}

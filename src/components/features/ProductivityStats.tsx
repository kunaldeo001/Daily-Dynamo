
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Task } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function ProductivityStats() {
  const { user } = useUser();
  const firestore = useFirestore();

  const tasksCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/tasks`);
  }, [firestore, user]);

  const { data: tasks } = useCollection<Task>(tasksCollection);

  const stats = useMemo(() => {
    if (!tasks) return [];
    
    const counts = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + (task.isCompleted ? 1 : 0);
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Productive', value: counts['Productive'] || 0, color: 'hsl(var(--primary))' },
      { name: 'Self-Care', value: counts['Self-Care'] || 0, color: 'hsl(var(--accent))' },
      { name: 'Whimsical', value: counts['Whimsical'] || 0, color: 'hsl(var(--chart-4))' },
    ].filter(s => s.value > 0);
  }, [tasks]);

  const totalCompleted = useMemo(() => 
    tasks?.filter(t => t.isCompleted).length || 0
  , [tasks]);

  if (!tasks || tasks.length === 0 || totalCompleted === 0) return null;

  return (
    <Card className="shadow-lg bg-card/80 backdrop-blur-sm border-primary/10 animate-in fade-in slide-in-from-right-8 duration-700">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-primary h-5 w-5" />
          <CardTitle className="font-headline text-lg">Daily Momentum</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-[-100px] pointer-events-none pb-12">
          <div className="text-3xl font-bold font-headline">{totalCompleted}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Crushed</div>
        </div>
        <div className="flex justify-center gap-4 text-xs font-bold pt-4">
          {stats.map(s => (
            <div key={s.name} className="flex items-center gap-1">
              <div className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-muted-foreground">{s.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

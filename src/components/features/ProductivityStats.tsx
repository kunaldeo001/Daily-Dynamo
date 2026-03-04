
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, PieChart as PieIcon, Trophy, Star, ShieldCheck, Zap, Award, Flame } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Task } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

const ACHIEVEMENTS = [
  { id: 'whimsy', name: 'Whimsy Warrior', icon: Zap, threshold: 5, category: 'Whimsical', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'productive', name: 'Productivity Paladin', icon: ShieldCheck, threshold: 10, category: 'Productive', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'selfcare', name: 'Self-Care Sage', icon: Heart, threshold: 5, category: 'Self-Care', color: 'text-pink-500', bg: 'bg-pink-500/10' },
];

function Heart(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

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

  const userAchievements = useMemo(() => {
    if (!tasks) return [];
    const counts = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + (task.isCompleted ? 1 : 0);
      return acc;
    }, {} as Record<string, number>);

    return ACHIEVEMENTS.map(a => ({
      ...a,
      progress: (counts[a.category] || 0),
      isUnlocked: (counts[a.category] || 0) >= a.threshold
    })).filter(a => a.isUnlocked);
  }, [tasks]);

  const rankInfo = useMemo(() => {
    if (totalCompleted === 0) return { rank: 'Novice', icon: ShieldCheck, color: 'text-muted-foreground' };
    if (totalCompleted < 3) return { rank: 'Spark', icon: Star, color: 'text-yellow-400' };
    if (totalCompleted < 10) return { rank: 'Dynamo', icon: TrendingUp, color: 'text-primary' };
    return { rank: 'Legend', icon: Trophy, color: 'text-amber-500' };
  }, [totalCompleted]);

  if (!tasks || tasks.length === 0) return null;

  return (
    <Card className="shadow-lg bg-card/80 backdrop-blur-sm border-primary/10 animate-in fade-in slide-in-from-right-8 duration-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-primary h-5 w-5" />
            <CardTitle className="font-headline text-lg">Daily Momentum</CardTitle>
          </div>
          <div className={cn("flex items-center gap-1 text-[10px] font-black uppercase tracking-widest", rankInfo.color)}>
             <rankInfo.icon className="size-3" /> {rankInfo.rank}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {totalCompleted > 0 ? (
          <>
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

            {/* Achievements Section */}
            {userAchievements.length > 0 && (
              <div className="pt-4 border-t border-primary/10 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                   <Award className="size-3" /> Dynamo Badges
                </div>
                <div className="flex flex-wrap gap-2">
                   {userAchievements.map(a => (
                     <div key={a.id} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter border animate-in zoom-in-95", a.color, a.bg, `border-${a.color.split('-')[1]}/20`)}>
                        <a.icon className="size-3" /> {a.name}
                     </div>
                   ))}
                </div>
              </div>
            )}

            <div className="flex justify-center flex-wrap gap-4 text-xs font-bold pt-4">
              {stats.map(s => (
                <div key={s.name} className="flex items-center gap-1">
                  <div className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-muted-foreground">{s.name}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-12 text-center space-y-3">
             <div className="flex justify-center">
                <ShieldCheck className="size-12 text-muted-foreground/30" />
             </div>
             <p className="text-sm text-muted-foreground italic">
                No tasks conquered yet. Ignite a spark to begin!
             </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

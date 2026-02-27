'use client';

import { useMemo, useEffect, useState } from 'react';
import { AddTaskForm } from './AddTaskForm';
import { TaskItem } from './TaskItem';
import type { Task, TaskCategory, TaskPriority } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListTodo, Layers, Trash2, Zap, Trophy, Star, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function TaskContainer() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [celebratingQuest, setCelebratingQuest] = useState(false);

  const tasksCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/tasks`);
  }, [firestore, user]);

  const { data: tasks, isLoading: areTasksLoading } = useCollection<Task>(tasksCollection);

  const categories: TaskCategory[] = ['Productive', 'Self-Care', 'Whimsical'];

  const mainQuest = useMemo(() => {
    return tasks?.find(t => t.isMainQuest && !t.isCompleted);
  }, [tasks]);

  const tasksByCategory = useMemo(() => {
    const grouped: Record<TaskCategory, Task[]> = {
      'Productive': [],
      'Self-Care': [],
      'Whimsical': []
    };
    if (!tasks) return grouped;
    
    tasks.forEach(task => {
      if (grouped[task.category]) {
        grouped[task.category].push(task);
      }
    });

    Object.keys(grouped).forEach(cat => {
      grouped[cat as TaskCategory].sort((a, b) => {
        if (a.isMainQuest !== b.isMainQuest) return a.isMainQuest ? -1 : 1;
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        const priorityMap = { High: 3, Medium: 2, Low: 1 };
        const pA = a.priority || 'Medium';
        const pB = b.priority || 'Medium';
        if (priorityMap[pA] !== priorityMap[pB]) {
          return priorityMap[pB] - priorityMap[pA];
        }
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      });
    });

    return grouped;
  }, [tasks]);

  const overallProgress = useMemo(() => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.isCompleted).length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  const handleAddTask = (title: string, category: TaskCategory, priority: TaskPriority, duration: string, isMainQuest: boolean) => {
    if (title.trim() === '' || !tasksCollection || !user) return;
    
    const newTask = {
      title,
      category,
      priority,
      duration,
      isMainQuest,
      isCompleted: false,
      createdAt: serverTimestamp(),
      ownerId: user.uid,
    };
    addDocumentNonBlocking(tasksCollection, newTask);
    
    toast({
      title: "Task Ignited",
      description: `"${title}" has been added to your ${category} list.`,
    });
  };

  const handleToggleTask = (id: string) => {
    if (!firestore || !user) return;
    const task = tasks?.find(t => t.id === id);
    if (!task) return;
    
    const isNowCompleted = !task.isCompleted;
    const taskRef = doc(firestore, `users/${user.uid}/tasks/${id}`);
    updateDocumentNonBlocking(taskRef, { isCompleted: isNowCompleted });

    if (isNowCompleted && task.isMainQuest) {
      setCelebratingQuest(true);
      toast({
        title: "Main Quest Conquered! 🏆",
        description: `Legendary effort! "${task.title}" is complete.`,
      });
      setTimeout(() => setCelebratingQuest(false), 3000);
    }
  };

  const handleDeleteTask = (id: string) => {
    if (!firestore || !user) return;
    const taskRef = doc(firestore, `users/${user.uid}/tasks/${id}`);
    deleteDocumentNonBlocking(taskRef);
  };

  const handleClearCompleted = (category: TaskCategory) => {
    if (!firestore || !user || !tasks) return;
    const completedInCat = tasks.filter(t => t.category === category && t.isCompleted);
    completedInCat.forEach(task => {
      const taskRef = doc(firestore, `users/${user.uid}/tasks/${task.id}`);
      deleteDocumentNonBlocking(taskRef);
    });
  };
  
  if (isUserLoading || (user && areTasksLoading)) {
    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Overall Progress */}
      <div className="space-y-4 p-6 rounded-2xl bg-card/50 border border-primary/10 shadow-sm backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="text-primary h-4 w-4 animate-pulse" />
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Daily Conquest</h4>
            </div>
            <div className="flex items-center gap-1">
               {overallProgress === 100 && <Star className="size-4 text-yellow-500 fill-yellow-500 animate-bounce" />}
               <span className="text-xl font-headline font-bold text-primary">{overallProgress}%</span>
            </div>
          </div>
          <Progress value={overallProgress} className="h-3 bg-primary/5" />
        </div>
      </div>

      {/* Featured Main Quest */}
      {mainQuest && (
        <div className={cn(
          "relative p-1 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 shadow-lg transition-all duration-1000",
          celebratingQuest ? "scale-105 shadow-yellow-500/50" : "animate-sparkle"
        )}>
          <div className="bg-card rounded-[calc(1rem-2px)] p-6 space-y-4 relative overflow-hidden">
            {celebratingQuest && (
              <div className="absolute inset-0 bg-yellow-500/10 animate-pulse pointer-events-none" />
            )}
            <div className="flex items-center gap-2 text-yellow-600 font-black text-[10px] uppercase tracking-[0.3em]">
              <Trophy className="size-4 fill-yellow-500/20" /> {celebratingQuest ? "Quest Conquered" : "Active Main Quest"}
            </div>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground leading-tight">
                {mainQuest.title}
              </h2>
              <Button 
                onClick={() => handleToggleTask(mainQuest.id)} 
                className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shrink-0 group"
              >
                <Sparkles className="mr-2 size-4 group-hover:animate-spin" /> Conquer Quest
              </Button>
            </div>
            <div className="flex items-center gap-3">
               <Badge variant="outline" className="border-yellow-500/30 text-yellow-600 bg-yellow-500/5">
                 {mainQuest.duration || '30m'}
               </Badge>
               <Badge variant="outline" className="border-yellow-500/30 text-yellow-600 bg-yellow-500/5">
                 {mainQuest.priority || 'Medium'} ENERGY
               </Badge>
            </div>
          </div>
        </div>
      )}

      <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <div className="flex items-center gap-2">
              <ListTodo className="text-primary h-6 w-6" />
              <CardTitle className="font-headline text-2xl">
              Dynamo Central
              </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <AddTaskForm onAddTask={handleAddTask} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" />
                <h3 className="font-headline font-bold text-lg">{cat}</h3>
              </div>
              <div className="flex items-center gap-2">
                {tasksByCategory[cat].some(t => t.isCompleted) && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => handleClearCompleted(cat)}
                    title="Clear Completed"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
                <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                  {tasksByCategory[cat].length}
                </Badge>
              </div>
            </div>
            
            <ul className="space-y-3 min-h-[100px]">
              {tasksByCategory[cat].length === 0 ? (
                <li className="text-center text-muted-foreground py-12 text-sm italic bg-background/50 rounded-xl border border-dashed border-border/50">
                  Empty column...
                </li>
              ) : (
                tasksByCategory[cat].map((task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                  />
                ))
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

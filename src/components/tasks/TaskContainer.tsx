
'use client';

import { useMemo } from 'react';
import { AddTaskForm } from './AddTaskForm';
import { TaskItem } from './TaskItem';
import type { Task, TaskCategory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListTodo, Layers, Trash2, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function TaskContainer() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const tasksCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/tasks`);
  }, [firestore, user]);

  const { data: tasks, isLoading: areTasksLoading } = useCollection<Task>(tasksCollection);

  const categories: TaskCategory[] = ['Productive', 'Self-Care', 'Whimsical'];

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
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
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

  const handleAddTask = (title: string, category: TaskCategory) => {
    if (title.trim() === '' || !tasksCollection || !user) return;
    const newTask = {
      title,
      category,
      isCompleted: false,
      createdAt: serverTimestamp(),
      ownerId: user.uid,
    };
    addDocumentNonBlocking(tasksCollection, newTask);
  };

  const handleToggleTask = (id: string) => {
    if (!firestore || !user) return;
    const task = tasks?.find(t => t.id === id);
    if (!task) return;
    const taskRef = doc(firestore, `users/${user.uid}/tasks/${id}`);
    updateDocumentNonBlocking(taskRef, { isCompleted: !task.isCompleted });
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
      <div className="space-y-3 p-6 rounded-2xl bg-card/50 border border-primary/10 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-primary h-4 w-4 animate-pulse" />
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Daily Conquest</h4>
          </div>
          <span className="text-xl font-headline font-bold text-primary">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-3 bg-primary/5" />
      </div>

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

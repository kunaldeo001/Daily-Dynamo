'use client';

import { useMemo } from 'react';
import { AddTaskForm } from './AddTaskForm';
import { TaskList } from './TaskList';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListTodo } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function TaskContainer() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const tasksCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/tasks`);
  }, [firestore, user]);

  const { data: tasks, isLoading: areTasksLoading } = useCollection<Task>(tasksCollection);

  const handleAddTask = (title: string) => {
    if (title.trim() === '' || !tasksCollection || !user) return;
    const newTask = {
      title,
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
  
  if (isUserLoading || (user && areTasksLoading)) {
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
            <CardHeader>
                <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </CardContent>
        </Card>
    );
  }

  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    return [...tasks].sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      if (a.createdAt && b.createdAt) {
        return b.createdAt.seconds - a.createdAt.seconds;
      }
      return 0;
    });
  }, [tasks]);


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg bg-card/80 backdrop-blur-sm border-primary/20 animate-in fade-in slide-in-from-top-12 duration-500 delay-200">
      <CardHeader>
        <div className="flex items-center gap-2">
            <ListTodo className="text-primary" />
            <CardTitle className="font-headline">
            Today's Dynamo
            </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AddTaskForm onAddTask={handleAddTask} />
        <TaskList 
          tasks={sortedTasks} 
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
        />
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { AddTaskForm } from './AddTaskForm';
import { TaskList } from './TaskList';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListTodo } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const TASKS_STORAGE_KEY = 'daily-dynamo-tasks';

export function TaskContainer() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Failed to load tasks from localStorage", error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error("Failed to save tasks to localStorage", error);
      }
    }
  }, [tasks, isMounted]);

  const handleAddTask = (text: string) => {
    if (text.trim() === '') return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  if (!isMounted) {
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

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return b.createdAt - a.createdAt;
  });

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

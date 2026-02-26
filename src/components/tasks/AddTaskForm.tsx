
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Zap } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskCategory, TaskPriority } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AddTaskFormProps {
  onAddTask: (title: string, category: TaskCategory, priority: TaskPriority) => void;
}

export function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Productive');
  const [priority, setPriority] = useState<TaskPriority>('Medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '') return;
    onAddTask(title, category, priority);
    setTitle('');
  };

  const priorityColors = {
    Low: "text-blue-400",
    Medium: "text-yellow-500",
    High: "text-red-500"
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Conquer the world..."
          className="flex-grow focus-visible:ring-accent"
          aria-label="New task"
        />
        <Button type="submit" aria-label="Add task" className="bg-accent hover:bg-accent/90 w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Column:</span>
          <Select value={category} onValueChange={(val) => setCategory(val as TaskCategory)}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Productive">Productive</SelectItem>
              <SelectItem value="Self-Care">Self-Care</SelectItem>
              <SelectItem value="Whimsical">Whimsical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Energy:</span>
          <Select value={priority} onValueChange={(val) => setPriority(val as TaskPriority)}>
            <SelectTrigger className="w-[110px] h-8 text-xs">
              <div className="flex items-center gap-2">
                <Zap className={cn("size-3", priorityColors[priority])} />
                <SelectValue placeholder="Priority" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </form>
  );
}

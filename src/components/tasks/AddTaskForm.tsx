
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskCategory } from '@/lib/types';

interface AddTaskFormProps {
  onAddTask: (title: string, category: TaskCategory) => void;
}

export function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Productive');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '') return;
    onAddTask(title, category);
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Conquer the world..."
        className="flex-grow focus-visible:ring-accent"
        aria-label="New task"
      />
      <Select value={category} onValueChange={(val) => setCategory(val as TaskCategory)}>
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Productive">Productive</SelectItem>
          <SelectItem value="Self-Care">Self-Care</SelectItem>
          <SelectItem value="Whimsical">Whimsical</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" aria-label="Add task" className="bg-accent hover:bg-accent/90">
        <Plus className="mr-2 h-4 w-4" /> Add
      </Button>
    </form>
  );
}

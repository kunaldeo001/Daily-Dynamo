'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    // Timeout to allow animation to play
    setTimeout(() => {
      onDelete(task.id);
    }, 300);
  };
  
  return (
    <li
      className={cn(
        'group flex items-center gap-3 p-3 rounded-lg bg-background transition-all duration-300 animate-in fade-in slide-in-from-top-2',
        {
          'opacity-50': task.isCompleted,
          'animate-out fade-out slide-out-to-left-4': isDeleting,
        }
      )}
    >
      <Checkbox
        id={`task-${task.id}`}
        checked={task.isCompleted}
        onCheckedChange={() => onToggle(task.id)}
        className="size-5 rounded-full data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        aria-label={`Mark task as ${task.isCompleted ? 'incomplete' : 'complete'}`}
      />
      <label
        htmlFor={`task-${task.id}`}
        className={cn(
          'flex-grow text-foreground transition-all duration-300 cursor-pointer',
          {
            'line-through text-muted-foreground': task.isCompleted,
          }
        )}
      >
        {task.title}
      </label>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className="size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        aria-label={`Delete task: ${task.title}`}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}

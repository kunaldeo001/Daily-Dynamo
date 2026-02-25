
'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Trash2, Sparkles, LoaderCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { breakdownTask } from '@/ai/flows/breakdown-task-flow';
import { useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const handleBreakdown = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !firestore || task.breakdown) {
      setShowBreakdown(!showBreakdown);
      return;
    }

    setIsBreakingDown(true);
    try {
      const result = await breakdownTask({ taskTitle: task.title });
      const taskRef = doc(firestore, `users/${user.uid}/tasks/${task.id}`);
      const breakdownText = result.steps.join('\n');
      updateDocumentNonBlocking(taskRef, { breakdown: breakdownText });
      setShowBreakdown(true);
    } catch (error) {
      console.error('Failed to break down task:', error);
    } finally {
      setIsBreakingDown(false);
    }
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(task.id);
    }, 300);
  };
  
  return (
    <div className="space-y-2">
      <li
        className={cn(
          'group flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 transition-all duration-300 animate-in fade-in slide-in-from-top-2 hover:shadow-md hover:border-primary/20',
          {
            'opacity-60 grayscale-[0.5]': task.isCompleted,
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
            'flex-grow text-sm font-medium transition-all duration-300 cursor-pointer',
            {
              'line-through text-muted-foreground': task.isCompleted,
            }
          )}
        >
          {task.title}
        </label>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBreakdown}
            disabled={isBreakingDown}
            className="size-8 rounded-full text-primary hover:bg-primary/10"
            title="AI Breakdown"
          >
            {isBreakingDown ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            aria-label="Delete task"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </li>
      
      {showBreakdown && task.breakdown && (
        <div className="ml-8 p-3 bg-primary/5 rounded-lg border border-primary/10 text-xs text-primary-foreground/80 space-y-2 animate-in slide-in-from-top-2 duration-300">
          <div className="font-bold flex items-center gap-1 text-[10px] uppercase tracking-widest text-primary/60">
            <Zap className="size-3" /> Wizard's Plan
          </div>
          <ul className="list-disc list-inside space-y-1">
            {task.breakdown.split('\n').map((step, i) => (
              <li key={i} className="leading-tight">{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const Zap = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.71 13 4.5l-2 8.5 9-1.21-12 10.21 2-8.5-10 1.21Z"/></svg>
);

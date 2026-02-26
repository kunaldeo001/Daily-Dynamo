
'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Trash2, Sparkles, LoaderCircle, Zap, CheckCircle2 } from 'lucide-react';
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

  const handleToggleWhimsy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !firestore) return;
    const taskRef = doc(firestore, `users/${user.uid}/tasks/${task.id}`);
    updateDocumentNonBlocking(taskRef, { isWhimsical: !task.isWhimsical });
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
          'group flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 transition-all duration-300 animate-in fade-in slide-in-from-top-2 hover:shadow-md',
          task.isWhimsical && "bg-gradient-to-r from-card to-accent/5 border-accent/30",
          {
            'opacity-60 grayscale-[0.5]': task.isCompleted,
            'animate-out fade-out slide-out-to-left-4': isDeleting,
            'hover:border-primary/20': !task.isWhimsical,
          }
        )}
      >
        <Checkbox
          id={`task-${task.id}`}
          checked={task.isCompleted}
          onCheckedChange={() => onToggle(task.id)}
          className="size-5 rounded-full data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-transform duration-300 data-[state=checked]:scale-110"
          aria-label={`Mark task as ${task.isCompleted ? 'incomplete' : 'complete'}`}
        />
        <label
          htmlFor={`task-${task.id}`}
          className={cn(
            'flex-grow text-sm font-medium transition-all duration-300 cursor-pointer select-none',
            {
              'line-through text-muted-foreground': task.isCompleted,
            },
            task.isWhimsical && !task.isCompleted && "text-accent italic"
          )}
        >
          {task.title}
        </label>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleWhimsy}
            className={cn("size-8 rounded-full transition-colors", task.isWhimsical ? "text-accent bg-accent/10" : "text-muted-foreground hover:bg-accent/10")}
            title="Toggle Whimsy"
          >
            <Zap className={cn("size-4", task.isWhimsical && "fill-accent")} />
          </Button>
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
        <div className="ml-8 p-3 bg-primary/5 rounded-lg border border-primary/10 text-xs text-primary-foreground/80 space-y-3 animate-in slide-in-from-top-2 duration-300 shadow-inner">
          <div className="font-bold flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-primary/60">
            <Zap className="size-3 fill-primary/30" /> Wizard's Plan
          </div>
          <div className="space-y-2">
            {task.breakdown.split('\n').map((step, i) => (
              <div key={i} className="flex items-start gap-2 group/step">
                <CheckCircle2 className="size-3 mt-0.5 text-primary/40 group-hover/step:text-primary transition-colors" />
                <span className="leading-tight flex-1">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

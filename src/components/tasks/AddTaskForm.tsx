
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Zap, Trophy, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskCategory, TaskPriority } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface AddTaskFormProps {
  onAddTask: (title: string, category: TaskCategory, priority: TaskPriority, duration: string, isMainQuest: boolean) => void;
}

export function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Productive');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [duration, setDuration] = useState('30m');
  const [isMainQuest, setIsMainQuest] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '') return;
    onAddTask(title, category, priority, duration, isMainQuest);
    setTitle('');
    setIsMainQuest(false);
  };

  const priorityColors = {
    Low: "text-blue-400",
    Medium: "text-yellow-500",
    High: "text-red-500"
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's your next win?"
          className="flex-grow focus-visible:ring-accent h-12 text-lg"
          aria-label="New task"
        />
        <Button type="submit" aria-label="Add task" className="bg-accent hover:bg-accent/90 w-full sm:w-auto h-12 px-6">
          <Plus className="mr-2 h-5 w-5" /> Add Task
        </Button>
      </div>
      
      <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-background/50 border border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Column:</span>
          <Select value={category} onValueChange={(val) => setCategory(val as TaskCategory)}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
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
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Energy:</span>
          <Select value={priority} onValueChange={(val) => setPriority(val as TaskPriority)}>
            <SelectTrigger className="w-[120px] h-9 text-xs">
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

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Time:</span>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className="w-[100px] h-9 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="size-3 text-muted-foreground" />
                <SelectValue placeholder="Duration" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15m">15m</SelectItem>
              <SelectItem value="30m">30m</SelectItem>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="2h+">2h+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 border-l border-border/50 pl-6 ml-auto">
          <Label htmlFor="main-quest" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest cursor-pointer select-none">
            <Trophy className={cn("size-4 transition-colors", isMainQuest ? "text-yellow-500" : "text-muted-foreground")} />
            Main Quest
          </Label>
          <Switch 
            id="main-quest" 
            checked={isMainQuest} 
            onCheckedChange={setIsMainQuest} 
            className="data-[state=checked]:bg-yellow-500"
          />
        </div>
      </div>
    </form>
  );
}

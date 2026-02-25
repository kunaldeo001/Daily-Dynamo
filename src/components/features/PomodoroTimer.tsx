
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleModeSwitch();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleModeSwitch = () => {
    if (mode === 'work') {
      setMode('break');
      setTimeLeft(BREAK_TIME);
    } else {
      setMode('work');
      setTimeLeft(WORK_TIME);
    }
    setIsActive(false);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? WORK_TIME : BREAK_TIME);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (mode === 'work' ? WORK_TIME : BREAK_TIME)) * 100;

  return (
    <Card className="shadow-lg bg-card/80 backdrop-blur-sm border-accent/20 sticky top-8 animate-in fade-in slide-in-from-right-8 duration-700">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Timer className="text-accent h-5 w-5" />
          <CardTitle className="font-headline text-lg">Focus Dynamo</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="space-y-2">
          <div className="text-5xl font-headline font-bold tabular-nums text-foreground tracking-tighter">
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {mode === 'work' ? 'Time to Conquer' : 'Quick Recharge'}
          </div>
        </div>

        <Progress value={progress} className="h-2 bg-accent/10" />

        <div className="flex justify-center gap-2">
          <Button onClick={toggleTimer} variant={isActive ? "outline" : "default"} className={isActive ? "" : "bg-accent hover:bg-accent/90"}>
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="ml-2">{isActive ? 'Pause' : 'Start'}</span>
          </Button>
          <Button onClick={resetTimer} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex justify-center gap-4 text-xs font-medium">
          <button 
            onClick={() => { setMode('work'); setTimeLeft(WORK_TIME); setIsActive(false); }}
            className={`pb-1 border-b-2 transition-colors ${mode === 'work' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground'}`}
          >
            WORK
          </button>
          <button 
            onClick={() => { setMode('break'); setTimeLeft(BREAK_TIME); setIsActive(false); }}
            className={`pb-1 border-b-2 transition-colors ${mode === 'break' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground'}`}
          >
            BREAK
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

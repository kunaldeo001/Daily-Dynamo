
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Timer, Volume2, VolumeX } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const playNotification = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5); // A4
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio context failed', e);
    }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      playNotification();
      handleModeSwitch();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleModeSwitch = () => {
    const newMode = mode === 'work' ? 'break' : 'work';
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? WORK_TIME : BREAK_TIME);
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

  const totalTime = mode === 'work' ? WORK_TIME : BREAK_TIME;
  const progress = (timeLeft / totalTime) * 100;

  return (
    <Card className="shadow-lg bg-card/80 backdrop-blur-sm border-accent/20 sticky top-8 animate-in fade-in slide-in-from-right-8 duration-700 overflow-hidden">
      <div className={cn(
        "absolute top-0 left-0 w-full h-1 transition-colors duration-500",
        mode === 'work' ? "bg-primary" : "bg-accent"
      )} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="text-accent h-5 w-5" />
            <CardTitle className="font-headline text-lg">Focus Dynamo</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="space-y-2">
          <div className="text-5xl font-headline font-bold tabular-nums text-foreground tracking-tighter">
            {formatTime(timeLeft)}
          </div>
          <div className={cn(
            "text-xs font-bold uppercase tracking-widest",
            mode === 'work' ? "text-primary" : "text-accent"
          )}>
            {mode === 'work' ? 'Time to Conquer' : 'Quick Recharge'}
          </div>
        </div>

        <Progress value={progress} className="h-2 bg-muted" />

        <div className="flex justify-center gap-2">
          <Button onClick={toggleTimer} variant={isActive ? "outline" : "default"} className={cn("w-28", isActive ? "" : "bg-accent hover:bg-accent/90")}>
            {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={resetTimer} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex justify-center gap-4 text-[10px] font-black tracking-widest">
          <button 
            onClick={() => { setMode('work'); setTimeLeft(WORK_TIME); setIsActive(false); }}
            className={`pb-1 border-b-2 transition-all ${mode === 'work' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground opacity-50'}`}
          >
            FOCUS
          </button>
          <button 
            onClick={() => { setMode('break'); setTimeLeft(BREAK_TIME); setIsActive(false); }}
            className={`pb-1 border-b-2 transition-all ${mode === 'break' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground opacity-50'}`}
          >
            RELAX
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

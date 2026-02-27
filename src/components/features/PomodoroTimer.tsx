'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Timer, Volume2, VolumeX, Settings2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function PomodoroTimer() {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const playNotification = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio feedback failed', e);
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
    setTimeLeft(newMode === 'work' ? workMinutes * 60 : breakMinutes * 60);
    setIsActive(false);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const totalTime = mode === 'work' ? workMinutes * 60 : breakMinutes * 60;
  const progress = (timeLeft / totalTime) * 100;

  const updateSettings = () => {
    resetTimer();
    setShowSettings(false);
  };

  return (
    <Card className="shadow-lg bg-card/80 backdrop-blur-sm border-accent/20 animate-in fade-in slide-in-from-right-8 duration-700 overflow-hidden relative">
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
          <div className="flex gap-1">
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground"
                onClick={() => setShowSettings(!showSettings)}
            >
                <Settings2 className="h-4 w-4" />
            </Button>
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground"
                onClick={() => setSoundEnabled(!soundEnabled)}
            >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        {showSettings ? (
            <div className="space-y-4 p-4 rounded-xl bg-background/50 border border-border/50 animate-in zoom-in-95 duration-200">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Focus (min)</label>
                        <Input 
                            type="number" 
                            value={workMinutes} 
                            onChange={(e) => setWorkMinutes(Number(e.target.value))}
                            className="h-8 text-center"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Break (min)</label>
                        <Input 
                            type="number" 
                            value={breakMinutes} 
                            onChange={(e) => setBreakMinutes(Number(e.target.value))}
                            className="h-8 text-center"
                        />
                    </div>
                </div>
                <Button size="sm" className="w-full bg-accent hover:bg-accent/90" onClick={updateSettings}>Save Settings</Button>
            </div>
        ) : (
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
        )}

        {!showSettings && <Progress value={progress} className="h-2 bg-muted" />}

        {!showSettings && (
            <div className="flex justify-center gap-2">
                <Button onClick={toggleTimer} variant={isActive ? "outline" : "default"} className={cn("w-28", isActive ? "" : "bg-accent hover:bg-accent/90")}>
                    {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {isActive ? 'Pause' : 'Start'}
                </Button>
                <Button onClick={resetTimer} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>
        )}
        
        {!showSettings && (
            <div className="flex justify-center gap-4 text-[10px] font-black tracking-widest">
                <button 
                    onClick={() => { setMode('work'); setTimeLeft(workMinutes * 60); setIsActive(false); }}
                    className={`pb-1 border-b-2 transition-all ${mode === 'work' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground opacity-50'}`}
                >
                    FOCUS
                </button>
                <button 
                    onClick={() => { setMode('break'); setTimeLeft(breakMinutes * 60); setIsActive(false); }}
                    className={`pb-1 border-b-2 transition-all ${mode === 'break' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground opacity-50'}`}
                >
                    RELAX
                </button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

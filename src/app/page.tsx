
'use client';
import { Header } from '@/components/layout/Header';
import { DailySpark } from '@/components/ai/DailySpark';
import { TaskContainer } from '@/components/tasks/TaskContainer';
import { PomodoroTimer } from '@/components/features/PomodoroTimer';
import { ProductivityStats } from '@/components/features/ProductivityStats';
import { DailyReflection } from '@/components/features/DailyReflection';
import { DailyWrapUp } from '@/components/features/DailyWrapUp';
import { useUser } from '@/firebase';
import { AuthForm } from '@/components/auth/AuthForm';
import { LoaderCircle } from 'lucide-react';

export default function Home() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle className="animate-spin text-primary h-12 w-12" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen container mx-auto px-4 py-8">
        <Header />
        <AuthForm />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent font-body text-foreground">
      <div className="container mx-auto px-4 py-8 space-y-12">
        <Header />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            <DailySpark />
            <TaskContainer />
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-8">
            <PomodoroTimer />
            <ProductivityStats />
            <DailyWrapUp />
            <DailyReflection />
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-white/5 text-center space-y-2">
              <h4 className="font-headline font-bold text-lg">Daily Dynamo Tip</h4>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "Small sparks ignite big dynamos. Take one whimsical action today to keep the fire burning!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

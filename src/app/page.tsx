
'use client';
import { Header } from '@/components/layout/Header';
import { DailySpark } from '@/components/ai/DailySpark';
import { TaskContainer } from '@/components/tasks/TaskContainer';
import { PomodoroTimer } from '@/components/features/PomodoroTimer';
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <DailySpark />
            <TaskContainer />
          </div>
          <div className="lg:col-span-1">
            <PomodoroTimer />
          </div>
        </div>
      </div>
    </main>
  );
}

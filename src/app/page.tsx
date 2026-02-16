'use client';
import { Header } from '@/components/layout/Header';
import { DailySpark } from '@/components/ai/DailySpark';
import { TaskContainer } from '@/components/tasks/TaskContainer';
import { useUser } from '@/firebase';
import { AuthForm } from '@/components/auth/AuthForm';
import { LoaderCircle } from 'lucide-react';


export default function Home() {
  const { user, isUserLoading } = useUser();

  const renderContent = () => {
    if (isUserLoading) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
          <LoaderCircle className="animate-spin text-primary h-12 w-12" />
        </div>
      );
    }
    if (!user) {
      return <AuthForm />;
    }
    return (
      <>
        <DailySpark />
        <TaskContainer />
      </>
    );
  };

  return (
    <main className="min-h-screen bg-transparent font-body text-foreground">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Header />
        {renderContent()}
      </div>
    </main>
  );
}

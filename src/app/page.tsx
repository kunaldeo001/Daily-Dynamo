import { Header } from '@/components/layout/Header';
import { DailySpark } from '@/components/ai/DailySpark';
import { TaskContainer } from '@/components/tasks/TaskContainer';

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent font-body text-foreground">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Header />
        <DailySpark />
        <TaskContainer />
      </div>
    </main>
  );
}

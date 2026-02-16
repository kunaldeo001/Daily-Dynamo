'use client';

import { useState } from 'react';
import { Sparkles, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { aiDailySpark } from '@/ai/flows/ai-daily-spark-flow';

export function DailySpark() {
  const [spark, setSpark] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSpark = async () => {
    setIsLoading(true);
    setSpark('');
    try {
      const result = await aiDailySpark();
      setSpark(result.suggestion);
    } catch (error) {
      console.error('Failed to generate daily spark:', error);
      setSpark('Could not get a spark. Try again!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg bg-card/80 backdrop-blur-sm border-primary/20 animate-in fade-in slide-in-from-top-8 duration-500 delay-100">
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            <CardTitle className="font-headline">
            AI Daily Spark
            </CardTitle>
        </div>
        <Button onClick={handleGenerateSpark} disabled={isLoading} size="sm">
          {isLoading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Sparkles className="mr-2 size-4" />
          )}
          New Spark
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-center text-lg min-h-[5rem] flex items-center justify-center p-4 rounded-lg bg-background">
          {isLoading && <LoaderCircle className="animate-spin text-primary" />}
          {!isLoading && spark && (
            <p className="animate-in fade-in-50 duration-500">{spark}</p>
          )}
          {!isLoading && !spark && (
            <p className="text-muted-foreground">
              Click "New Spark" for a quirky daily challenge!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

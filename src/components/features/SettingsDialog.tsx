
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { User, Shield, Timer, Sparkles, LoaderCircle, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [dailyMotto, setDailyMotto] = useState('');
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [isSaving, setIsSaving] = useState(false);

  const userRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: profile, isLoading } = useDoc<any>(userRef);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setDailyMotto(profile.dailyMotto || '');
      setWorkMinutes(profile.pomodoroWorkMinutes || 25);
      setBreakMinutes(profile.pomodoroBreakMinutes || 5);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user || !firestore) return;
    setIsSaving(true);
    
    try {
      const data = {
        displayName,
        dailyMotto,
        pomodoroWorkMinutes: workMinutes,
        pomodoroBreakMinutes: breakMinutes,
        email: user.email,
        updatedAt: new Date().toISOString()
      };
      
      const ref = doc(firestore, 'users', user.uid);
      await setDoc(ref, data, { merge: true });
      
      toast({
        title: "Dynamo Updated! ⚡️",
        description: "Your settings have been successfully synchronized.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not save your preferences. Try again!",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-card/95 backdrop-blur-xl border-primary/20 shadow-2xl overflow-hidden">
        <DialogHeader className="p-6 bg-primary/5 border-b border-primary/10">
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Sparkles className="text-primary size-6" /> Dynamo Settings
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Customize your interaction with the Daily Dynamo universe.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="size-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="timer" className="flex items-center gap-2">
                <Timer className="size-4" /> Timer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    Display Name
                  </Label>
                  <Input 
                    id="display-name" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Captain Spark"
                    className="bg-background/50 border-primary/10 focus-visible:ring-primary/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily-motto" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Daily Motto
                  </Label>
                  <Input 
                    id="daily-motto" 
                    value={dailyMotto} 
                    onChange={(e) => setDailyMotto(e.target.value)}
                    placeholder="e.g. Small sparks, big fires."
                    className="bg-background/50 border-primary/10 focus-visible:ring-primary/30"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timer" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Focus Duration</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={workMinutes} 
                      onChange={(e) => setWorkMinutes(parseInt(e.target.value))}
                      className="text-center bg-background/50 border-primary/10"
                    />
                    <span className="text-xs text-muted-foreground font-bold">MIN</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Break Duration</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={breakMinutes} 
                      onChange={(e) => setBreakMinutes(parseInt(e.target.value))}
                      className="text-center bg-background/50 border-primary/10"
                    />
                    <span className="text-xs text-muted-foreground font-bold">MIN</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic text-center">
                These settings will become your default when starting the Focus Dynamo.
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <Separator className="bg-primary/10" />

        <DialogFooter className="p-6 bg-primary/5 flex sm:justify-between items-center gap-4">
          <div className="text-[10px] flex items-center gap-2 text-muted-foreground font-medium">
            <Shield className="size-3" /> Data is encrypted and private
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || isLoading} 
              className="bg-primary hover:bg-primary/90 text-white min-w-[120px] shadow-lg shadow-primary/20"
            >
              {isSaving ? (
                <>
                  <LoaderCircle className="size-4 animate-spin mr-2" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

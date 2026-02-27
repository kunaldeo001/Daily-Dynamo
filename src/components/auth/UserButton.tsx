
'use client';
import { useAuth, useUser, useDoc, useMemoFirebase } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '../ui/button';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { SettingsDialog } from '../features/SettingsDialog';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

export function UserButton() {
  const { user } = useUser();
  const auth = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    const db = (auth as any).app.options.projectId ? (auth as any).config.firestore : null; // Fallback logic is complex, better to use the firestore from hook if possible, but UserButton is simple.
    // In our setup, we should use the useFirestore hook inside components.
    return null; // We will use useDoc inside the SettingsDialog instead to keep this light.
  }, [user]);

  if (!user) {
    return null;
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-primary/20 hover:border-primary/50 transition-all p-0 overflow-hidden">
            <Avatar className="h-full w-full">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'user'} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold">
                {getInitials(user.displayName || user.email)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-2 bg-card/95 backdrop-blur-md border-primary/20 shadow-2xl" align="end" forceMount>
          <DropdownMenuLabel className="font-normal p-4">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-bold leading-none text-foreground">{user.displayName || 'Anonymous Dynamo'}</p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user.isAnonymous ? 'Guest Mode' : user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-primary/10" />
          <DropdownMenuItem 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors"
          >
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Settings className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Settings</span>
              <span className="text-[10px] text-muted-foreground">Customize your Dynamo</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-primary/10" />
          <DropdownMenuItem 
            onClick={() => auth.signOut()}
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <div className="p-1.5 rounded-md bg-muted text-muted-foreground group-hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm">Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}

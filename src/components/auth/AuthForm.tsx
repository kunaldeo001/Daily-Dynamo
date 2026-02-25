'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase';
import {
  initiateEmailSignUp,
  initiateEmailSignIn,
  initiateAnonymousSignIn,
} from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/auth';

export function AuthForm() {
  const auth = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('1234');

  const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please check your email and password and try again.';
      case 'auth/email-already-in-use':
        return 'This email is already in use by another account.';
      case 'auth/weak-password':
        return 'The password is too weak. Please use a stronger password.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const handleAuthError = (error: FirebaseError) => {
    toast({
      variant: 'destructive',
      title: 'Authentication Failed',
      description: getAuthErrorMessage(error.code),
    });
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    initiateEmailSignUp(auth, email, password, handleAuthError);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    initiateEmailSignIn(auth, email, password, handleAuthError);
  };

  const handleAnonymousSignIn = () => {
    initiateAnonymousSignIn(auth, handleAuthError);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
    <Tabs defaultValue="signin" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="signin">
        <form onSubmit={handleSignIn}>
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Sign in to your Daily Dynamo account to see your tasks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input id="signin-email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input id="signin-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button className="w-full" type="submit">Sign In</Button>
            </CardFooter>
          </Card>
        </form>
      </TabsContent>
      <TabsContent value="signup">
        <form onSubmit={handleSignUp}>
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>
                Create an account to start planning your day.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit">Create Account</Button>
            </CardFooter>
          </Card>
        </form>
      </TabsContent>
       <div className="relative mt-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue as
            </span>
          </div>
        </div>
        <div className="mt-4">
            <Button variant="outline" className="w-full" onClick={handleAnonymousSignIn}>
                Guest
            </Button>
        </div>
    </Tabs>
    </div>
  );
}
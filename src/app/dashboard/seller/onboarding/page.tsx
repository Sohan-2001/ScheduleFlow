'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import type { Seller } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchSellerDetails = async () => {
      if (user) {
        setIsFetching(true);
        const sellerDocRef = doc(db, 'sellers', user.uid);
        const docSnap = await getDoc(sellerDocRef);
        if (docSnap.exists()) {
          const sellerData = docSnap.data() as Seller;
          setName(sellerData.name || '');
          setTitle(sellerData.title || '');
          setDescription(sellerData.description || '');
        }
        setIsFetching(false);
      }
    };
    fetchSellerDetails();
  }, [user]);

  if (authLoading || isFetching) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }
  
  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
        const sellerDocRef = doc(db, 'sellers', user.uid);
        await setDoc(sellerDocRef, { name, title, description }, { merge: true });

        toast({
            title: 'Profile Saved!',
            description: 'Your details have been saved successfully.',
        });

        setTimeout(() => {
            router.push('/dashboard/seller');
        }, 1000);
    } catch (error) {
        console.error("Error saving seller details: ", error);
        toast({
            title: 'Error',
            description: 'Could not save your details. Please try again.',
            variant: 'destructive',
        });
        setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome, Seller!</CardTitle>
          <CardDescription>
            Let's get your profile set up so buyers can find you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g., Dr. Jane Smith" 
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Your Title or Profession</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g., Dentist, Financial Advisor" 
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Service Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Tell potential buyers about your expertise, experience, and what makes your service unique." 
              rows={5}
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleSave} className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save and Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

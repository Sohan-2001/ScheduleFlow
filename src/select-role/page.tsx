'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { RoleSelection } from '@/components/auth/role-selection';
import { Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Seller } from '@/lib/types';


export default function SelectRolePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is not logged in or already has a role, redirect
    if (!loading && (!user || user.role)) {
      router.push(user ? `/dashboard/${user.role}` : '/');
    }
  }, [user, loading, router]);

  const handleSelectRole = async (role: 'buyer' | 'seller') => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { role: role, email: user.email }, { merge: true });

      if (role === 'seller') {
        // If the user is a new seller, ensure their skeleton record exists in the 'sellers' collection
        const sellerDocRef = doc(db, 'sellers', user.uid);
        const newSeller: Omit<Seller, 'id'> = {
            name: user.email || 'New Seller',
            title: 'Professional',
            description: 'Describe your services here.',
            image: `https://picsum.photos/seed/${user.uid}/400/400`,
        };
        await setDoc(sellerDocRef, newSeller, { merge: true });
        
        router.push(`/dashboard/seller/onboarding`);
      } else {
        router.push(`/dashboard/${role}`);
      }
    } catch (error) {
        console.error("Error setting user role: ", error);
    }
  };

  if (loading || !user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <RoleSelection onSelectRole={handleSelectRole} />
    </main>
  );
}

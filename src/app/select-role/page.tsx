'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { RoleSelection } from '@/components/auth/role-selection';
import { Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { sellers as initialSellers } from '@/lib/data';
import type { Seller } from '@/lib/types';


export default function SelectRolePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sellers, setSellers] = useLocalStorage<Seller[]>('schedule-flow-sellers', []);

  useEffect(() => {
    // If user is not logged in or already has a role, redirect
    if (!loading && (!user || user.role)) {
      router.push(user ? `/dashboard/${user.role}` : '/');
    }
  }, [user, loading, router]);

  const handleSelectRole = async (role: 'buyer' | 'seller') => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), { role: role, email: user.email });

      if (role === 'seller') {
        // If the user is a new seller, ensure their skeleton record exists
        const sellerExists = sellers.some(s => s.id === user.uid);
        if (!sellerExists) {
            const newSeller: Seller = initialSellers.find(s => s.id === 'seller-1') 
            ? { ...initialSellers.find(s => s.id === 'seller-1')!, id: user.uid, name: user.email || 'New Seller' }
            : {
                id: user.uid,
                name: user.email || 'New Seller',
                title: 'Professional',
                description: 'Describe your services here.',
                image: 'https://picsum.photos/seed/default/400/400',
              };
            setSellers([...sellers, newSeller]);
        }
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

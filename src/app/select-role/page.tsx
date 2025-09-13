'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { RoleSelection } from '@/components/auth/role-selection';
import { Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
      await setDoc(doc(db, 'users', user.uid), { role: role, email: user.email });
      router.push(`/dashboard/${role}`);
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

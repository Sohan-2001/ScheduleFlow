'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { RoleSelection } from '@/components/auth/role-selection';
import { Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';

export default function HomePage() {
  const [user, setUser] = useLocalStorage<User | null>('schedule-flow-user', null);
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // A small delay to prevent flash of content
    const timer = setTimeout(() => {
      if (user?.role) {
        router.push(`/dashboard/${user.role}`);
      } else {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user, router]);

  if (isChecking) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="flex items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading your experience...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <RoleSelection setUser={setUser} />
    </main>
  );
}

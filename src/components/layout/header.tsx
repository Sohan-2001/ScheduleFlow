'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { signOut, getAuth } from 'firebase/auth';
import { LogOut, Sparkles } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const { user } = useAuth();
  const auth = getAuth();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="container flex h-16 items-center justify-between">
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => router.push(user ? `/dashboard/${user.role}`: '/')}
        >
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">ScheduleFlow</h1>
        </div>
        <div className="flex items-center gap-4">
          {user?.role && (
            <span className="hidden rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground sm:inline-block">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
